import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { PostsResponse, PostWithUser, CommentWithUser } from "@/lib/types";

/**
 * @file app/api/posts/route.ts
 * @description 게시물 API 라우트
 *
 * GET /api/posts - 게시물 목록 조회 (페이지네이션 지원)
 *
 * 쿼리 파라미터:
 * - limit: 페이지당 게시물 수 (기본값: 10, 최대: 50)
 * - offset: 건너뛸 게시물 수 (기본값: 0)
 *
 * 응답 형식:
 * {
 *   posts: PostWithUser[],
 *   hasMore: boolean,
 *   total: number
 * }
 */

export async function GET(request: NextRequest) {
  try {
    console.group("[API] GET /api/posts");
    console.log("Request received");

    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.error("Unauthorized: No user ID");
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    console.log("User authenticated:", userId);

    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    // 기본값 설정 및 검증
    const limit = Math.min(
      Math.max(parseInt(limitParam || "10", 10), 1),
      50
    );
    const offset = Math.max(parseInt(offsetParam || "0", 10), 0);

    console.log("Pagination params:", { limit, offset });

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();
    console.log("Supabase client created");

    // 1. post_stats 뷰에서 게시물 목록 조회 (좋아요 수, 댓글 수 포함)
    console.log("Querying post_stats view with range:", { offset, limit, end: offset + limit - 1 });
    const { data: postsData, error: postsError } = await supabase
      .from("post_stats")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      console.error("Database error (posts):", postsError);
      console.error("Error code:", postsError.code);
      console.error("Error message:", postsError.message);
      console.error("Error details:", postsError.details);
      console.error("Error hint:", postsError.hint);
      return NextResponse.json(
        { error: "게시물을 불러오는데 실패했습니다.", details: postsError.message },
        { status: 500 }
      );
    }

    if (!postsData || postsData.length === 0) {
      console.log("No posts found in post_stats view");
      // posts 테이블에서 직접 확인
      const { data: directPostsData, error: directError } = await supabase
        .from("posts")
        .select("id, user_id, image_url, caption, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (directError) {
        console.error("Error checking posts table directly:", directError);
      } else {
        console.log("Posts table has", directPostsData?.length || 0, "posts");
      }
      
      return NextResponse.json({
        posts: [],
        hasMore: false,
        total: 0,
      } satisfies PostsResponse);
    }

    console.log(`Found ${postsData.length} posts from post_stats`);
    console.log("Sample post data:", postsData[0] ? {
      post_id: postsData[0].post_id,
      id: postsData[0].id,
      user_id: postsData[0].user_id,
      has_image: !!postsData[0].image_url,
      has_caption: !!postsData[0].caption,
      allKeys: Object.keys(postsData[0]),
    } : "No posts");

    // 2. 사용자 정보 JOIN을 위해 user_id 목록 수집
    const userIds = [...new Set(postsData.map((post) => post.user_id))];

    // 3. 사용자 정보 조회
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, clerk_id, name, created_at")
      .in("id", userIds);

    if (usersError) {
      console.error("Database error (users):", usersError);
      return NextResponse.json(
        { error: "사용자 정보를 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    console.log(`Found ${usersData?.length || 0} users`);

    // 4. 사용자 정보를 Map으로 변환 (빠른 조회를 위해)
    const usersMap = new Map(
      (usersData || []).map((user) => [user.id, user])
    );

    // 5. 현재 사용자가 좋아요한 게시물 ID 목록 조회
    // Clerk userId로 users 테이블에서 user_id 조회
    const { data: currentUserData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    let likedPostIds: string[] = [];
    if (currentUserData?.id) {
      // post_stats 뷰는 post_id를 반환하므로 post.post_id 사용
      const postIds = postsData.map((post) => post.post_id || post.id);
      const { data: userLikesData, error: likesError } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", currentUserData.id)
        .in("post_id", postIds);

      if (likesError) {
        console.warn("Error fetching likes (non-critical):", likesError);
        // 좋아요 정보는 필수가 아니므로 에러를 무시하고 계속 진행
      } else {
        likedPostIds = (userLikesData || []).map((like) => like.post_id);
      }
    }

    console.log(`Found ${likedPostIds.length} liked posts by current user`);
    console.log("Liked post IDs:", likedPostIds);

    // 6. 댓글 미리보기 조회 (배치 조회로 성능 최적화)
    // post_stats 뷰는 post_id를 반환하므로 post.post_id 사용
    const postIds = postsData.map((post) => post.post_id || post.id);
    const commentsByPostId = new Map<string, CommentWithUser[]>();
    
    // 게시물이 있을 때만 댓글 조회
    if (postIds.length > 0) {
      // 댓글 조회 (users 테이블 JOIN)
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select(`
          id,
          post_id,
          user_id,
          content,
          created_at,
          updated_at,
          users!comments_user_id_fkey(id, clerk_id, name, created_at)
        `)
        .in("post_id", postIds)
        .order("created_at", { ascending: false });

      // 댓글 조회 실패 시 경고만 출력하고 계속 진행 (비필수 데이터)
      if (commentsError) {
        console.warn("Error fetching comments (non-critical):", commentsError);
      }

      // 게시물별로 최신 댓글 2개만 필터링 (JavaScript에서 처리)
      if (commentsData && commentsData.length > 0) {
        // 게시물별로 댓글 그룹화
        const postCommentsMap = new Map<string, CommentWithUser[]>();
        
        for (const comment of commentsData) {
          const postId = comment.post_id;
          if (!postCommentsMap.has(postId)) {
            postCommentsMap.set(postId, []);
          }
          const postComments = postCommentsMap.get(postId)!;
          
          // 최신 2개만 저장
          if (postComments.length < 2) {
            const user = (comment as any).users;
            if (user) {
              postComments.push({
                id: comment.id,
                post_id: comment.post_id,
                user_id: comment.user_id,
                content: comment.content,
                created_at: comment.created_at,
                updated_at: comment.updated_at,
                user: {
                  id: user.id,
                  clerk_id: user.clerk_id,
                  name: user.name,
                  created_at: user.created_at,
                },
              } satisfies CommentWithUser);
            }
          }
        }
        
        // 최신순 정렬 (이미 DB에서 정렬되었지만, 보장을 위해)
        for (const [postId, comments] of postCommentsMap.entries()) {
          commentsByPostId.set(
            postId,
            comments.sort((a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ).slice(0, 2)
          );
        }
      }
    }

    console.log(`Found comments for ${commentsByPostId.size} posts`);

    // 7. 게시물 데이터와 사용자 정보 결합
    // post_stats 뷰는 post_id를 반환하므로 post.post_id 또는 post.id 사용
    const posts: PostWithUser[] = postsData.map((post) => {
      const user = usersMap.get(post.user_id);
      const postId = post.post_id || post.id;
      const commentsPreview = commentsByPostId.get(postId) || [];
      const isLiked = likedPostIds.includes(postId);

      if (!user) {
        console.warn(`User not found for post ${postId}, user_id: ${post.user_id}`);
        // 사용자 정보가 없어도 게시물은 반환 (기본값 사용)
        return {
          id: postId,
          user_id: post.user_id,
          image_url: post.image_url,
          caption: post.caption,
          created_at: post.created_at,
          updated_at: post.created_at, // post_stats에는 updated_at이 없으므로 created_at 사용
          likes_count: Number(post.likes_count) || 0,
          comments_count: Number(post.comments_count) || 0,
          is_liked: isLiked,
          comments_preview: commentsPreview,
          user: {
            id: post.user_id,
            clerk_id: "unknown",
            name: "알 수 없는 사용자",
            created_at: new Date().toISOString(),
          },
        } satisfies PostWithUser;
      }
      
      return {
        id: postId,
        user_id: post.user_id,
        image_url: post.image_url,
        caption: post.caption,
        created_at: post.created_at,
        updated_at: post.created_at, // post_stats에는 updated_at이 없으므로 created_at 사용
        likes_count: Number(post.likes_count) || 0,
        comments_count: Number(post.comments_count) || 0,
        is_liked: isLiked,
        comments_preview: commentsPreview,
        user: {
          id: user.id,
          clerk_id: user.clerk_id,
          name: user.name,
          created_at: user.created_at,
        },
      } satisfies PostWithUser;
    });

    // 8. 전체 게시물 수 조회 (hasMore 계산을 위해)
    const { count: totalCount, error: countError } = await supabase
      .from("post_stats")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.warn("Error fetching total count (non-critical):", countError);
    }

    const total = totalCount || 0;
    const hasMore = offset + limit < total;

    console.log("Response:", {
      postsCount: posts.length,
      hasMore,
      total,
    });
    console.groupEnd();

    return NextResponse.json({
      posts,
      hasMore,
      total,
    } satisfies PostsResponse);
  } catch (error) {
    console.error("[API] GET /api/posts - Unexpected error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


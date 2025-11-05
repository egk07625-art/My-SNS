import { createClerkSupabaseClient } from "@/lib/supabase/server";
import dynamic from "next/dynamic";
import type { PostWithUser } from "@/lib/types";

/**
 * @file app/(main)/page.tsx
 * @description 홈 피드 페이지 (Server Component)
 *
 * 메인 레이아웃이 적용된 홈 페이지입니다.
 * Server Component로 데이터를 가져와서 PostFeed Client Component로 전달합니다.
 *
 * 동적 import를 사용하는 이유:
 * - Next.js 15에서 Route Group 내 Client Component 직접 import 시 빌드 에러 해결
 * - client-reference-manifest.js 생성 문제 방지
 * - Server Component에서 데이터 페칭으로 초기 로딩 성능 향상
 * - SEO 최적화
 */

// 동적 import로 Client Component 로드
// Route Group 내에서 Client Component 직접 import 시 빌드 에러 방지
const PostFeed = dynamic(() => import("@/components/post/PostFeed"), {
  ssr: true, // SSR 활성화 (서버에서 데이터를 가져왔으므로)
});

export default async function HomePage() {
  // Server Component에서 데이터 페칭
  let initialPosts: PostWithUser[] = [];

  try {
    console.group("[HomePage] Fetching posts (Server)");
    const supabase = createClerkSupabaseClient();
    console.log("[HomePage] Supabase client created");

    // post_stats 뷰에서 게시물 목록 조회
    console.log("[HomePage] Querying post_stats view");
    const { data: postsData, error: postsError } = await supabase
      .from("post_stats")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (postsError) {
      console.error("[HomePage] Database error (posts):", postsError);
      console.error("[HomePage] Error code:", postsError.code);
      console.error("[HomePage] Error message:", postsError.message);
      console.error("[HomePage] Error details:", postsError.details);
      // posts 테이블에서 직접 확인
      const { data: directPosts, error: directError } = await supabase
        .from("posts")
        .select("id, user_id, image_url, caption, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (directError) {
        console.error("[HomePage] Error checking posts table:", directError);
      } else {
        console.log("[HomePage] Posts table has", directPosts?.length || 0, "posts directly");
      }
      // 에러가 발생해도 빈 배열로 계속 진행
    } else if (postsData && postsData.length > 0) {
      console.log(`[HomePage] Found ${postsData.length} posts from post_stats`);
      // 사용자 정보 JOIN
      const userIds = [...new Set(postsData.map((post) => post.user_id))];
      const { data: usersData } = await supabase
        .from("users")
        .select("id, clerk_id, name, created_at")
        .in("id", userIds);

      const usersMap = new Map(
        (usersData || []).map((user) => [user.id, user]),
      );

      // 게시물 데이터와 사용자 정보 결합
      // post_stats 뷰는 post_id를 반환하므로 post.post_id 사용
      initialPosts = postsData.map((post) => {
        const user = usersMap.get(post.user_id);
        // post_stats 뷰는 post_id를 반환하므로 post.post_id 또는 post.id 사용
        const postId = post.post_id || post.id;

        return {
          id: postId,
          user_id: post.user_id,
          image_url: post.image_url,
          caption: post.caption,
          created_at: post.created_at,
          updated_at: post.created_at,
          likes_count: Number(post.likes_count) || 0,
          comments_count: Number(post.comments_count) || 0,
          is_liked: false, // 서버에서는 좋아요 상태 확인 생략 (클라이언트에서 처리)
          user: user || {
            id: post.user_id,
            clerk_id: "unknown",
            name: "알 수 없는 사용자",
            created_at: new Date().toISOString(),
          },
        } satisfies PostWithUser;
      });

      console.log(`[HomePage] Fetched ${initialPosts.length} posts on server`);
      if (initialPosts.length > 0) {
        console.log("[HomePage] Sample post structure:", {
          id: initialPosts[0].id,
          idType: typeof initialPosts[0].id,
          user: initialPosts[0].user,
          user_name: initialPosts[0].user?.name,
          user_nameType: typeof initialPosts[0].user?.name,
          has_image: !!initialPosts[0].image_url,
          allKeys: Object.keys(initialPosts[0]),
          userKeys: initialPosts[0].user ? Object.keys(initialPosts[0].user) : [],
          fullPost: JSON.stringify(initialPosts[0], null, 2),
        });
      }
    } else {
      console.log("[HomePage] No posts found in post_stats view");
      // posts 테이블에서 직접 확인
      const { data: directPosts, error: directError } = await supabase
        .from("posts")
        .select("id, user_id, image_url, caption, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (directError) {
        console.error("[HomePage] Error checking posts table:", directError);
      } else {
        console.log("[HomePage] Posts table has", directPosts?.length || 0, "posts directly");
      }
    }
    console.groupEnd();
  } catch (error) {
    console.error("[HomePage] Error fetching posts:", error);
    // 에러 발생 시 빈 배열로 계속 진행
  }

  return (
    <div className="space-y-4">
      {/* 배경색은 layout.tsx에서 #FAFAFA로 설정되어 있음 */}
      {/* PostCard 최대 너비 630px는 layout.tsx에서 max-w-[630px]로 설정되어 있음 */}
      <PostFeed initialPosts={initialPosts} />
    </div>
  );
}

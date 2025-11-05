import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { PostResponse, PostWithUser } from "@/lib/types";

/**
 * @file app/api/posts/[postId]/route.ts
 * @description 단일 게시물 API 라우트
 *
 * GET /api/posts/[postId] - 단일 게시물 조회
 *
 * 경로 파라미터:
 * - postId: 게시물 UUID
 *
 * 응답 형식:
 * {
 *   post: PostWithUser | null
 * }
 *
 * 에러 응답:
 * - 400: 잘못된 UUID 형식
 * - 401: 인증 실패
 * - 404: 게시물 없음
 * - 500: 서버 오류
 */

// UUID 형식 검증을 위한 정규식
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    console.group("[API] GET /api/posts/[postId]");
    console.log("Request received for postId:", postId);

    // UUID 형식 검증
    if (!UUID_REGEX.test(postId)) {
      console.error("Invalid UUID format:", postId);
      return NextResponse.json(
        { error: "잘못된 게시물 ID 형식입니다." },
        { status: 400 }
      );
    }

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

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // 1. post_stats 뷰에서 게시물 조회 (좋아요 수, 댓글 수 포함)
    const { data: postData, error: postError } = await supabase
      .from("post_stats")
      .select("*")
      .eq("id", postId)
      .single();

    if (postError) {
      console.error("Database error (post):", postError);
      // 게시물이 없거나 다른 에러
      if (postError.code === "PGRST116") {
        // PGRST116: No rows returned
        return NextResponse.json(
          { error: "게시물을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "게시물을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    if (!postData) {
      console.log("Post not found:", postId);
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("Post found:", postData.id);

    // 2. 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, clerk_id, name, created_at")
      .eq("id", postData.user_id)
      .single();

    if (userError || !userData) {
      console.error("Database error (user):", userError);
      return NextResponse.json(
        { error: "사용자 정보를 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("User found:", userData.id);

    // 3. 현재 사용자가 좋아요한 게시물인지 확인
    // Clerk userId로 users 테이블에서 user_id 조회
    const { data: currentUserData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    let isLiked = false;
    if (currentUserData?.id) {
      const { data: likeData } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", currentUserData.id)
        .single();

      isLiked = !!likeData;
    }

    console.log("Is liked:", isLiked);

    // 4. 게시물 데이터 구성
    const post: PostWithUser = {
      id: postData.id,
      user_id: postData.user_id,
      image_url: postData.image_url,
      caption: postData.caption,
      created_at: postData.created_at,
      updated_at: postData.created_at, // post_stats에는 updated_at이 없으므로 created_at 사용
      likes_count: Number(postData.likes_count) || 0,
      comments_count: Number(postData.comments_count) || 0,
      is_liked: isLiked,
      user: {
        id: userData.id,
        clerk_id: userData.clerk_id,
        name: userData.name,
        created_at: userData.created_at,
      },
    };

    console.log("Response prepared");
    console.groupEnd();

    return NextResponse.json({
      post,
    } satisfies PostResponse);
  } catch (error) {
    console.error("[API] GET /api/posts/[postId] - Unexpected error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


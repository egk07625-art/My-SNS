import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * @file app/api/likes/route.ts
 * @description 좋아요 API 라우트
 *
 * POST /api/likes - 좋아요 생성
 * DELETE /api/likes - 좋아요 취소
 *
 * 요청 본문:
 * {
 *   post_id: string (UUID)
 * }
 *
 * 응답 형식:
 * {
 *   success: boolean,
 *   message?: string
 * }
 */

// UUID 형식 검증을 위한 정규식
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 좋아요 생성 (POST)
 */
export async function POST(request: NextRequest) {
  try {
    console.group("[API] POST /api/likes");
    console.log("Request received");

    // 인증 확인
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.error("Unauthorized: No user ID");
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    console.log("User authenticated:", clerkUserId);

    // 요청 본문 파싱
    let body;
    try {
      const bodyText = await request.text();
      console.log("Raw request body:", bodyText);
      
      if (!bodyText || bodyText.trim() === "") {
        console.error("Empty request body");
        return NextResponse.json(
          { error: "요청 본문이 비어있습니다." },
          { status: 400 }
        );
      }

      body = JSON.parse(bodyText);
      console.log("Parsed body:", body);
    } catch (error) {
      console.error("Invalid JSON body:", error);
      return NextResponse.json(
        { error: "잘못된 요청 형식입니다." },
        { status: 400 }
      );
    }

    const { post_id } = body;
    console.log("Extracted post_id:", post_id, "Type:", typeof post_id);

    // post_id 검증
    if (!post_id || typeof post_id !== "string" || post_id.trim() === "") {
      console.error("Missing or invalid post_id:", post_id, "Full body:", body);
      return NextResponse.json(
        { error: "게시물 ID가 필요합니다." },
        { status: 400 }
      );
    }

    if (!UUID_REGEX.test(post_id)) {
      console.error("Invalid UUID format:", post_id);
      return NextResponse.json(
        { error: "잘못된 게시물 ID 형식입니다." },
        { status: 400 }
      );
    }

    console.log("Post ID:", post_id);

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // 1. Clerk user ID로 Supabase user_id 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      console.error("User not found in Supabase:", userError);
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const userId = userData.id;
    console.log("Supabase user ID:", userId);

    // 2. 게시물 존재 확인
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", post_id)
      .single();

    if (postError || !postData) {
      console.error("Post not found:", postError);
      if (postError?.code === "PGRST116") {
        return NextResponse.json(
          { error: "게시물을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "게시물을 확인하는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 3. 좋아요 생성 (중복 방지는 UNIQUE 제약조건으로 처리)
    const { error: likeError } = await supabase.from("likes").insert({
      post_id,
      user_id: userId,
    });

    if (likeError) {
      console.error("Failed to create like:", likeError);

      // 중복 좋아요 에러 처리 (UNIQUE 제약조건 위반)
      if (likeError.code === "23505") {
        return NextResponse.json(
          { error: "이미 좋아요한 게시물입니다." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "좋아요를 추가하는데 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("Like created successfully");
    console.groupEnd();

    return NextResponse.json({
      success: true,
      message: "좋아요가 추가되었습니다.",
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/likes:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 좋아요 취소 (DELETE)
 */
export async function DELETE(request: NextRequest) {
  try {
    console.group("[API] DELETE /api/likes");
    console.log("Request received");

    // 인증 확인
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.error("Unauthorized: No user ID");
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    console.log("User authenticated:", clerkUserId);

    // 요청 본문 파싱
    let body;
    try {
      const bodyText = await request.text();
      console.log("Raw request body:", bodyText);
      
      if (!bodyText || bodyText.trim() === "") {
        console.error("Empty request body");
        return NextResponse.json(
          { error: "요청 본문이 비어있습니다." },
          { status: 400 }
        );
      }

      body = JSON.parse(bodyText);
      console.log("Parsed body:", body);
    } catch (error) {
      console.error("Invalid JSON body:", error);
      return NextResponse.json(
        { error: "잘못된 요청 형식입니다." },
        { status: 400 }
      );
    }

    const { post_id } = body;
    console.log("Extracted post_id:", post_id, "Type:", typeof post_id);

    // post_id 검증
    if (!post_id || typeof post_id !== "string" || post_id.trim() === "") {
      console.error("Missing or invalid post_id:", post_id, "Full body:", body);
      return NextResponse.json(
        { error: "게시물 ID가 필요합니다." },
        { status: 400 }
      );
    }

    if (!UUID_REGEX.test(post_id)) {
      console.error("Invalid UUID format:", post_id);
      return NextResponse.json(
        { error: "잘못된 게시물 ID 형식입니다." },
        { status: 400 }
      );
    }

    console.log("Post ID:", post_id);

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // 1. Clerk user ID로 Supabase user_id 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      console.error("User not found in Supabase:", userError);
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const userId = userData.id;
    console.log("Supabase user ID:", userId);

    // 2. 좋아요 관계 확인 및 삭제
    const { data: likeData, error: likeCheckError } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post_id)
      .eq("user_id", userId)
      .single();

    if (likeCheckError || !likeData) {
      console.error("Like not found:", likeCheckError);
      if (likeCheckError?.code === "PGRST116") {
        return NextResponse.json(
          { error: "좋아요를 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "좋아요를 확인하는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 3. 좋아요 삭제
    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("id", likeData.id);

    if (deleteError) {
      console.error("Failed to delete like:", deleteError);
      return NextResponse.json(
        { error: "좋아요를 취소하는데 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("Like deleted successfully");
    console.groupEnd();

    return NextResponse.json({
      success: true,
      message: "좋아요가 취소되었습니다.",
    });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/likes:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


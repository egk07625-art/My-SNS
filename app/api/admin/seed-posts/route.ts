import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * @file app/api/admin/seed-posts/route.ts
 * @description 게시글 샘플 데이터 생성 API
 *
 * 홈 피드 테스트를 위한 샘플 게시글 5개를 생성합니다.
 * 관리자 권한이 필요합니다 (인증된 사용자만 실행 가능).
 */

export async function POST() {
  try {
    console.group("[API] POST /api/admin/seed-posts");
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

    // Service Role 클라이언트 사용 (관리자 권한)
    const supabase = getServiceRoleClient();

    // 기존 사용자 ID 조회 (첫 번째 사용자 사용)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .limit(1)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다. 먼저 사용자를 생성해주세요." },
        { status: 404 }
      );
    }

    const userIdForPosts = userData.id;
    console.log("Using user ID for posts:", userIdForPosts);

    // 샘플 게시글 데이터
    const samplePosts = [
      {
        user_id: userIdForPosts,
        image_url:
          "https://images.unsplash.com/photo-1762268773812-ecc373ab25d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080",
        caption:
          "오늘 하루도 자연과 함께 🌿 아침 산책하면서 만난 풍경이 너무 아름다워서 담아봤어요. 이런 날이면 모든 걱정이 사라지는 것 같아요.",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_id: userIdForPosts,
        image_url:
          "https://images.unsplash.com/photo-1762268773805-67cbc382cc88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHwyfHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "휴가의 추억 ✈️",
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5시간 전
        updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_id: userIdForPosts,
        image_url:
          "https://images.unsplash.com/photo-1762245267105-8c8dcb5e7180?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHwzfHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080",
        caption:
          "일상의 소중함을 느끼는 순간들. 작은 것들에도 감사하는 마음을 갖고 싶어요. 오늘도 행복한 하루 보내세요! 😊",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1일 전
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_id: userIdForPosts,
        image_url:
          "https://images.unsplash.com/photo-1762245265298-19aa1625f40d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHw0fHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "새로운 시작을 향해 🚀 항상 도전하는 마음으로 살고 싶어요.",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_id: userIdForPosts,
        image_url:
          "https://images.unsplash.com/photo-1762245282007-1fe7e42d027b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHw1fHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "평화로운 순간들 ☕",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // 게시글 삽입
    const { data: insertedPosts, error: insertError } = await supabase
      .from("posts")
      .insert(samplePosts)
      .select("id, user_id, image_url, caption, created_at");

    if (insertError) {
      console.error("Error inserting posts:", insertError);
      return NextResponse.json(
        { error: "게시글 삽입 실패", details: insertError.message },
        { status: 500 }
      );
    }

    console.log(`Successfully inserted ${insertedPosts?.length || 0} posts`);
    console.log("Inserted post IDs:", insertedPosts?.map((p) => p.id));

    // post_stats 뷰에서 자동 계산된 통계 확인
    const { data: statsData, error: statsError } = await supabase
      .from("post_stats")
      .select("post_id, likes_count, comments_count")
      .in(
        "post_id",
        insertedPosts?.map((p) => p.id) || []
      );

    if (statsError) {
      console.warn("Error fetching stats (non-critical):", statsError);
    }

    console.log("Post stats:", statsData);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      message: `${insertedPosts?.length || 0}개의 샘플 게시글이 생성되었습니다.`,
      posts: insertedPosts,
      stats: statsData,
    });
  } catch (error) {
    console.error("[API] POST /api/admin/seed-posts - Unexpected error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


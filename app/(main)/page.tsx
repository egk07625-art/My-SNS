import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { PostFeed } from "@/components/post/PostFeed";
import type { PostWithUser } from "@/lib/types";

/**
 * @file app/(main)/page.tsx
 * @description 홈 피드 페이지 (Server Component)
 *
 * 메인 레이아웃이 적용된 홈 페이지입니다.
 * Server Component로 데이터를 가져와서 PostFeed Client Component로 전달합니다.
 *
 * 이렇게 분리하는 이유:
 * - Next.js 15에서 Route Group 내 Client Component 페이지 빌드 이슈 해결
 * - Server Component에서 데이터 페칭으로 초기 로딩 성능 향상
 * - SEO 최적화
 */

export default async function HomePage() {
  // Server Component에서 데이터 페칭
  let initialPosts: PostWithUser[] = [];

  try {
    console.group("[HomePage] Fetching posts (Server)");
    const supabase = createClerkSupabaseClient();

    // post_stats 뷰에서 게시물 목록 조회
    const { data: postsData, error: postsError } = await supabase
      .from("post_stats")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (postsError) {
      console.error("Database error (posts):", postsError);
      // 에러가 발생해도 빈 배열로 계속 진행
    } else if (postsData && postsData.length > 0) {
      // 사용자 정보 JOIN
      const userIds = [...new Set(postsData.map((post) => post.user_id))];
      const { data: usersData } = await supabase
        .from("users")
        .select("id, clerk_id, name, created_at")
        .in("id", userIds);

      const usersMap = new Map(
        (usersData || []).map((user) => [user.id, user])
      );

      // 게시물 데이터와 사용자 정보 결합
      initialPosts = postsData.map((post) => {
        const user = usersMap.get(post.user_id);

        return {
          id: post.id,
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

      console.log(`Fetched ${initialPosts.length} posts on server`);
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


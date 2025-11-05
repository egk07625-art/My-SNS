"use client";

import { memo, useEffect, useState } from "react";
import { PostCardSkeleton } from "@/components/post/PostCardSkeleton";
import { PostCard } from "@/components/post/PostCard";
import type { PostWithUser } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

/**
 * @file components/auth/AuthBackground.tsx
 * @description 로그인 화면/모달 뒤에 깔리는 인스타그램 스타일 백그라운드
 *
 * - 공개(익명) 접근: Supabase anon 클라이언트로 최신 게시물 일부 조회
 * - 실패 시: 스켈레톤으로 폴백
 * - 포인터 이벤트를 막아 상호작용이 로그인 UI에만 가도록 합니다.
 */
function AuthBackgroundImpl() {
  const [posts, setPosts] = useState<PostWithUser[] | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { data: postsData, error: postsError } = await supabase
          .from("post_stats")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (postsError || !postsData || postsData.length === 0) {
          setPosts([]);
          return;
        }

        const userIds = [...new Set(postsData.map((p) => p.user_id))];
        const { data: usersData } = await supabase
          .from("users")
          .select("id, clerk_id, name, created_at")
          .in("id", userIds);

        const usersMap = new Map((usersData || []).map((u) => [u.id, u]));

        const mapped: PostWithUser[] = postsData.map((post) => {
          const postId = post.post_id || post.id;
          const user = usersMap.get(post.user_id) || {
            id: post.user_id,
            clerk_id: "unknown",
            name: "알 수 없는 사용자",
            created_at: new Date().toISOString(),
          };
          return {
            id: postId,
            user_id: post.user_id,
            image_url: post.image_url,
            caption: post.caption,
            created_at: post.created_at,
            updated_at: post.created_at,
            likes_count: Number(post.likes_count) || 0,
            comments_count: Number(post.comments_count) || 0,
            user,
          };
        });

        if (isMounted) setPosts(mapped);
      } catch {
        if (isMounted) setPosts([]);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[35] overflow-auto bg-[#FAFAFA] pointer-events-none">
      {/* 배경 블러 효과 (로그인 전 상태 - 글자를 읽을 수 없을 정도로 흐리게) */}
      <div className="absolute inset-0 backdrop-blur-lg bg-[#FAFAFA]/90 z-[36]"></div>
      <div className="relative z-[37] md:ml-[72px] lg:ml-[244px] pt-[60px] pb-16 md:pb-0">
        <div className="max-w-[630px] mx-auto px-4 py-4 md:py-8 space-y-4 opacity-20 blur-sm">
          {posts && posts.length > 0
            ? posts.map((post) => <PostCard key={post.id} post={post} />)
            : Array.from({ length: 4 }).map((_, i) => (
                <PostCardSkeleton key={`auth-bg-skel-${i}`} />
              ))}
        </div>
      </div>
    </div>
  );
}

export const AuthBackground = memo(AuthBackgroundImpl);

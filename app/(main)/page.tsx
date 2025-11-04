"use client";

import { useEffect, useState } from "react";
import { PostCard } from "@/components/post/PostCard";
import type { PostWithUser, PostsResponse } from "@/lib/types";

/**
 * @file app/(main)/page.tsx
 * @description 홈 피드 페이지
 *
 * 메인 레이아웃이 적용된 홈 페이지입니다.
 * 게시물 피드를 표시하며, 향후 PostFeed 컴포넌트로 분리될 예정입니다.
 *
 * 현재 구현:
 * - PostCard 컴포넌트를 사용하여 게시물 헤더 섹션 표시
 * - API를 통해 게시물 목록 조회
 *
 * 향후 개선:
 * - PostFeed 컴포넌트로 분리
 * - 무한 스크롤 구현
 * - 로딩 상태 (Skeleton UI)
 * - 에러 처리 개선
 */

export default function HomePage() {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        console.group("[HomePage] Fetching posts");
        setLoading(true);
        setError(null);

        const response = await fetch("/api/posts?limit=10&offset=0");

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "게시물을 불러오는데 실패했습니다.");
        }

        const data: PostsResponse = await response.json();
        console.log("Posts fetched:", data.posts.length);
        setPosts(data.posts);
      } catch (err) {
        console.error("[HomePage] Error fetching posts:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    }

    fetchPosts();
  }, []);

  return (
    <div className="space-y-4">
      {/* 배경색은 layout.tsx에서 #FAFAFA로 설정되어 있음 */}
      {/* PostCard 최대 너비 630px는 layout.tsx에서 max-w-[630px]로 설정되어 있음 */}

      {loading && (
        <div className="text-center py-8">
          <p className="text-[#8E8E8E]">게시물을 불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[#8E8E8E]">게시물이 없습니다.</p>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}


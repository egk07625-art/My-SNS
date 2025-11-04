"use client";

import { useEffect, useState } from "react";
import { PostCard } from "@/components/post/PostCard";
import type { PostWithUser, PostsResponse } from "@/lib/types";

/**
 * @file components/post/PostFeed.tsx
 * @description 게시물 피드 컴포넌트 (Client Component)
 *
 * 게시물 목록을 표시하는 클라이언트 컴포넌트입니다.
 * API를 통해 게시물을 가져와서 PostCard로 렌더링합니다.
 *
 * 향후 개선:
 * - 무한 스크롤 구현
 * - 로딩 상태 (Skeleton UI)
 * - 에러 처리 개선
 */

interface PostFeedProps {
  initialPosts?: PostWithUser[];
}

export function PostFeed({ initialPosts = [] }: PostFeedProps) {
  const [posts, setPosts] = useState<PostWithUser[]>(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // initialPosts가 있으면 이미 서버에서 데이터를 가져온 것이므로
    // 클라이언트에서 다시 fetch하지 않음
    if (initialPosts.length > 0) {
      return;
    }

    async function fetchPosts() {
      try {
        console.group("[PostFeed] Fetching posts");
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
        console.error("[PostFeed] Error fetching posts:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    }

    fetchPosts();
  }, [initialPosts]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-[#8E8E8E]">게시물을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#8E8E8E]">게시물이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}


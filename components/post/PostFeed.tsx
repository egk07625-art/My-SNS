"use client";

import { useEffect, useState, useCallback } from "react";
import { PostCard } from "@/components/post/PostCard";
import { PostCardSkeleton } from "@/components/post/PostCardSkeleton";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import type { PostWithUser, PostsResponse } from "@/lib/types";

/**
 * @file components/post/PostFeed.tsx
 * @description 게시물 피드 컴포넌트 (Client Component)
 *
 * 게시물 목록을 표시하는 클라이언트 컴포넌트입니다.
 * 무한 스크롤과 페이지네이션을 지원합니다.
 *
 * 주요 기능:
 * - 초기 게시물 로드 (서버에서 받은 initialPosts 사용)
 * - 무한 스크롤 (Intersection Observer)
 * - 페이지네이션 (10개씩 로드)
 * - 로딩 상태 (PostCardSkeleton)
 * - 에러 처리 및 재시도
 */

interface PostFeedProps {
  initialPosts?: PostWithUser[];
  /** API 호출을 비활성화할지 여부 (모달 백그라운드 등에서 사용) */
  disableApiCall?: boolean;
}

const POSTS_PER_PAGE = 10;

export default function PostFeed({ initialPosts = [], disableApiCall = false }: PostFeedProps) {
  // initialPosts도 유효한 게시물만 필터링 (최소 조건만 체크 - 빈 객체만 제외)
  const validInitialPosts = initialPosts.filter((post, index) => {
    // 빈 객체가 아닌지 확인
    if (!post || typeof post !== "object" || Object.keys(post).length === 0) {
      console.warn(`[PostFeed] Post[${index}] is empty or invalid:`, post);
      return false;
    }
    
    // post.id가 유효한 문자열인지 확인
    if (!post.id) {
      console.warn(`[PostFeed] Post[${index}] missing id:`, {
        post,
        keys: Object.keys(post),
        idType: typeof post.id,
        idValue: post.id,
      });
      return false;
    }
    
    if (typeof post.id !== "string") {
      console.warn(`[PostFeed] Post[${index}] id is not string:`, {
        id: post.id,
        idType: typeof post.id,
        postKeys: Object.keys(post),
      });
      return false;
    }
    
    if (post.id.trim() === "") {
      console.warn(`[PostFeed] Post[${index}] id is empty string:`, {
        id: post.id,
        postKeys: Object.keys(post),
      });
      return false;
    }
    
    // post.user가 있고 name이 있는지 확인 (clerk_id는 선택적)
    if (!post.user) {
      console.warn(`[PostFeed] Post[${index}] missing user:`, {
        id: post.id,
        postKeys: Object.keys(post),
      });
      return false;
    }
    
    if (typeof post.user !== "object") {
      console.warn(`[PostFeed] Post[${index}] user is not object:`, {
        id: post.id,
        user: post.user,
        userType: typeof post.user,
      });
      return false;
    }
    
    if (!post.user.name) {
      console.warn(`[PostFeed] Post[${index}] user missing name:`, {
        id: post.id,
        user: post.user,
        userKeys: Object.keys(post.user),
      });
      return false;
    }
    
    return true;
  });
  
  console.log("[PostFeed] Initial posts:", initialPosts.length, "Valid:", validInitialPosts.length);
  if (initialPosts.length > 0 && validInitialPosts.length === 0) {
    console.error("[PostFeed] All posts were filtered out! Sample post structure:", {
      firstPost: initialPosts[0],
      firstPostKeys: initialPosts[0] ? Object.keys(initialPosts[0]) : [],
      firstPostId: initialPosts[0]?.id,
      firstPostIdType: typeof initialPosts[0]?.id,
      firstPostUser: initialPosts[0]?.user,
      firstPostUserKeys: initialPosts[0]?.user ? Object.keys(initialPosts[0].user) : [],
    });
  }

  const [posts, setPosts] = useState<PostWithUser[]>(validInitialPosts);
  // 서버에서 데이터를 가져왔으면 초기 로딩 상태를 false로 설정
  // (백그라운드에서 API 호출로 데이터 업데이트)
  const [loading, setLoading] = useState(validInitialPosts.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(validInitialPosts.length);

  // 초기 로딩 (서버에서 데이터를 가져왔더라도 클라이언트에서 한 번은 API 호출)
  // 이유: 서버에서 가져온 데이터는 is_liked가 항상 false이므로, 
  // 클라이언트에서 실제 좋아요 상태를 확인하기 위해 API 호출 필요
  useEffect(() => {
    async function fetchInitialPosts() {
      try {
        console.group("[PostFeed] Fetching initial posts (Client)");
        // 서버에서 데이터를 가져오지 못한 경우에만 로딩 상태 표시
        if (validInitialPosts.length === 0) {
          setLoading(true);
        }
        setError(null);

        const response = await fetch(`/api/posts?limit=${POSTS_PER_PAGE}&offset=0`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "게시물을 불러오는데 실패했습니다.");
        }

        const data: PostsResponse = await response.json();
        console.log("Initial posts fetched:", data.posts.length);
        
        // 유효한 게시물만 필터링 (최소 조건만 체크 - 빈 객체만 제외)
        const validPosts = data.posts.filter((post) => {
          // 빈 객체가 아닌지 확인
          if (!post || typeof post !== "object" || Object.keys(post).length === 0) {
            return false;
          }
          // post.id가 유효한 문자열인지 확인
          if (!post.id || typeof post.id !== "string" || post.id.trim() === "") {
            return false;
          }
          // post.user가 있고 name이 있는지 확인 (clerk_id는 선택적)
          if (!post.user || typeof post.user !== "object" || !post.user.name) {
            return false;
          }
          return true;
        });
        
        console.log("[PostFeed] Fetched posts:", data.posts.length, "Valid after filtering:", validPosts.length);
        
        // 서버에서 가져온 initialPosts가 있고, API 응답이 비어있으면 서버 데이터 유지
        if (validPosts.length === 0 && validInitialPosts.length > 0) {
          console.log("[PostFeed] API returned empty, keeping server-side posts");
          setPosts(validInitialPosts);
          setOffset(validInitialPosts.length);
        } else {
          setPosts(validPosts);
          setOffset(validPosts.length);
        }
        setHasMore(data.hasMore);
      } catch (err) {
        console.error("[PostFeed] Error fetching initial posts:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
        
        // 에러 발생 시 서버에서 받은 validInitialPosts를 fallback으로 사용
        if (validInitialPosts.length > 0) {
          console.log("Using server-side initialPosts as fallback");
          setPosts(validInitialPosts);
          setHasMore(validInitialPosts.length === POSTS_PER_PAGE);
          setOffset(validInitialPosts.length);
        }
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    }

    // API 호출이 비활성화되지 않은 경우에만 호출
    if (!disableApiCall) {
      fetchInitialPosts();
    } else {
      // API 호출이 비활성화된 경우, initialPosts만 사용
      setLoading(false);
      if (validInitialPosts.length === 0) {
        setHasMore(false);
      }
    }
  }, [validInitialPosts.length, disableApiCall]);

  // 추가 게시물 로드 함수
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || error) {
      return;
    }

    try {
      console.group("[PostFeed] Loading more posts");
      setLoadingMore(true);
      setError(null);

      const response = await fetch(
        `/api/posts?limit=${POSTS_PER_PAGE}&offset=${offset}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "게시물을 불러오는데 실패했습니다.");
      }

      const data: PostsResponse = await response.json();
      console.log("More posts fetched:", data.posts.length);

      // 유효한 게시물만 필터링 (최소 조건만 체크 - 빈 객체만 제외)
      const validPosts = data.posts.filter((post) => {
        // 빈 객체가 아닌지 확인
        if (!post || typeof post !== "object" || Object.keys(post).length === 0) {
          return false;
        }
        // post.id가 유효한 문자열인지 확인
        if (!post.id || typeof post.id !== "string" || post.id.trim() === "") {
          return false;
        }
        // post.user가 있고 name이 있는지 확인 (clerk_id는 선택적)
        if (!post.user || typeof post.user !== "object" || !post.user.name) {
          return false;
        }
        return true;
      });

      console.log("[PostFeed] More posts fetched:", data.posts.length, "Valid after filtering:", validPosts.length);

      if (validPosts.length > 0) {
        setPosts((prev) => [...prev, ...validPosts]);
        setHasMore(data.hasMore);
        setOffset((prev) => prev + validPosts.length);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("[PostFeed] Error loading more posts:", err);
      setError(err instanceof Error ? err.message : "게시물을 불러오는데 실패했습니다.");
    } finally {
      setLoadingMore(false);
      console.groupEnd();
    }
  }, [loadingMore, hasMore, error, offset]);

  // 무한 스크롤 훅
  const { sentinelRef } = useInfiniteScroll({
    onIntersect: loadMore,
    enabled: hasMore && !loadingMore && !loading,
  });

  // 재시도 함수
  const handleRetry = useCallback(() => {
    setError(null);
    if (posts.length === 0) {
      // 초기 로딩 재시도
      window.location.reload();
    } else {
      // 추가 로딩 재시도
      loadMore();
    }
  }, [posts.length, loadMore]);

  // 초기 로딩 상태 - 로딩 중에는 스켈레톤 표시
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // 에러 상태 (초기 로딩 실패)
  if (error && posts.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 게시물이 없을 때 (로딩이 완료된 후에만 표시)
  // loading이 false이고 posts가 비어있을 때만 빈 상태 메시지 표시
  if (!loading && posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#8E8E8E]">게시물이 없습니다.</p>
      </div>
    );
  }

  // 유효한 게시물만 필터링 (최소 조건만 체크 - 빈 객체만 제외)
  const validPosts = posts.filter((post) => {
    return (
      post &&
      typeof post === "object" &&
      Object.keys(post).length > 0 && // 빈 객체가 아닌지 확인
      post.id &&
      typeof post.id === "string" &&
      post.id.trim() !== "" &&
      post.user &&
      typeof post.user === "object" &&
      post.user.name // user.name이 있으면 충분 (clerk_id는 선택적)
    );
  });

  return (
    <div className="space-y-4">
      {[
        // 게시물 목록 (유효한 게시물만)
        ...validPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        )),
        // 추가 로딩 스켈레톤
        loadingMore && (
          <div key="loading-skeleton" className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <PostCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ),
        // 에러 상태 (추가 로딩 실패)
        error && validPosts.length > 0 && (
          <div key="error-message" className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm mb-3">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
            >
              다시 시도
            </button>
          </div>
        ),
        // 모든 게시물 로드 완료
        !hasMore && !loadingMore && (
          <div key="no-more-posts" className="text-center py-8">
            <p className="text-[#8E8E8E] text-sm">모든 게시물을 불러왔습니다.</p>
          </div>
        ),
        // 무한 스크롤 감지 요소
        hasMore && !loadingMore && (
          <div key="sentinel" ref={sentinelRef} className="h-1" />
        ),
      ]}
    </div>
  );
}


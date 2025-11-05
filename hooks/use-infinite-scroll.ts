import { useEffect, useRef, useCallback } from "react";

/**
 * @file hooks/use-infinite-scroll.ts
 * @description 무한 스크롤 커스텀 훅
 *
 * Intersection Observer API를 사용하여 스크롤이 하단에 도달했을 때
 * 콜백 함수를 호출하는 훅입니다.
 *
 * 주요 기능:
 * - Intersection Observer를 통한 스크롤 감지
 * - cleanup 함수로 메모리 누수 방지
 * - 재사용 가능한 훅으로 분리
 *
 * @example
 * const { sentinelRef, isIntersecting } = useInfiniteScroll({
 *   onIntersect: async () => {
 *     await loadMore();
 *   },
 *   enabled: hasMore && !loading,
 * });
 */

interface UseInfiniteScrollOptions {
  /**
   * 교차 감지 시 호출할 콜백 함수
   */
  onIntersect: () => void | Promise<void>;
  
  /**
   * 무한 스크롤 활성화 여부
   * false일 경우 교차 감지를 중단합니다.
   */
  enabled?: boolean;
  
  /**
   * Intersection Observer의 rootMargin
   * 기본값: "100px" (100px 전에 미리 감지)
   */
  rootMargin?: string;
  
  /**
   * Intersection Observer의 threshold
   * 기본값: 0.1 (10% 이상 보일 때 감지)
   */
  threshold?: number;
}

interface UseInfiniteScrollReturn {
  /**
   * 교차 감지를 위한 ref
   * 이 ref를 감시할 요소에 연결합니다.
   */
  sentinelRef: React.RefObject<HTMLDivElement>;
  
  /**
   * 현재 교차 상태
   */
  isIntersecting: boolean;
}

export function useInfiniteScroll({
  onIntersect,
  enabled = true,
  rootMargin = "100px",
  threshold = 0.1,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isIntersectingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 콜백 함수를 useCallback으로 메모이제이션
  const handleIntersect = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      // enabled가 false이거나 이미 교차 중이면 무시
      if (!enabled || isIntersectingRef.current) {
        return;
      }

      if (entry.isIntersecting) {
        isIntersectingRef.current = true;
        console.log("[useInfiniteScroll] Intersection detected");
        
        try {
          await onIntersect();
        } catch (error) {
          console.error("[useInfiniteScroll] Error in onIntersect:", error);
        } finally {
          // 교차 상태를 초기화 (다음 감지를 위해)
          // 약간의 지연을 두어 연속 호출 방지
          setTimeout(() => {
            isIntersectingRef.current = false;
          }, 100);
        }
      }
    },
    [onIntersect, enabled]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    // Intersection Observer 생성
    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin,
      threshold,
    });

    // 감시 시작
    observerRef.current.observe(sentinel);

    console.log("[useInfiniteScroll] Observer attached", { enabled });

    // cleanup 함수
    return () => {
      if (observerRef.current && sentinel) {
        observerRef.current.unobserve(sentinel);
        observerRef.current.disconnect();
        observerRef.current = null;
        console.log("[useInfiniteScroll] Observer detached");
      }
    };
  }, [handleIntersect, rootMargin, threshold, enabled]);

  return {
    sentinelRef,
    isIntersecting: isIntersectingRef.current,
  };
}


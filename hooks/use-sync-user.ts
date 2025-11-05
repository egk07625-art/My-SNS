"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { getErrorInfo, isNetworkError } from "@/lib/utils/clerk-errors";

/**
 * Clerk 사용자를 Supabase DB에 자동으로 동기화하는 훅
 *
 * 사용자가 로그인한 상태에서 이 훅을 사용하면
 * 자동으로 /api/sync-user를 호출하여 Supabase users 테이블에 사용자 정보를 저장합니다.
 *
 * 주요 기능:
 * 1. 자동 동기화 (로그인 시 한 번만 실행)
 * 2. 재시도 로직 (최대 3회, 지수 백오프)
 * 3. 네트워크 에러 감지 및 처리
 * 4. 에러 로그 기록 (개발 환경)
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useSyncUser } from '@/hooks/use-sync-user';
 *
 * export default function Layout({ children }) {
 *   useSyncUser();
 *   return <>{children}</>;
 * }
 * ```
 */

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1초

/**
 * 지수 백오프를 사용한 재시도 지연 시간 계산
 */
function getRetryDelay(retryCount: number): number {
  return INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
}

export function useSyncUser() {
  const { isLoaded, userId } = useAuth();
  const syncedRef = useRef(false);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 이미 동기화했거나, 로딩 중이거나, 로그인하지 않은 경우 무시
    if (syncedRef.current || !isLoaded || !userId) {
      return;
    }

    // 동기화 실행
    const syncUser = async (attemptNumber: number = 0): Promise<void> => {
      try {
        console.group(`[useSyncUser] 동기화 시도 ${attemptNumber + 1}/${MAX_RETRIES + 1}`);
        console.log("[useSyncUser] Clerk User ID:", userId);

        const response = await fetch("/api/sync-user", {
          method: "POST",
        });

        if (!response.ok) {
          const errorText = await response.text();
          const error = new Error(errorText);
          const errorInfo = getErrorInfo(error);

          console.error("[useSyncUser] 동기화 실패:", errorInfo.message);
          console.error("[useSyncUser] 에러 타입:", errorInfo.type);
          console.error("[useSyncUser] 에러 코드:", errorInfo.code);

          // 네트워크 에러이거나 재시도 가능한 경우
          if (
            (isNetworkError(error) || errorInfo.type === "server") &&
            attemptNumber < MAX_RETRIES
          ) {
            const delay = getRetryDelay(attemptNumber);
            console.log(
              `[useSyncUser] ${delay}ms 후 재시도 예정 (${attemptNumber + 1}/${MAX_RETRIES})`
            );

            // 재시도 스케줄링
            timeoutRef.current = setTimeout(() => {
              syncUser(attemptNumber + 1);
            }, delay);

            retryCountRef.current = attemptNumber + 1;
            return;
          } else {
            // 최대 재시도 횟수 도달 또는 재시도 불가능한 에러
            console.error(
              "[useSyncUser] 동기화 실패 (재시도 불가):",
              errorInfo.message
            );
            console.error(
              "[useSyncUser] 동기화 실패해도 로그인은 유지됩니다. 사용자는 정상적으로 사용할 수 있습니다."
            );
            // 동기화 실패해도 로그인은 유지 (사용자 경험 우선)
            syncedRef.current = true;
            return;
          }
        }

        const data = await response.json();
        console.log("[useSyncUser] 동기화 성공:", data);
        console.groupEnd();

        syncedRef.current = true;
        retryCountRef.current = 0;
      } catch (error) {
        const errorInfo = getErrorInfo(error);
        console.error("[useSyncUser] 동기화 중 예외 발생:", errorInfo.message);
        console.error("[useSyncUser] 에러 타입:", errorInfo.type);

        // 네트워크 에러이거나 재시도 가능한 경우
        if (
          (isNetworkError(error) || errorInfo.type === "server") &&
          attemptNumber < MAX_RETRIES
        ) {
          const delay = getRetryDelay(attemptNumber);
          console.log(
            `[useSyncUser] ${delay}ms 후 재시도 예정 (${attemptNumber + 1}/${MAX_RETRIES})`
          );

          // 재시도 스케줄링
          timeoutRef.current = setTimeout(() => {
            syncUser(attemptNumber + 1);
          }, delay);

          retryCountRef.current = attemptNumber + 1;
          return;
        } else {
          // 최대 재시도 횟수 도달 또는 재시도 불가능한 에러
          console.error(
            "[useSyncUser] 동기화 실패 (재시도 불가):",
            errorInfo.message
          );
          console.error(
            "[useSyncUser] 동기화 실패해도 로그인은 유지됩니다. 사용자는 정상적으로 사용할 수 있습니다."
          );
          // 동기화 실패해도 로그인은 유지 (사용자 경험 우선)
          syncedRef.current = true;
        }
      } finally {
        console.groupEnd();
      }
    };

    syncUser();

    // cleanup: 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoaded, userId]);
}

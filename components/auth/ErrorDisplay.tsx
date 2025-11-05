"use client";

import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorInfo, type ErrorType } from "@/lib/utils/clerk-errors";
import { useState } from "react";

/**
 * @file components/auth/ErrorDisplay.tsx
 * @description 에러 디스플레이 컴포넌트
 *
 * Clerk 인증 관련 에러를 사용자 친화적으로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 에러 메시지 한국어 표시
 * 2. 에러 타입별 아이콘 및 스타일
 * 3. 재시도 버튼 제공
 * 4. 네트워크 상태 표시
 *
 * @dependencies
 * - lib/utils/clerk-errors: 에러 처리 유틸리티
 * - components/ui/button: 버튼 컴포넌트
 * - lucide-react: 아이콘
 */

interface ErrorDisplayProps {
  error: unknown;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
  className?: string;
}

/**
 * 에러 타입별 아이콘
 */
const getErrorIcon = (type: ErrorType) => {
  switch (type) {
    case "network":
      return <WifiOff className="w-5 h-5" />;
    case "authentication":
    case "validation":
      return <AlertCircle className="w-5 h-5" />;
    default:
      return <AlertCircle className="w-5 h-5" />;
  }
};

/**
 * 에러 타입별 배경색
 */
const getErrorBgColor = (type: ErrorType) => {
  switch (type) {
    case "network":
      return "bg-yellow-50 border-yellow-200";
    case "authentication":
      return "bg-red-50 border-red-200";
    case "validation":
      return "bg-orange-50 border-orange-200";
    case "server":
      return "bg-red-50 border-red-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

/**
 * 에러 타입별 텍스트 색상
 */
const getErrorTextColor = (type: ErrorType) => {
  switch (type) {
    case "network":
      return "text-yellow-800";
    case "authentication":
      return "text-red-800";
    case "validation":
      return "text-orange-800";
    case "server":
      return "text-red-800";
    default:
      return "text-gray-800";
  }
};

/**
 * 에러 디스플레이 컴포넌트
 */
export function ErrorDisplay({
  error,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  className = "",
}: ErrorDisplayProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const errorInfo = getErrorInfo(error);

  const canRetry = onRetry && retryCount < maxRetries && !isRetrying;
  const hasReachedMaxRetries = retryCount >= maxRetries;

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div
      className={`rounded-lg border p-4 ${getErrorBgColor(errorInfo.type)} ${className}`}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className={`mt-0.5 ${getErrorTextColor(errorInfo.type)}`}>
          {getErrorIcon(errorInfo.type)}
        </div>

        {/* 에러 메시지 */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold mb-1 ${getErrorTextColor(errorInfo.type)}`}>
            {errorInfo.type === "network"
              ? "네트워크 오류"
              : errorInfo.type === "authentication"
                ? "인증 오류"
                : errorInfo.type === "validation"
                  ? "입력 오류"
                  : errorInfo.type === "server"
                    ? "서버 오류"
                    : "오류 발생"}
          </h3>
          <p className={`text-sm ${getErrorTextColor(errorInfo.type)} opacity-90`}>
            {errorInfo.message}
          </p>

          {/* 재시도 횟수 표시 */}
          {retryCount > 0 && (
            <p className={`text-xs mt-2 ${getErrorTextColor(errorInfo.type)} opacity-70`}>
              재시도 횟수: {retryCount}/{maxRetries}
            </p>
          )}

          {/* 최대 재시도 횟수 도달 메시지 */}
          {hasReachedMaxRetries && (
            <p className={`text-xs mt-2 ${getErrorTextColor(errorInfo.type)} opacity-70`}>
              최대 재시도 횟수에 도달했습니다. 페이지를 새로고침해주세요.
            </p>
          )}

          {/* 네트워크 상태 표시 */}
          {errorInfo.isNetworkError && typeof window !== "undefined" && (
            <p className={`text-xs mt-2 ${getErrorTextColor(errorInfo.type)} opacity-70`}>
              네트워크 상태: {navigator.onLine ? "온라인" : "오프라인"}
            </p>
          )}

          {/* 재시도 버튼 */}
          {canRetry && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
                className="text-sm"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    재시도 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    다시 시도
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 개발 환경: 상세 에러 정보 */}
      {process.env.NODE_ENV === "development" && errorInfo.code && (
        <details className="mt-3 pt-3 border-t border-current opacity-30">
          <summary className={`text-xs cursor-pointer ${getErrorTextColor(errorInfo.type)}`}>
            개발자 정보 (클릭하여 확장)
          </summary>
          <div className={`mt-2 text-xs font-mono ${getErrorTextColor(errorInfo.type)} opacity-70`}>
            <p>에러 코드: {errorInfo.code}</p>
            <p>에러 타입: {errorInfo.type}</p>
            <p>Clerk 에러: {errorInfo.isClerkError ? "예" : "아니오"}</p>
            <p>네트워크 에러: {errorInfo.isNetworkError ? "예" : "아니오"}</p>
            {error instanceof Error && (
              <p className="mt-2 break-all">원본 메시지: {error.message}</p>
            )}
          </div>
        </details>
      )}
    </div>
  );
}


import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 상대 시간을 표시하는 함수
 *
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns "방금 전", "3분 전", "2시간 전", "3일 전" 등의 상대 시간 문자열
 *
 * @example
 * formatRelativeTime("2025-01-01T12:00:00Z") // "3시간 전"
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // 잘못된 날짜인 경우 기본 형식 반환
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string:", dateString);
      return dateString;
    }

    // 1분 미만
    if (diffInSeconds < 60) {
      return "방금 전";
    }

    // 1시간 미만
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    }

    // 1일 미만
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    }

    // 7일 미만
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    }

    // 30일 미만
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}주 전`;
    }

    // 1년 미만
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}개월 전`;
    }

    // 1년 이상
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}년 전`;
  } catch (error) {
    console.error("Error formatting relative time:", error);
    // 에러 발생 시 기본 형식 반환
    return dateString;
  }
}

/**
 * Clerk 사용자의 프로필 이미지 URL을 가져오는 함수
 *
 * @param clerkId - Clerk User ID
 * @param clerkImageUrl - Clerk에서 제공하는 프로필 이미지 URL (선택적)
 * @returns 프로필 이미지 URL 또는 기본 아바타 URL
 *
 * @example
 * getProfileImageUrl("user_123", "https://img.clerk.com/...") // "https://img.clerk.com/..."
 * getProfileImageUrl("user_123", null) // "/default-avatar.png" (기본값)
 */
export function getProfileImageUrl(
  clerkId: string | null | undefined,
  clerkImageUrl: string | null | undefined
): string {
  // Clerk 이미지 URL이 있으면 사용
  if (clerkImageUrl) {
    return clerkImageUrl;
  }

  // 기본 아바타 이미지 (향후 추가 가능)
  // 현재는 기본 아이콘을 사용하거나 빈 이미지로 처리
  // TODO: 기본 아바타 이미지 추가
  return "/default-avatar.png";
}

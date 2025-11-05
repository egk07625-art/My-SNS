/**
 * @file lib/utils/clerk-errors.ts
 * @description Clerk 에러 처리 유틸리티
 *
 * Clerk 인증 관련 에러를 처리하고 한국어 메시지로 변환하는 유틸리티 함수들입니다.
 *
 * 주요 기능:
 * 1. ClerkError 타입별 한국어 메시지 매핑
 * 2. 네트워크 에러 감지
 * 3. 에러 타입 분류
 *
 * @dependencies
 * - @clerk/types: ClerkError 타입 (타입 체크용)
 */

/**
 * Clerk 에러 코드별 한국어 메시지 매핑
 */
const CLERK_ERROR_MESSAGES: Record<string, string> = {
  // 인증 실패
  form_identifier_not_found: "이메일 또는 전화번호를 찾을 수 없습니다.",
  form_password_incorrect: "비밀번호가 올바르지 않습니다.",
  form_param_format_invalid: "입력 형식이 올바르지 않습니다.",
  form_identifier_exists: "이미 사용 중인 이메일 또는 전화번호입니다.",
  form_password_pwned: "보안상의 이유로 이 비밀번호를 사용할 수 없습니다.",
  form_password_length_too_short: "비밀번호가 너무 짧습니다.",
  form_password_length_too_long: "비밀번호가 너무 깁니다.",
  form_password_validation_failed: "비밀번호 요구사항을 충족하지 않습니다.",
  
  // 네트워크/서버 에러
  network_error: "네트워크 연결을 확인해주세요.",
  service_unavailable: "서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.",
  too_many_requests: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
  request_timeout: "요청 시간이 초과되었습니다. 다시 시도해주세요.",
  
  // 세션/인증 상태 에러
  session_exists: "이미 로그인되어 있습니다.",
  session_not_found: "세션을 찾을 수 없습니다. 다시 로그인해주세요.",
  session_token_expired: "세션이 만료되었습니다. 다시 로그인해주세요.",
  session_token_invalid: "세션이 유효하지 않습니다. 다시 로그인해주세요.",
  
  // 기타 에러
  unknown_error: "알 수 없는 오류가 발생했습니다.",
  internal_error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
};

/**
 * 기본 에러 메시지
 */
const DEFAULT_ERROR_MESSAGE = "오류가 발생했습니다. 다시 시도해주세요.";

/**
 * 네트워크 에러인지 확인
 */
export function isNetworkError(error: unknown): boolean {
  if (typeof window === "undefined") {
    return false; // 서버 사이드에서는 네트워크 상태 확인 불가
  }

  // 브라우저 네트워크 상태 확인
  if (!navigator.onLine) {
    return true;
  }

  // 에러 객체의 메시지나 코드 확인
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const networkKeywords = [
      "network",
      "fetch",
      "connection",
      "timeout",
      "offline",
      "failed to fetch",
      "networkerror",
    ];
    return networkKeywords.some((keyword) => message.includes(keyword));
  }

  // ClerkError 타입 체크 (타입이 없는 경우를 대비한 문자열 체크)
  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;
    const errors = errorObj.errors;
    
    if (Array.isArray(errors) && errors.length > 0) {
      const firstError = errors[0] as Record<string, unknown>;
      const code = firstError.code;
      if (typeof code === "string") {
        return code === "network_error" || code === "service_unavailable";
      }
    }
    
    // ClerkError의 code 직접 확인
    const code = errorObj.code;
    if (typeof code === "string") {
      return code === "network_error" || code === "service_unavailable";
    }
  }

  return false;
}

/**
 * ClerkError 타입인지 확인
 */
export function isClerkError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const errorObj = error as Record<string, unknown>;
  
  // ClerkError는 일반적으로 errors 배열을 가지고 있음
  if (Array.isArray(errorObj.errors)) {
    return true;
  }
  
  // 또는 code 필드가 있고 Clerk 에러 코드 형식인 경우
  if (typeof errorObj.code === "string") {
    return errorObj.code in CLERK_ERROR_MESSAGES;
  }

  return false;
}

/**
 * 에러 코드 추출
 */
export function getErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const errorObj = error as Record<string, unknown>;
  
  // ClerkError의 errors 배열에서 첫 번째 에러 코드 추출
  if (Array.isArray(errorObj.errors) && errorObj.errors.length > 0) {
    const firstError = errorObj.errors[0] as Record<string, unknown>;
    if (typeof firstError.code === "string") {
      return firstError.code;
    }
  }
  
  // 직접 code 필드 확인
  if (typeof errorObj.code === "string") {
    return errorObj.code;
  }

  // Error 객체의 message에서 코드 추출 시도
  if (error instanceof Error) {
    const message = error.message;
    // "form_identifier_not_found" 같은 형식의 코드를 찾음
    const codeMatch = message.match(/([a-z_]+)/);
    if (codeMatch && codeMatch[1] in CLERK_ERROR_MESSAGES) {
      return codeMatch[1];
    }
  }

  return null;
}

/**
 * 에러를 한국어 메시지로 변환
 */
export function getErrorMessage(error: unknown): string {
  // 네트워크 에러 우선 확인
  if (isNetworkError(error)) {
    return CLERK_ERROR_MESSAGES.network_error || DEFAULT_ERROR_MESSAGE;
  }

  // ClerkError인 경우 코드로 메시지 찾기
  const code = getErrorCode(error);
  if (code && code in CLERK_ERROR_MESSAGES) {
    return CLERK_ERROR_MESSAGES[code];
  }

  // Error 객체의 메시지 반환
  if (error instanceof Error) {
    // 이미 한국어 메시지인 경우 그대로 반환
    if (/[가-힣]/.test(error.message)) {
      return error.message;
    }
    // 영어 메시지인 경우 기본 메시지 반환
    return DEFAULT_ERROR_MESSAGE;
  }

  // 알 수 없는 에러 타입
  return DEFAULT_ERROR_MESSAGE;
}

/**
 * 에러 타입 분류
 */
export type ErrorType = "network" | "authentication" | "validation" | "server" | "unknown";

/**
 * 에러 타입 분류 함수
 */
export function getErrorType(error: unknown): ErrorType {
  if (isNetworkError(error)) {
    return "network";
  }

  const code = getErrorCode(error);
  if (!code) {
    return "unknown";
  }

  // 인증 관련 에러
  if (
    code.includes("password_incorrect") ||
    code.includes("identifier_not_found") ||
    code.includes("session")
  ) {
    return "authentication";
  }

  // 유효성 검사 에러
  if (
    code.includes("format") ||
    code.includes("validation") ||
    code.includes("length") ||
    code.includes("pwned")
  ) {
    return "validation";
  }

  // 서버 에러
  if (
    code.includes("service") ||
    code.includes("internal") ||
    code.includes("timeout")
  ) {
    return "server";
  }

  return "unknown";
}

/**
 * 에러 정보 객체
 */
export interface ErrorInfo {
  message: string;
  type: ErrorType;
  code: string | null;
  isNetworkError: boolean;
  isClerkError: boolean;
}

/**
 * 에러 정보 추출
 */
export function getErrorInfo(error: unknown): ErrorInfo {
  return {
    message: getErrorMessage(error),
    type: getErrorType(error),
    code: getErrorCode(error),
    isNetworkError: isNetworkError(error),
    isClerkError: isClerkError(error),
  };
}


/**
 * @file lib/utils/env-validation.ts
 * @description 환경 변수 검증 유틸리티
 *
 * 개발 환경에서만 실행되는 환경 변수 검증 로직입니다.
 * Clerk 및 Supabase 관련 필수 환경 변수가 설정되어 있는지 확인합니다.
 *
 * @dependencies
 * - 개발 환경에서만 실행 (NODE_ENV === "development")
 */

/**
 * 필수 Clerk 환경 변수 목록
 */
const REQUIRED_CLERK_ENV_VARS = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
] as const;

/**
 * 필수 Supabase 환경 변수 목록
 */
const REQUIRED_SUPABASE_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

/**
 * 환경 변수 검증 결과
 */
export interface EnvValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
}

/**
 * Clerk 환경 변수 검증
 */
export function validateClerkEnv(): EnvValidationResult {
  const missingVars: string[] = [];
  const warnings: string[] = [];

  // 개발 환경에서만 실행
  if (process.env.NODE_ENV !== "development") {
    return {
      isValid: true,
      missingVars: [],
      warnings: [],
    };
  }

  // 필수 환경 변수 확인
  for (const envVar of REQUIRED_CLERK_ENV_VARS) {
    const value = process.env[envVar];
    if (!value || value.trim() === "") {
      missingVars.push(envVar);
    } else if (value.includes("<") || value.includes("placeholder")) {
      warnings.push(`${envVar}에 플레이스홀더 값이 설정되어 있습니다.`);
    }
  }

  // 선택적 환경 변수 확인 (경고만 표시)
  const optionalVars = [
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL",
    "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",
  ] as const;

  for (const envVar of optionalVars) {
    const value = process.env[envVar];
    if (!value || value.trim() === "") {
      warnings.push(`${envVar}가 설정되지 않았습니다. 기본값이 사용됩니다.`);
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  };
}

/**
 * Supabase 환경 변수 검증
 */
export function validateSupabaseEnv(): EnvValidationResult {
  const missingVars: string[] = [];
  const warnings: string[] = [];

  // 개발 환경에서만 실행
  if (process.env.NODE_ENV !== "development") {
    return {
      isValid: true,
      missingVars: [],
      warnings: [],
    };
  }

  // 필수 환경 변수 확인
  for (const envVar of REQUIRED_SUPABASE_ENV_VARS) {
    const value = process.env[envVar];
    if (!value || value.trim() === "") {
      missingVars.push(envVar);
    } else if (value.includes("<") || value.includes("placeholder")) {
      warnings.push(`${envVar}에 플레이스홀더 값이 설정되어 있습니다.`);
    }
  }

  // 선택적 환경 변수 확인
  const optionalVars = ["NEXT_PUBLIC_STORAGE_BUCKET"] as const;

  for (const envVar of optionalVars) {
    const value = process.env[envVar];
    if (!value || value.trim() === "") {
      warnings.push(`${envVar}가 설정되지 않았습니다. 기본값이 사용됩니다.`);
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  };
}

/**
 * 모든 환경 변수 검증
 */
export function validateAllEnv(): EnvValidationResult {
  // 개발 환경에서만 실행
  if (process.env.NODE_ENV !== "development") {
    return {
      isValid: true,
      missingVars: [],
      warnings: [],
    };
  }

  const clerkResult = validateClerkEnv();
  const supabaseResult = validateSupabaseEnv();

  const missingVars = [...clerkResult.missingVars, ...supabaseResult.missingVars];
  const warnings = [...clerkResult.warnings, ...supabaseResult.warnings];

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  };
}

/**
 * 환경 변수 검증 결과를 콘솔에 출력
 */
export function logEnvValidation(): void {
  // 개발 환경에서만 실행
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const result = validateAllEnv();

  if (!result.isValid || result.warnings.length > 0) {
    console.group("🔍 환경 변수 검증 결과");

    if (!result.isValid) {
      console.error("❌ 필수 환경 변수가 누락되었습니다:");
      result.missingVars.forEach((envVar) => {
        console.error(`  - ${envVar}`);
      });
    }

    if (result.warnings.length > 0) {
      console.warn("⚠️ 경고:");
      result.warnings.forEach((warning) => {
        console.warn(`  - ${warning}`);
      });
    }

    console.groupEnd();
  } else {
    console.log("✅ 모든 환경 변수가 올바르게 설정되었습니다.");
  }
}

/**
 * 환경 변수 검증 및 경고 표시 (클라이언트 사이드)
 * 개발 환경에서만 실행되며, 브라우저 콘솔에 경고를 출력합니다.
 */
export function validateEnvClient(): void {
  // 개발 환경에서만 실행
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  // 클라이언트 사이드에서만 실행
  if (typeof window === "undefined") {
    return;
  }

  const result = validateAllEnv();

  if (!result.isValid) {
    console.error(
      "%c❌ 환경 변수 오류",
      "color: red; font-weight: bold; font-size: 14px;"
    );
    console.error("다음 환경 변수가 누락되었습니다:");
    result.missingVars.forEach((envVar) => {
      console.error(`  - ${envVar}`);
    });
    console.error(
      "\n.env 파일을 확인하고 필요한 환경 변수를 설정해주세요."
    );
  }

  if (result.warnings.length > 0) {
    console.warn(
      "%c⚠️ 환경 변수 경고",
      "color: orange; font-weight: bold; font-size: 14px;"
    );
    result.warnings.forEach((warning) => {
      console.warn(`  - ${warning}`);
    });
  }
}


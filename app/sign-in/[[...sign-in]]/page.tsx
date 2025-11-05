import { SignIn } from "@clerk/nextjs";

/**
 * @file app/sign-in/[[...sign-in]]/page.tsx
 * @description Clerk 로그인 페이지
 *
 * Clerk의 SignIn 컴포넌트를 사용하는 로그인 페이지입니다.
 * [[...sign-in]] catch-all 라우트는 Clerk의 모든 sign-in 관련 경로를 처리합니다.
 * 
 * Navbar가 상단에 있으므로, 전체 화면 높이에서 Navbar 높이(64px)를 제외하여 중앙 정렬합니다.
 */

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] mt-16">
      <SignIn />
    </div>
  );
}


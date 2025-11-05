import { SignUp } from "@clerk/nextjs";

/**
 * @file app/sign-up/[[...sign-up]]/page.tsx
 * @description Clerk 회원가입 페이지
 *
 * Clerk의 SignUp 컴포넌트를 사용하는 회원가입 페이지입니다.
 * [[...sign-up]] catch-all 라우트는 Clerk의 모든 sign-up 관련 경로를 처리합니다.
 * 
 * Navbar가 상단에 있으므로, 전체 화면 높이에서 Navbar 높이(64px)를 제외하여 중앙 정렬합니다.
 */

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] mt-16">
      <SignUp />
    </div>
  );
}


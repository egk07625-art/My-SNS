import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { MainLayoutDebug } from "@/components/layout/MainLayoutDebug";

/**
 * @file app/(main)/layout.tsx
 * @description 메인 애플리케이션 레이아웃
 *
 * 인증된 사용자만 접근 가능한 메인 레이아웃입니다.
 * - Desktop (1024px+): Sidebar (244px) + Main Content (중앙 정렬, 최대 630px)
 * - Tablet (768px~1024px): Sidebar (72px 아이콘만) + Main Content
 * - Mobile (<768px): Header + Main Content + BottomNav
 *
 * @dependencies
 * - @clerk/nextjs/server: 인증 확인 (Server Component)
 * - next/navigation: 인증되지 않은 사용자 리다이렉트
 * - components/layout/MainLayoutDebug: 클라이언트 사이드 디버깅 컴포넌트
 */

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 인증 확인
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Desktop & Tablet: Sidebar */}
      <Sidebar />

      {/* Mobile: Header */}
      <Header />

      {/* Main Content */}
      <main
        data-main-layout
        className="md:ml-[72px] lg:ml-[244px] pt-[60px] pb-16 md:pb-0"
      >
        <div className="max-w-[630px] mx-auto px-4 py-4 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile: BottomNav */}
      <BottomNav />

      {/* 개발 환경 디버깅 컴포넌트 */}
      <MainLayoutDebug />
    </div>
  );
}


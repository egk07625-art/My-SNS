"use client";

import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { useEffect, useState } from "react";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { Header } from "@/components/layout/Header";

/**
 * @file app/sign-in/[[...sign-in]]/page.tsx
 * @description Clerk 로그인 페이지
 *
 * - 인스타그램 스타일 배경을 항상 표시 (공개 피드 or 스켈레톤)
 * - 중앙 카드가 배경 위에 오도록 z-index 정렬
 * - 헤더 고정 표시
 */

export default function SignInPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0095f6] mx-auto mb-4"></div>
          <p className="text-sm text-[#8e8e8e]">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent md:ml-[72px] lg:ml-[244px] relative">
      {/* 헤더 표시 */}
      <Header />

      {/* Instagram 스타일 백그라운드 (항상 표시) */}
      <AuthBackground />

      {/* 네트워크 오프라인 상태 알림 */}
      {!isOnline && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] bg-red-500 text-white px-4 py-2 rounded-md shadow-lg text-sm">
          네트워크 연결을 확인해주세요
        </div>
      )}

      {/* 로그인 카드 컨테이너 (배경보다 위) */}
      <div className="w-full max-w-[350px] mx-auto px-4 py-8 md:py-16 relative z-[55]">
        <SignIn
          appearance={clerkAppearance}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          redirectUrl="/"
          fallbackRedirectUrl="/"
        />
      </div>
    </div>
  );
}


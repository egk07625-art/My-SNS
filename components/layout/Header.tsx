"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Heart, MessageCircle, User } from "lucide-react";
import { useLayoutDebug } from "@/hooks/use-layout-debug";

/**
 * @file components/layout/Header.tsx
 * @description 헤더 컴포넌트 (모바일 + 데스크톱)
 *
 * Instagram 스타일의 헤더입니다.
 * - Mobile (<768px): 전체 너비, 좌측 로고 + 우측 아이콘
 * - Desktop/Tablet: 우측 상단에 아이콘만 표시 (사이드바와 함께)
 * - 높이: 60px 고정
 * - 좌측: 로고 (모바일만), 우측: 알림/DM/프로필 아이콘
 * - z-index: 50 (최상단 유지)
 *
 * @dependencies
 * - @clerk/nextjs: 사용자 정보
 * - lucide-react: 아이콘
 * - hooks/use-layout-debug: 디버깅 훅
 */

export function Header() {
  const { user } = useUser();

  const profileHref = user?.id ? `/profile/${user.id}` : "/profile";

  // 디버깅 로그
  useLayoutDebug("Header", {
    userId: user?.id || "null",
    profileHref,
    isVisible: true,
  });

  return (
    <header
      id="mobile-header"
      className="fixed top-0 left-0 right-0 md:left-[72px] lg:left-[244px] h-[60px] bg-white border-b border-[#DBDBDB] md:border-l md:border-l-[#DBDBDB] z-[50] flex items-center justify-between px-4 md:px-6"
    >
      {/* 좌측: 로고 (모바일만) */}
      <Link href="/" className="text-xl font-bold text-[#262626] md:hidden">
        Instagram
      </Link>

      {/* 우측: 아이콘들 */}
      <div className="flex items-center gap-4 md:gap-5 ml-auto">
        <Link
          href="/activity"
          className="text-[#262626] hover:opacity-70 transition-opacity p-1.5 rounded-lg hover:bg-[#FAFAFA]"
          aria-label="활동"
        >
          <Heart className="w-6 h-6 stroke-2" />
        </Link>
        <Link
          href="/messages"
          className="text-[#262626] hover:opacity-70 transition-opacity p-1.5 rounded-lg hover:bg-[#FAFAFA]"
          aria-label="메시지"
        >
          <MessageCircle className="w-6 h-6 stroke-2" />
        </Link>
        <Link
          href={profileHref}
          className="text-[#262626] hover:opacity-70 transition-opacity p-1.5 rounded-lg hover:bg-[#FAFAFA]"
          aria-label="프로필"
        >
          <User className="w-6 h-6 stroke-2" />
        </Link>
      </div>
    </header>
  );
}



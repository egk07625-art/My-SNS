"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { useLayoutDebug } from "@/hooks/use-layout-debug";

/**
 * @file components/Navbar.tsx
 * @description 루트 레이아웃용 Navbar 컴포넌트
 *
 * 인증되지 않은 사용자 또는 (main) 그룹 외부 페이지에서만 표시됩니다.
 * (main) 그룹 내에서는 Sidebar/Header/BottomNav가 사용되므로 완전히 숨김 처리됩니다.
 *
 * @important
 * - (main) 그룹 경로에서는 null을 반환하여 DOM에 렌더링되지 않도록 함
 * - z-index는 30으로 설정하여 Header(z-50)보다 낮게 유지
 */

const Navbar = () => {
  const pathname = usePathname();

  // (main) 그룹 내에서는 Navbar 숨김
  // (main) 그룹의 경로들을 체크하되, 인증 페이지나 테스트 페이지는 제외
  const isMainRoute =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/post") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/create") ||
    pathname.startsWith("/activity") ||
    pathname === "/";

  // 인증 페이지나 테스트 페이지는 Navbar 표시
  const isAuthPage =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/auth-test") ||
    pathname.startsWith("/storage-test");

  // (main) 그룹 내 경로이면서 인증 페이지가 아닌 경우에만 Navbar 숨김
  const shouldHide = isMainRoute && !isAuthPage;

  // 디버깅 로그
  useLayoutDebug("Navbar", {
    pathname,
    isMainRoute,
    isAuthPage,
    shouldHide,
    willRender: !shouldHide,
  });

  // (main) 그룹 내 경로이면서 인증 페이지가 아닌 경우 완전히 렌더링하지 않음
  if (shouldHide) {
    return null;
  }

  return (
    <header className="relative z-30 flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="text-2xl font-bold">
        SaaS Template
      </Link>
      <div className="flex gap-4 items-center">
        <SignedOut>
          <SignInButton mode="modal">
            <Button>로그인</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default Navbar;

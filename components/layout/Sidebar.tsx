"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Home,
  Search,
  PlusSquare,
  User,
} from "lucide-react";

/**
 * @file components/layout/Sidebar.tsx
 * @description Desktop/Tablet 사이드바 컴포넌트
 *
 * Instagram 스타일의 사이드바입니다.
 * - Desktop (1024px+): 244px 너비, 아이콘 + 텍스트
 * - Tablet (768px~1024px): 72px 너비, 아이콘만
 * - Mobile (<768px): 숨김 (BottomNav 사용)
 *
 * @dependencies
 * - next/navigation: 현재 경로 확인
 * - @clerk/nextjs: 사용자 정보
 * - lucide-react: 아이콘
 */

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "홈",
    icon: Home,
  },
  {
    href: "/search",
    label: "검색",
    icon: Search,
  },
  {
    href: "/create",
    label: "만들기",
    icon: PlusSquare,
  },
  {
    href: "/profile",
    label: "프로필",
    icon: User,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  // 현재 경로가 활성화된 메뉴인지 확인
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // 프로필 링크에 사용자 ID 추가 (임시로 /profile 사용, 나중에 동적 라우트로 변경)
  const getProfileHref = () => {
    if (user?.id) {
      return `/profile/${user.id}`;
    }
    return "/profile";
  };

  return (
    <aside className="hidden md:block fixed left-0 top-0 h-screen bg-white border-r border-[#DBDBDB] z-40">
      {/* Desktop: 244px 너비 (1024px 이상) */}
      <div className="hidden lg:flex w-[244px] h-full flex-col">
        <div className="p-6">
          <Link
            href="/"
            className="text-2xl font-bold text-[#262626] mb-8 block"
          >
            Instagram
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              const href =
                item.href === "/profile" ? getProfileHref() : item.href;

              return (
                <Link
                  key={item.href}
                  href={href}
                  className={`flex items-center gap-4 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? "font-semibold text-[#262626]"
                      : "font-normal text-[#262626] hover:bg-[#FAFAFA]"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      active ? "stroke-[2.5] fill-current" : "stroke-2"
                    }`}
                  />
                  <span className="text-base">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tablet: 72px 너비 (아이콘만, 768px~1023px) */}
      <div className="hidden md:flex lg:hidden w-[72px] h-full flex-col items-center pt-4 pb-4">
        <Link
          href="/"
          className="text-2xl font-bold text-[#262626] mb-8 w-full flex items-center justify-center min-h-[40px] px-2 hover:opacity-70 transition-opacity"
          title="Instagram"
        >
          <span className="leading-none select-none block">I</span>
        </Link>

        <nav className="space-y-4 flex flex-col items-center">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const href =
              item.href === "/profile" ? getProfileHref() : item.href;

            return (
              <Link
                key={item.href}
                href={href}
                className={`p-2 rounded-lg transition-colors ${
                  active
                    ? "text-[#262626]"
                    : "text-[#262626] hover:bg-[#FAFAFA]"
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-6 h-6 ${
                    active ? "stroke-[2.5] fill-current" : "stroke-2"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  User,
} from "lucide-react";

/**
 * @file components/layout/BottomNav.tsx
 * @description Mobile 전용 하단 네비게이션 컴포넌트
 *
 * Instagram 스타일의 모바일 하단 네비게이션입니다.
 * - Mobile (<768px) 전용
 * - 높이: 50px 고정
 * - 하단 고정 (fixed position)
 * - 5개 아이콘: 홈, 검색, 만들기, 좋아요(활동), 프로필
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
    href: "/activity",
    label: "활동",
    icon: Heart,
  },
  {
    href: "/profile",
    label: "프로필",
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  // 현재 경로가 활성화된 메뉴인지 확인
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // 프로필 링크에 사용자 ID 추가
  const getProfileHref = () => {
    if (user?.id) {
      return `/profile/${user.id}`;
    }
    return "/profile";
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-white border-t border-[#DBDBDB] z-50 flex items-center justify-around">
      {navItems.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        const href = item.href === "/profile" ? getProfileHref() : item.href;

        return (
          <Link
            key={item.href}
            href={href}
            className={`flex items-center justify-center w-full h-full transition-colors ${
              active ? "text-[#262626]" : "text-[#262626] opacity-60"
            }`}
            aria-label={item.label}
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
  );
}


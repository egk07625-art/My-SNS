/**
 * @file components/layout/MainLayoutDebug.tsx
 * @description 메인 레이아웃 디버깅 컴포넌트
 *
 * 개발 환경에서만 활성화되는 클라이언트 사이드 디버깅 컴포넌트입니다.
 * 레이아웃 요소들의 실제 렌더링 상태, z-index, 미디어 쿼리 상태를 확인합니다.
 */

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  debugLayout,
  debugZIndex,
  getMediaQueryStatus,
  debugElementStyles,
} from "@/lib/utils/layout-debug";

export function MainLayoutDebug() {
  const pathname = usePathname();

  useEffect(() => {
    // 프로덕션에서는 작동하지 않음
    if (process.env.NODE_ENV !== "development") return;

    // 초기 레이아웃 상태 로깅
    const logLayoutStatus = () => {
      const mediaStatus = getMediaQueryStatus();

      console.group("=== Main Layout Debug ===");
      debugLayout("MainLayout", {
        pathname,
        ...mediaStatus,
        timestamp: new Date().toISOString(),
      });

      // z-index 계층 구조 확인
      debugZIndex("Sidebar", 40);
      debugZIndex("Header (Mobile)", 50);
      debugZIndex("BottomNav", 50);
      debugZIndex("Navbar", 30);

      // 실제 DOM 요소 확인
      setTimeout(() => {
        const header = document.getElementById("mobile-header");
        const navbar = document.querySelector("header");
        const sidebar = document.querySelector("aside");

        console.group("=== DOM Elements ===");
        console.log("Header element:", header ? "Found" : "Not found");
        console.log("Navbar element:", navbar ? "Found" : "Not found");
        console.log("Sidebar element:", sidebar ? "Found" : "Not found");

        if (header) {
          debugElementStyles("mobile-header");
        }
        console.groupEnd();
      }, 100);

      console.groupEnd();
    };

    // 초기 로깅
    logLayoutStatus();

    // 리사이즈 이벤트 리스너
    const handleResize = () => {
      logLayoutStatus();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [pathname]);

  // UI에는 아무것도 렌더링하지 않음
  return null;
}




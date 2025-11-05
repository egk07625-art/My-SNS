"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

/**
 * @file components/auth/ModalBackgroundContent.tsx
 * @description Clerk 모달이 열릴 때 백그라운드에 표시할 Instagram 홈 페이지 컴포넌트
 *
 * Clerk 모달이 열렸을 때 백그라운드에 Instagram 홈 페이지를 표시합니다.
 * 모달 상태는 DOM을 확인하여 감지합니다.
 *
 * @dependencies
 * - next/dynamic: 동적 import를 통한 PostFeed 컴포넌트 로드
 */

// 동적 import로 PostFeed 컴포넌트 로드
const PostFeed = dynamic(() => import("@/components/post/PostFeed"), {
  ssr: false, // 모달 백그라운드에서는 SSR 불필요
});

export function ModalBackgroundContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Clerk 모달이 열렸는지 확인하는 함수
    const checkModalState = () => {
      // Clerk 모달은 일반적으로 포털을 통해 body에 추가됩니다
      // 여러 선택자를 시도하여 모달 감지
      // Clerk 모달은 일반적으로 [role="dialog"] 또는 특정 클래스를 가집니다
      const modalElement =
        document.querySelector('[role="dialog"]') ||
        document.querySelector('#clerk-components [role="dialog"]') ||
        document.querySelector('#clerk-components [class*="cl-modal"]') ||
        document.querySelector('[data-clerk-modal="true"]') ||
        document.querySelector('[class*="cl-modal"]') ||
        document.querySelector('[class*="clerk-modal"]') ||
        document.querySelector('[id*="clerk-modal"]') ||
        // Clerk 모달 포털은 일반적으로 특정 클래스나 ID를 가집니다
        document.querySelector('body > [class*="cl-modal"]') ||
        document.querySelector('body > [id*="cl-modal"]') ||
        // Radix UI 기반 모달 (Clerk이 사용)
        document.querySelector('[data-radix-portal] [role="dialog"]') ||
        // clerk-components 내부에 콘텐츠가 있는지 확인 (모달이 열리면 콘텐츠가 추가됨)
        (document.getElementById('clerk-components') && 
         document.getElementById('clerk-components')!.children.length > 0);
      
      const isOpen = !!modalElement;
      setIsModalOpen(isOpen);
      
      // 디버깅 로그 (개발 환경에서만)
      if (process.env.NODE_ENV === "development") {
        if (isOpen && !document.querySelector('[data-modal-bg-logged]')) {
          console.log("[ModalBackgroundContent] Modal detected:", modalElement);
          // 로그가 중복되지 않도록 마커 추가
          const marker = document.createElement('div');
          marker.setAttribute('data-modal-bg-logged', 'true');
          marker.style.display = 'none';
          document.body.appendChild(marker);
        }
      }
    };

    // 초기 확인
    checkModalState();

    // MutationObserver를 사용하여 DOM 변화 감지
    const observer = new MutationObserver(() => {
      checkModalState();
    });

    // body 요소의 변화 감지
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "data-clerk-modal", "role"],
    });

    // 주기적으로도 확인 (안전장치)
    const interval = setInterval(checkModalState, 200);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // 모달이 열리지 않았으면 아무것도 렌더링하지 않음
  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[45] overflow-auto bg-[#FAFAFA] pointer-events-none">
      {/* Instagram 홈 페이지 콘텐츠 */}
      <div className="min-h-screen pt-[60px] pb-16 md:pb-0 md:pt-0">
        <div className="max-w-[630px] mx-auto px-4 py-4 md:py-8">
          {/* 빈 initialPosts를 전달하고 API 호출을 비활성화 (인증되지 않은 사용자도 볼 수 있도록) */}
          <PostFeed initialPosts={[]} disableApiCall={true} />
        </div>
      </div>
    </div>
  );
}


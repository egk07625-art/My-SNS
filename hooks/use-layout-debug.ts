/**
 * @file hooks/use-layout-debug.ts
 * @description 레이아웃 디버깅을 위한 커스텀 훅
 *
 * 클라이언트 사이드에서 레이아웃 상태를 추적하고 디버깅하는 훅입니다.
 * 개발 환경에서만 활성화됩니다.
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getMediaQueryStatus, debugLayout } from '@/lib/utils/layout-debug';

/**
 * 레이아웃 디버깅 훅
 * @param componentName - 컴포넌트 이름
 * @param additionalData - 추가 디버깅 데이터
 */
export function useLayoutDebug(
  componentName: string,
  additionalData: Record<string, unknown> = {}
) {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const mediaStatus = getMediaQueryStatus();

    debugLayout(componentName, {
      pathname,
      ...mediaStatus,
      ...additionalData,
    });
  }, [componentName, pathname, additionalData]);
}

/**
 * 미디어 쿼리 상태를 추적하는 훅
 */
export function useMediaQuery() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined')
      return;

    const updateStatus = () => {
      const status = getMediaQueryStatus();
      console.log('[Media Query]', status);
    };

    updateStatus();
    window.addEventListener('resize', updateStatus);

    return () => {
      window.removeEventListener('resize', updateStatus);
    };
  }, []);
}




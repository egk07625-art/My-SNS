/**
 * @file lib/utils/layout-debug.ts
 * @description 레이아웃 디버깅 유틸리티
 *
 * 레이아웃 컴포넌트의 렌더링 상태를 추적하고 디버깅하는 유틸리티 함수들입니다.
 * 개발 환경에서만 작동하며, 프로덕션에서는 자동으로 비활성화됩니다.
 *
 * @features
 * - 레이아웃 컴포넌트 렌더링 추적
 * - z-index 계층 구조 확인
 * - 미디어 쿼리 상태 확인
 * - CSS 충돌 감지
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * 레이아웃 디버깅 정보를 콘솔에 출력
 */
export function debugLayout(context: string, data: Record<string, unknown>) {
  if (!isDevelopment) return;

  console.group(`[Layout Debug] ${context}`);
  Object.entries(data).forEach(([key, value]) => {
    console.log(`${key}:`, value);
  });
  console.groupEnd();
}

/**
 * z-index 계층 구조 확인
 */
export function debugZIndex(layerName: string, zIndex: number | string) {
  if (!isDevelopment) return;

  console.log(`[Z-Index] ${layerName}: ${zIndex}`);
}

/**
 * 미디어 쿼리 상태 확인 (클라이언트 사이드)
 */
export function getMediaQueryStatus(): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
} {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: false,
      width: 0,
    };
  }

  const width = window.innerWidth;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return { isMobile, isTablet, isDesktop, width };
}

/**
 * 레이아웃 요소의 실제 스타일 확인
 */
export function debugElementStyles(elementId: string) {
  if (!isDevelopment || typeof document === 'undefined') return;

  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`[Layout Debug] Element not found: ${elementId}`);
    return;
  }

  const styles = window.getComputedStyle(element);
  console.group(`[Layout Debug] Element Styles: ${elementId}`);
  console.log('Position:', styles.position);
  console.log('Z-Index:', styles.zIndex);
  console.log('Display:', styles.display);
  console.log('Visibility:', styles.visibility);
  console.log('Top:', styles.top);
  console.log('Left:', styles.left);
  console.log('Width:', styles.width);
  console.log('Height:', styles.height);
  console.groupEnd();
}




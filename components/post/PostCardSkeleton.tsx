/**
 * @file components/post/PostCardSkeleton.tsx
 * @description 게시물 카드 스켈레톤 컴포넌트
 *
 * 게시물 로딩 중 표시되는 스켈레톤 UI입니다.
 * PostCard와 동일한 레이아웃 구조를 가집니다.
 *
 * 주요 기능:
 * - 헤더 섹션 스켈레톤 (프로필 이미지, 사용자명, 시간)
 * - 이미지 섹션 스켈레톤 (정사각형)
 * - 액션 버튼 섹션 스켈레톤
 * - 컨텐츠 섹션 스켈레톤 (좋아요, 캡션, 댓글)
 * - Shimmer 애니메이션 효과
 *
 * @dependencies
 * - globals.css: shimmer 애니메이션 정의
 */

export function PostCardSkeleton() {
  return (
    <article className="bg-white border border-[#DBDBDB] rounded-lg overflow-hidden">
      {/* 헤더 섹션 (60px 높이) */}
      <header className="h-[60px] px-4 flex items-center justify-between border-b border-[#DBDBDB]">
        {/* 좌측: 프로필 이미지 + 사용자명 + 시간 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* 프로필 이미지 스켈레톤 (32px 원형) */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 animate-shimmer" />

          {/* 사용자명 + 시간 스켈레톤 */}
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <div className="h-3 w-20 bg-gray-200 rounded animate-shimmer" />
            <div className="h-2 w-16 bg-gray-200 rounded animate-shimmer" />
          </div>
        </div>

        {/* 우측: 메뉴 버튼 스켈레톤 */}
        <div className="flex-shrink-0 w-5 h-5 bg-gray-200 rounded animate-shimmer" />
      </header>

      {/* 이미지 섹션 스켈레톤 (정사각형) */}
      <div className="relative w-full aspect-square bg-gray-200 animate-shimmer" />

      {/* 액션 버튼 섹션 (48px 높이) */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#DBDBDB]">
        {/* 좌측: 좋아요, 댓글, 공유 버튼 */}
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-gray-200 rounded animate-shimmer" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-shimmer" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-shimmer" />
        </div>

        {/* 우측: 북마크 버튼 */}
        <div className="w-6 h-6 bg-gray-200 rounded animate-shimmer" />
      </div>

      {/* 컨텐츠 섹션 */}
      <div className="px-4 pb-4 space-y-3 pt-3">
        {/* 좋아요 수 스켈레톤 */}
        <div className="h-4 w-24 bg-gray-200 rounded animate-shimmer" />

        {/* 캡션 스켈레톤 */}
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-gray-200 rounded animate-shimmer" />
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-shimmer" />
        </div>

        {/* 댓글 미리보기 스켈레톤 */}
        <div className="space-y-2">
          <div className="h-3 w-20 bg-gray-200 rounded animate-shimmer" />
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-gray-200 rounded animate-shimmer" />
            <div className="h-3 w-5/6 bg-gray-200 rounded animate-shimmer" />
          </div>
        </div>
      </div>
    </article>
  );
}


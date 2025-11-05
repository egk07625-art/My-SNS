"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { MoreVertical } from "lucide-react";
import { formatRelativeTime, getProfileImageUrl } from "@/lib/utils";
import type { PostWithUser } from "@/lib/types";

/**
 * @file components/post/PostCard.tsx
 * @description 게시물 카드 컴포넌트
 *
 * Instagram 스타일의 게시물 카드 컴포넌트입니다.
 * 현재는 헤더 섹션만 구현되어 있으며, 향후 이미지, 액션 버튼, 컨텐츠 섹션이 추가될 예정입니다.
 *
 * 주요 기능:
 * - 헤더 섹션 (프로필 이미지, 사용자명, 시간, 메뉴)
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - next/link: 클라이언트 사이드 네비게이션
 * - lucide-react: 아이콘
 * - lib/utils: 상대 시간 변환, 프로필 이미지 URL
 */

interface PostCardProps {
  post: PostWithUser;
}

// 기본 아바타 data URI (1x1 투명 PNG)
const DEFAULT_AVATAR_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23E5E7EB'/%3E%3Ccircle cx='16' cy='12' r='5' fill='%239CA3AF'/%3E%3Cpath d='M6 28c0-5 4-9 10-9s10 4 10 9' fill='%239CA3AF'/%3E%3C/svg%3E";

export function PostCard({ post }: PostCardProps) {
  // props 검증
  if (!post || !post.user) {
    console.error("PostCard: Invalid post or user data", post);
    return null;
  }

  const { user } = post;

  // 프로필 이미지 로드 실패 상태 관리
  const [imageError, setImageError] = useState(false);
  const hasErrorHandled = useRef(false);

  // 프로필 이미지 URL 가져오기
  // TODO: Clerk에서 프로필 이미지 URL 가져오기 (현재는 기본 이미지 사용)
  const profileImageUrl = getProfileImageUrl(user.clerk_id, null);
  
  // 기본 아바타 URL인 경우 바로 기본 아바타 표시 (파일이 없으므로)
  const shouldUseDefaultAvatar = profileImageUrl === "/default-avatar.png" || !profileImageUrl;

  // 상대 시간 표시
  const relativeTime = formatRelativeTime(post.created_at);

  // 프로필 페이지 링크
  const profileHref = `/profile/${user.clerk_id}`;

  // 이미지 에러 핸들러 (무한 루프 방지)
  const handleImageError = () => {
    if (!hasErrorHandled.current) {
      hasErrorHandled.current = true;
      setImageError(true);
    }
  };

  // 기본 아바타 컴포넌트
  const DefaultAvatar = () => (
    <div
      className="w-full h-full bg-gray-200 flex items-center justify-center"
      style={{
        backgroundImage: `url("${DEFAULT_AVATAR_DATA_URI}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-label={`${user.name}의 프로필`}
    />
  );

  return (
    <article className="bg-white border border-[#DBDBDB] rounded-lg overflow-hidden">
      {/* 헤더 섹션 (60px 높이) */}
      <header className="h-[60px] px-4 flex items-center justify-between border-b border-[#DBDBDB]">
        {/* 좌측: 프로필 이미지 + 사용자명 + 시간 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* 프로필 이미지 (32px 원형) */}
          <Link
            href={profileHref}
            className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-200 hover:opacity-80 transition-opacity"
          >
            {shouldUseDefaultAvatar || imageError ? (
              // 기본 아바타 또는 이미지 로드 실패 시 기본 아바타 (SVG data URI)
              <DefaultAvatar />
            ) : (
              <Image
                src={profileImageUrl}
                alt={`${user.name}의 프로필`}
                width={32}
                height={32}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            )}
          </Link>

          {/* 사용자명 + 시간 */}
          <div className="flex flex-col min-w-0 flex-1">
            <Link
              href={profileHref}
              className="font-semibold text-[#262626] text-sm hover:opacity-70 transition-opacity truncate"
            >
              {user.name}
            </Link>
            <time
              className="text-xs text-[#8E8E8E]"
              dateTime={post.created_at}
              title={new Date(post.created_at).toLocaleString("ko-KR")}
            >
              {relativeTime}
            </time>
          </div>
        </div>

        {/* 우측: ⋯ 메뉴 버튼 */}
        <button
          type="button"
          className="flex-shrink-0 p-2 hover:bg-[#FAFAFA] rounded-full transition-colors"
          aria-label="더보기 메뉴"
          onClick={() => {
            // TODO: 드롭다운 메뉴 구현 (삭제 옵션 등)
            console.log("Menu clicked for post:", post.id);
          }}
        >
          <MoreVertical className="w-5 h-5 text-[#262626]" />
        </button>
      </header>

      {/* 이미지 섹션 */}
      {post.image_url && (
        <div className="relative w-full aspect-square bg-gray-100">
          <Image
            src={post.image_url}
            alt={post.caption || "게시물 이미지"}
            fill
            className="object-cover"
            onError={(e) => {
              console.warn("Post image load failed:", post.image_url);
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* 액션 버튼 섹션 (향후 구현) */}
      {/* <div className="h-12 px-4 flex items-center justify-between">
        ...
      </div> */}

      {/* 컨텐츠 섹션 */}
      <div className="px-4 pb-4 space-y-2">
        {/* 좋아요 수 */}
        {post.likes_count !== undefined && post.likes_count > 0 && (
          <div className="text-sm font-semibold text-[#262626]">
            좋아요 {post.likes_count.toLocaleString()}개
          </div>
        )}

        {/* 캡션 */}
        {post.caption && (
          <div className="text-sm text-[#262626]">
            <Link
              href={profileHref}
              className="font-semibold hover:opacity-70 transition-opacity mr-2"
            >
              {user.name}
            </Link>
            <span>{post.caption}</span>
          </div>
        )}

        {/* 댓글 미리보기 */}
        {post.comments_count !== undefined && post.comments_count > 0 && (
          <div className="space-y-1">
            {/* "댓글 N개 모두 보기" 링크 */}
            {post.comments_count > 2 ? (
              <button
                key="view-all-comments"
                type="button"
                className="text-sm text-[#8E8E8E] hover:text-[#262626] transition-colors"
                onClick={() => {
                  // TODO: 댓글 상세 모달 또는 페이지로 이동
                  console.log("View all comments for post:", post.id);
                }}
              >
                댓글 {post.comments_count}개 모두 보기
              </button>
            ) : null}

            {/* 댓글 미리보기 (최신 2개) */}
            {post.comments_preview && post.comments_preview.length > 0 ? (
              <div key="comments-preview" className="space-y-1">
                {post.comments_preview.map((comment) => (
                  <div key={comment.id} className="text-sm text-[#262626]">
                    <Link
                      href={`/profile/${comment.user.clerk_id}`}
                      className="font-semibold hover:opacity-70 transition-opacity mr-2"
                    >
                      {comment.user.name}
                    </Link>
                    <span>{comment.content}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}


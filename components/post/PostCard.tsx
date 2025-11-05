"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MoreVertical, Heart } from "lucide-react";
import { formatRelativeTime, getProfileImageUrl } from "@/lib/utils";
import type { PostWithUser } from "@/lib/types";

/**
 * @file components/post/PostCard.tsx
 * @description 게시물 카드 컴포넌트
 *
 * Instagram 스타일의 게시물 카드 컴포넌트입니다.
 *
 * 주요 기능:
 * - 헤더 섹션 (프로필 이미지, 사용자명, 시간, 메뉴)
 * - 이미지 섹션 (더블탭 좋아요 지원)
 * - 액션 버튼 섹션 (좋아요 버튼)
 * - 컨텐츠 섹션 (좋아요 수, 캡션, 댓글 미리보기)
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

  // post.id 검증 (필수)
  if (!post.id || typeof post.id !== "string" || post.id.trim() === "") {
    console.error("PostCard: Invalid or missing post.id", {
      postId: post.id,
      post: post,
      postKeys: Object.keys(post),
    });
    return null;
  }

  const { user } = post;

  // 프로필 이미지 로드 실패 상태 관리
  const [imageError, setImageError] = useState(false);
  const hasErrorHandled = useRef(false);

  // 좋아요 상태 관리
  const [isLiked, setIsLiked] = useState(post.is_liked ?? false);
  const [likesCount, setLikesCount] = useState(post.likes_count ?? 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // post.id를 useRef로 저장 (항상 최신 값 참조)
  // post.id가 이미 검증되었으므로 안전하게 사용 가능
  const postIdRef = useRef(post.id);
  // post가 변경될 때마다 ref 업데이트
  useEffect(() => {
    if (post.id && typeof post.id === "string" && post.id.trim() !== "") {
      postIdRef.current = post.id;
    } else {
      console.warn("PostCard: post.id became invalid", post.id);
    }
  }, [post.id]);

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

  // 좋아요 토글 핸들러
  const handleLikeToggle = useCallback(async (showDoubleTap = false) => {
    // postId 검증 (useRef로 항상 최신 값 참조)
    const currentPostId = postIdRef.current;
    if (!currentPostId || typeof currentPostId !== "string" || currentPostId.trim() === "") {
      console.error("[PostCard] Invalid post.id in handleLikeToggle:", {
        currentPostId,
        postIdFromRef: postIdRef.current,
        postIdFromProps: post.id,
        postObject: post,
      });
      return;
    }

    // 중복 요청 방지
    if (isLoading) {
      console.log("[PostCard] Like request already in progress, ignoring");
      return;
    }

    // Optimistic Update: 상태를 먼저 업데이트
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);
    setIsLoading(true);
    setIsAnimating(true);

    // 더블탭 시 큰 하트 애니메이션 표시
    if (showDoubleTap && newIsLiked) {
      setShowDoubleTapHeart(true);
      setTimeout(() => {
        setShowDoubleTapHeart(false);
      }, 600);
    }

    try {
      console.group("[PostCard] Like toggle");
      console.log("Post ID:", currentPostId);
      console.log("Action:", newIsLiked ? "Like" : "Unlike");

      const requestBody = { post_id: currentPostId };
      console.log("Request body:", requestBody);

      const method = newIsLiked ? "POST" : "DELETE";
      const response = await fetch("/api/likes", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      console.log("Like toggle successful");
      console.groupEnd();
    } catch (error) {
      console.error("[PostCard] Like toggle failed:", error);
      console.groupEnd();

      // 실패 시 이전 상태로 롤백
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      setShowDoubleTapHeart(false);

      // 사용자에게 에러 알림 (추후 toast로 개선 가능)
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
    } finally {
      setIsLoading(false);
      // 애니메이션 종료 (CSS transition 시간에 맞춰)
      setTimeout(() => {
        setIsAnimating(false);
      }, 200);
    }
  }, [isLiked, likesCount, isLoading]);

  // 더블탭 핸들러
  const handleDoubleClick = useCallback(() => {
    console.log("[PostCard] Double tap detected on image");
    
    // 더블탭 시 좋아요가 아니면 좋아요 생성
    if (!isLiked && postIdRef.current) {
      handleLikeToggle(true);
    }
  }, [isLiked, handleLikeToggle]);

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
            className="object-cover select-none"
            onError={(e) => {
              console.warn("Post image load failed:", post.image_url);
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
            onDoubleClick={handleDoubleClick}
          />
          {/* 더블탭 큰 하트 애니메이션 */}
          {showDoubleTapHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in-out">
              <Heart
                className="w-24 h-24 text-white fill-red-500"
                style={{
                  filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* 액션 버튼 섹션 */}
      <div className="h-12 px-4 flex items-center gap-4">
        {/* 좋아요 버튼 */}
        <button
          type="button"
          className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isLiked ? "좋아요 취소" : "좋아요"}
          onClick={() => handleLikeToggle(false)}
          disabled={isLoading || !postIdRef.current}
        >
          <Heart
            className={`w-6 h-6 transition-all duration-200 ${
              isLiked
                ? "text-red-500 fill-red-500"
                : "text-[#262626] fill-none"
            } ${
              isAnimating ? "scale-[1.3]" : "scale-100"
            }`}
          />
        </button>

        {/* 댓글 버튼 (향후 구현) */}
        {/* <button
          type="button"
          className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
          aria-label="댓글"
        >
          <MessageCircle className="w-6 h-6 text-[#262626]" />
        </button> */}
      </div>

      {/* 컨텐츠 섹션 */}
      <div className="px-4 pb-4 space-y-2">
        {/* 좋아요 수 */}
        {likesCount > 0 && (
          <div className="text-sm font-semibold text-[#262626]">
            좋아요 {likesCount.toLocaleString()}개
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


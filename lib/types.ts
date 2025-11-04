/**
 * @file lib/types.ts
 * @description TypeScript 타입 정의
 *
 * 데이터베이스 스키마 기반 타입 정의입니다.
 * Supabase 데이터베이스의 테이블 구조와 일치하도록 작성되었습니다.
 *
 * @see {@link /supabase/migrations/sns_shema.sql} - 데이터베이스 스키마
 */

// ============================================
// User 타입
// ============================================
export interface User {
  id: string; // UUID
  clerk_id: string; // Clerk User ID
  name: string;
  created_at: string; // ISO 8601 datetime string
}

// ============================================
// Post 타입
// ============================================
export interface Post {
  id: string; // UUID
  user_id: string; // UUID (users.id 참조)
  image_url: string; // Supabase Storage URL
  caption: string | null; // 최대 2,200자 (애플리케이션에서 검증)
  created_at: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
  // JOIN된 데이터 (선택적)
  user?: User; // users 테이블 JOIN 결과
  likes_count?: number; // post_stats 뷰에서 가져온 좋아요 수
  comments_count?: number; // post_stats 뷰에서 가져온 댓글 수
  is_liked?: boolean; // 현재 사용자가 좋아요 했는지 여부
}

// ============================================
// PostWithUser 타입 (필수 사용자 정보 포함)
// ============================================
export interface PostWithUser extends Post {
  user: User; // 필수: 사용자 정보가 반드시 포함되어야 함
}

// ============================================
// Like 타입
// ============================================
export interface Like {
  id: string; // UUID
  post_id: string; // UUID (posts.id 참조)
  user_id: string; // UUID (users.id 참조)
  created_at: string; // ISO 8601 datetime string
}

// ============================================
// Comment 타입
// ============================================
export interface Comment {
  id: string; // UUID
  post_id: string; // UUID (posts.id 참조)
  user_id: string; // UUID (users.id 참조)
  content: string;
  created_at: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
  // JOIN된 데이터 (선택적)
  user?: User; // users 테이블 JOIN 결과
}

// ============================================
// CommentWithUser 타입 (필수 사용자 정보 포함)
// ============================================
export interface CommentWithUser extends Comment {
  user: User; // 필수: 사용자 정보가 반드시 포함되어야 함
}

// ============================================
// Follow 타입
// ============================================
export interface Follow {
  id: string; // UUID
  follower_id: string; // UUID (users.id 참조) - 팔로우하는 사람
  following_id: string; // UUID (users.id 참조) - 팔로우받는 사람
  created_at: string; // ISO 8601 datetime string
}

// ============================================
// API 응답 타입
// ============================================

// 게시물 목록 조회 응답
export interface PostsResponse {
  posts: PostWithUser[];
  hasMore: boolean; // 다음 페이지가 있는지 여부
  total: number; // 전체 게시물 수
}

// 단일 게시물 조회 응답
export interface PostResponse {
  post: PostWithUser | null;
}


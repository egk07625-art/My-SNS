# SNS 프로젝트 TODO

## 📊 전체 진행 상황

- [x] 1. 기본 세팅 (100%)
- [x] 2. 레이아웃 구조 (100%)
- [~] 3. 홈 피드 페이지 (70%)
- [ ] 4. 좋아요 기능 (0%)
- [ ] 5. 게시물 작성 (0%)
- [ ] 6. 댓글 기능 (30%)
- [ ] 7. 프로필 페이지 (0%)
- [ ] 8. 팔로우 기능 (0%)

**전체 완료율**: 약 30%

---

## 1. 기본 세팅 ✅

- [x] Next.js + TypeScript 프로젝트 생성
- [x] Tailwind CSS 설정 (인스타 컬러 스키마)
- [x] Clerk 인증 연동 (한국어 설정)
- [x] Supabase 프로젝트 생성 및 연동
- [x] 기본 데이터베이스 테이블 생성
  - [x] users 테이블
  - [x] posts 테이블
  - [x] likes 테이블
  - [x] comments 테이블
  - [x] follows 테이블
- [x] post_stats 뷰 생성 (좋아요 수, 댓글 수 통계)
- [x] Clerk → Supabase 사용자 동기화 (SyncUserProvider)

---

## 2. 레이아웃 구조 ✅

- [x] Sidebar 컴포넌트 (Desktop/Tablet 반응형)
  - [x] Desktop (1024px+): 244px 너비, 아이콘 + 텍스트
  - [x] Tablet (768px~1024px): 72px 너비, 아이콘만
  - [x] Mobile (<768px): 숨김
- [x] Header 컴포넌트 (Mobile 전용)
- [x] BottomNav 컴포넌트 (Mobile 전용, 5개 아이콘)
- [x] (main) Route Group 및 레이아웃 통합
- [x] 인증 미들웨어 (인증되지 않은 사용자 `/sign-in` 리다이렉트)
- [x] 반응형 레이아웃 (Desktop/Tablet/Mobile)

---

## 3. 홈 피드 페이지 🔄

### 3-1. 게시물 목록 (완료 ✅)

- [x] PostCard 컴포넌트
  - [x] 헤더 섹션 (프로필 이미지, 사용자명, 시간, 메뉴 버튼)
  - [x] 이미지 섹션 (정사각형 1:1 비율)
  - [x] 좋아요 수 표시
  - [x] 캡션 표시 (사용자명 + 내용)
  - [x] 댓글 미리보기 (최신 2개)
  - [x] "댓글 N개 모두 보기" 링크 (댓글 2개 초과 시)
- [x] PostCardSkeleton 로딩 UI
  - [x] PostCard와 동일한 레이아웃 구조
  - [x] Shimmer 애니메이션 효과 (globals.css)
- [x] PostFeed 컴포넌트
  - [x] 게시물 목록 렌더링
  - [x] 무한 스크롤 (Intersection Observer)
  - [x] 페이지네이션 (10개씩 로드)
  - [x] 초기 로딩 상태 (PostCardSkeleton)
  - [x] 추가 로딩 상태 (하단에 PostCardSkeleton)
  - [x] 에러 처리 및 재시도 버튼
  - [x] "모든 게시물을 불러왔습니다" 메시지
- [x] API 라우트
  - [x] `/api/posts` GET API (페이지네이션)
    - [x] 시간 역순 정렬
    - [x] 좋아요 수, 댓글 수 포함 (post_stats 뷰)
    - [x] 사용자 정보 JOIN
    - [x] 현재 사용자 좋아요 상태 포함 (is_liked)
    - [x] 댓글 미리보기 (최신 2개) 포함
    - [x] hasMore, total 응답
  - [x] `/api/posts/[postId]` GET API (단일 게시물)
    - [x] UUID 형식 검증
    - [x] 게시물 조회
    - [x] 사용자 정보 JOIN
    - [x] 좋아요 상태 확인
    - [x] 에러 처리 (404, 400, 500)
- [x] 타입 정의 (`lib/types.ts`)
  - [x] PostWithUser 인터페이스
  - [x] CommentWithUser 인터페이스
  - [x] comments_preview 필드 추가
  - [x] PostsResponse, PostResponse 인터페이스
- [x] 커스텀 훅
  - [x] useInfiniteScroll 훅 (`hooks/use-infinite-scroll.ts`)
    - [x] Intersection Observer API 활용
    - [x] cleanup 함수로 메모리 누수 방지
    - [x] 재사용 가능한 구조

### 3-2. 좋아요 기능 (미구현 📋)

- [ ] PostCard에 좋아요 버튼 추가
  - [ ] 좋아요 아이콘 (Heart, lucide-react)
  - [ ] 빈 하트 ↔ 빨간 하트 상태 전환
  - [ ] 클릭 시 좋아요/좋아요 취소
  - [ ] 애니메이션 (scale(1.3) → scale(1))
  - [ ] 더블탭 좋아요 (모바일, 이미지 영역)
  - [ ] 더블탭 시 큰 하트 등장 애니메이션
- [ ] `/api/likes` POST API (좋아요 생성)
  - [ ] 인증 확인
  - [ ] post_id 검증
  - [ ] 중복 좋아요 방지
  - [ ] 에러 처리
- [ ] `/api/likes` DELETE API (좋아요 취소)
  - [ ] 인증 확인
  - [ ] 좋아요 관계 확인
  - [ ] 삭제 실행
  - [ ] 에러 처리
- [ ] 좋아요 상태 관리
  - [ ] 클라이언트 상태 업데이트 (Optimistic Update)
  - [ ] 좋아요 수 실시간 업데이트
  - [ ] 에러 시 롤백

---

## 4. 게시물 작성 기능 📋

### 4-1. 게시물 작성 모달

- [ ] CreatePostModal 컴포넌트
  - [ ] Dialog UI (shadcn/ui Dialog 컴포넌트)
  - [ ] 이미지 업로드 영역
    - [ ] 드래그 앤 드롭 지원
    - [ ] 파일 선택 버튼
  - [ ] 이미지 미리보기
    - [ ] 이미지 크롭/리사이즈 (선택적)
    - [ ] 이미지 제거 버튼
  - [ ] 캡션 입력 필드
    - [ ] 최대 2,200자 제한
    - [ ] 글자 수 표시
    - [ ] 텍스트 영역 (자동 높이 조절)
  - [ ] 게시 버튼
    - [ ] 로딩 상태 표시
    - [ ] 비활성화 (이미지 없을 때)
  - [ ] 취소 버튼
  - [ ] 에러 메시지 표시

### 4-2. 이미지 업로드

- [ ] Supabase Storage 버킷 설정 확인
  - [ ] `uploads` 버킷 존재 확인
  - [ ] RLS 정책 확인 (개발 중 비활성화)
- [ ] `/api/posts` POST API
  - [ ] 인증 확인
  - [ ] 파일 업로드 로직
    - [ ] FormData 파싱
    - [ ] 이미지 파일 검증 (파일 타입, 크기 최대 5MB)
    - [ ] Supabase Storage에 업로드
    - [ ] 파일 경로 생성 (`{clerk_user_id}/{filename}`)
  - [ ] 데이터베이스에 게시물 저장
    - [ ] posts 테이블에 INSERT
    - [ ] 사용자 정보 연결
  - [ ] 에러 처리
    - [ ] 파일 업로드 실패
    - [ ] DB 저장 실패
    - [ ] 롤백 로직 (업로드된 파일 삭제)
- [ ] 업로드 진행률 표시 (선택적)
- [ ] 게시물 작성 후 피드 갱신
  - [ ] PostFeed 상태 업데이트
  - [ ] 새 게시물 목록 상단에 추가

---

## 5. 댓글 기능 📋

### 5-1. 댓글 작성

- [ ] PostCard에 댓글 입력창 추가
  - [ ] "댓글 달기..." 플레이스홀더
  - [ ] Enter 키로 작성 (Shift+Enter는 줄바꿈)
  - [ ] "게시" 버튼
  - [ ] 로딩 상태 표시
- [ ] CommentForm 컴포넌트 (선택적, 재사용 가능하게)
  - [ ] 입력 필드
  - [ ] 게시 버튼
  - [ ] 에러 처리
- [ ] `/api/comments` POST API
  - [ ] 인증 확인
  - [ ] post_id, content 검증
  - [ ] content 최대 길이 검증 (선택적)
  - [ ] comments 테이블에 INSERT
  - [ ] 에러 처리
- [ ] 댓글 작성 후 UI 업데이트
  - [ ] 댓글 수 증가 (comments_count)
  - [ ] 댓글 미리보기 갱신 (최신 2개)
  - [ ] 입력창 초기화
  - [ ] Optimistic Update 적용

### 5-2. 댓글 삭제

- [ ] 댓글에 삭제 버튼 추가
  - [ ] 본인 댓글만 표시 (⋯ 메뉴 또는 직접 버튼)
  - [ ] 삭제 확인 모달 (선택적)
- [ ] `/api/comments/[commentId]` DELETE API
  - [ ] 인증 확인
  - [ ] 댓글 소유자 확인
  - [ ] 댓글 삭제 실행
  - [ ] 에러 처리 (404, 403, 500)
- [ ] 댓글 삭제 후 UI 업데이트
  - [ ] 댓글 수 감소
  - [ ] 댓글 미리보기에서 제거
  - [ ] Optimistic Update 적용

### 5-3. 댓글 상세 보기

- [ ] "댓글 N개 모두 보기" 클릭 기능
  - [ ] PostModal 또는 별도 페이지로 이동
  - [ ] 댓글 목록 전체 표시
- [ ] CommentList 컴포넌트
  - [ ] 댓글 목록 렌더링
  - [ ] 사용자명 + 댓글 내용
  - [ ] 댓글 시간 표시
  - [ ] 삭제 버튼 (본인만)
  - [ ] 스크롤 가능한 영역
- [ ] 댓글 무한 스크롤 (선택적)
  - [ ] 댓글이 많을 경우 페이지네이션
  - [ ] `/api/comments?postId={id}&limit={limit}&offset={offset}` API

---

## 6. 프로필 페이지 📋

### 6-1. 프로필 헤더

- [ ] `/profile/[userId]` 동적 라우트 생성
  - [ ] `app/(main)/profile/[userId]/page.tsx` 파일 생성
  - [ ] userId 파라미터 처리 (clerk_id 또는 UUID)
- [ ] 프로필 헤더 컴포넌트 (`components/profile/ProfileHeader.tsx`)
  - [ ] 프로필 이미지
    - [ ] Desktop: 150px 원형
    - [ ] Mobile: 90px 원형
    - [ ] Clerk 프로필 이미지 또는 기본 아바타
  - [ ] 사용자명 (Bold)
  - [ ] 통계 정보
    - [ ] 게시물 수
    - [ ] 팔로워 수
    - [ ] 팔로잉 수
  - [ ] 팔로우/언팔로우 버튼
    - [ ] 본인 프로필 제외
    - [ ] FollowButton 컴포넌트 사용
  - [ ] Bio 표시 (선택적, users 테이블에 bio 필드 추가 필요)
- [ ] `/api/users/[userId]` GET API
  - [ ] userId로 사용자 정보 조회
  - [ ] 게시물 수, 팔로워 수, 팔로잉 수 포함
  - [ ] 현재 사용자 팔로우 상태 포함
  - [ ] 에러 처리 (404, 500)

### 6-2. 게시물 그리드

- [ ] 3열 그리드 레이아웃 (`components/profile/PostGrid.tsx`)
  - [ ] Desktop: 3열 고정
  - [ ] Tablet: 3열 고정
  - [ ] Mobile: 2-3열 반응형
  - [ ] 1:1 정사각형 비율
- [ ] `/api/posts`에 `userId` 쿼리 파라미터 추가
  - [ ] userId가 있으면 해당 사용자 게시물만 필터링
  - [ ] 페이지네이션 지원
- [ ] 게시물 이미지 썸네일 표시
  - [ ] Next.js Image 컴포넌트 사용
  - [ ] Hover 시 좋아요/댓글 수 오버레이
  - [ ] 클릭 시 게시물 상세 모달 또는 페이지
- [ ] 빈 상태 처리
  - [ ] 게시물이 없을 때 메시지 표시

---

## 7. 팔로우 기능 📋

### 7-1. API 구현

- [ ] `/api/follows` POST API (팔로우)
  - [ ] 인증 확인
  - [ ] following_id 검증 (UUID 형식)
  - [ ] 자기 자신 팔로우 방지
  - [ ] 중복 팔로우 방지
  - [ ] follows 테이블에 INSERT
  - [ ] 에러 처리 (400, 409, 404, 500)
- [ ] `/api/follows` DELETE API (언팔로우)
  - [ ] 인증 확인
  - [ ] following_id 검증
  - [ ] 팔로우 관계 확인
  - [ ] follows 테이블에서 DELETE
  - [ ] 에러 처리 (404, 500)
- [ ] `/api/follows/status` GET API (팔로우 상태 조회, 선택적)
  - [ ] userId 쿼리 파라미터
  - [ ] 현재 사용자의 팔로우 상태 반환
  - [ ] 팔로워 수, 팔로잉 수 포함

### 7-2. UI 구현

- [ ] FollowButton 컴포넌트 (`components/profile/FollowButton.tsx`)
  - [ ] "팔로우" 버튼 (파란색 `#0095f6`, 미팔로우 상태)
  - [ ] "팔로잉" 버튼 (회색, 팔로우 상태)
  - [ ] Hover 시 "언팔로우" (빨간 테두리)
  - [ ] 클릭 시 즉시 UI 업데이트 (Optimistic Update)
  - [ ] 로딩 상태 표시
  - [ ] 에러 처리 (토스트 메시지)
- [ ] 프로필 페이지에 팔로우 버튼 통합
  - [ ] ProfileHeader에 FollowButton 추가
  - [ ] 본인 프로필일 때는 숨김
- [ ] 팔로워/팔로잉 수 실시간 업데이트
  - [ ] 팔로우/언팔로우 시 숫자 즉시 업데이트

---

## 8. 기타 개선 사항 📋

### 8-1. 게시물 메뉴

- [ ] PostCard 헤더의 "⋯" 메뉴 구현
  - [ ] 드롭다운 메뉴 (shadcn/ui DropdownMenu)
  - [ ] 삭제 옵션 (본인 게시물만)
    - [ ] 삭제 확인 모달
    - [ ] `/api/posts/[postId]` DELETE API
    - [ ] 삭제 후 피드에서 제거
  - [ ] 신고 옵션 (선택적, 미구현)

### 8-2. 게시물 상세 모달

- [ ] PostModal 컴포넌트 (`components/post/PostModal.tsx`)
  - [ ] Desktop: 모달 형태 (중앙 정렬)
    - [ ] 이미지 영역 (좌측 50%)
    - [ ] 댓글 영역 (우측 50%, 스크롤 가능)
  - [ ] Mobile: 전체 페이지 (`/post/[postId]`)
  - [ ] 이미지 표시
  - [ ] 게시물 정보 (좋아요 수, 캡션)
  - [ ] 댓글 목록 (CommentList 컴포넌트 재사용)
  - [ ] 댓글 작성 폼 (CommentForm 컴포넌트 재사용)
  - [ ] 닫기 버튼 (Desktop)

### 8-3. 에러 처리 강화

- [ ] 네트워크 에러 처리
  - [ ] 오프라인 상태 감지
  - [ ] 재시도 로직 개선
- [ ] 사용자 친화적 에러 메시지
  - [ ] 토스트 알림 (shadcn/ui toast)
  - [ ] 에러 타입별 메시지
- [ ] 재시도 로직 개선
  - [ ] 자동 재시도 (지수 백오프)
  - [ ] 재시도 횟수 제한

### 8-4. 성능 최적화

- [ ] 이미지 최적화
  - [ ] Next.js Image 컴포넌트 사용 (이미 적용됨)
  - [ ] 이미지 lazy loading
  - [ ] 이미지 포맷 최적화 (WebP)
- [ ] 코드 스플리팅
  - [ ] 모달 컴포넌트 동적 import
  - [ ] 프로필 페이지 동적 import
- [ ] 메모이제이션 적용
  - [ ] React.memo (PostCard)
  - [ ] useMemo, useCallback 최적화

---

## 9. 프로젝트 설정 파일 📋

### 9-1. Cursor 설정

- [x] `.cursor/rules/` 커서룰
  - [x] Next.js 컨벤션
  - [x] Supabase 관련 규칙
  - [x] TDD 가이드
  - [x] Git 컨벤션
- [ ] `.cursor/mcp.json` MCP 서버 설정
- [ ] `.cursor/dir.md` 프로젝트 디렉토리 구조 문서

### 9-2. GitHub 설정

- [ ] `.github/workflows/` CI/CD 설정
  - [ ] 빌드 테스트
  - [ ] 린트 검사
  - [ ] 자동 배포 (선택적)
- [ ] `.github/ISSUE_TEMPLATE/` 이슈 템플릿
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` PR 템플릿

### 9-3. Git Hooks

- [ ] `.husky/` 디렉토리
  - [ ] pre-commit hook (린트 검사)
  - [ ] commit-msg hook (커밋 메시지 검증)

### 9-4. 앱 메타데이터

- [ ] `app/favicon.ico` 파일
- [ ] `app/not-found.tsx` 파일 (404 페이지)
- [ ] `app/robots.ts` 파일 (SEO)
- [ ] `app/sitemap.ts` 파일 (SEO)
- [ ] `app/manifest.ts` 파일 (PWA)

### 9-5. Public 디렉토리

- [ ] `public/icons/` 디렉토리
  - [ ] 아이콘 파일들
- [ ] `public/logo.png` 파일
- [ ] `public/og-image.png` 파일 (Open Graph 이미지)

### 9-6. 설정 파일 검증

- [x] `tsconfig.json` 파일
- [ ] `.cursorignore` 파일
- [x] `.gitignore` 파일
- [ ] `.prettierignore` 파일
- [ ] `.prettierrc` 파일 (Prettier 설정)
- [x] `eslint.config.mjs` 파일
- [x] `AGENTS.md` 파일

---

## 10. 테스트 및 배포 📋

### 10-1. 테스트

- [ ] 단위 테스트 (선택적)
  - [ ] 유틸리티 함수 테스트
  - [ ] 커스텀 훅 테스트
- [ ] 통합 테스트 (선택적)
  - [ ] API 라우트 테스트
- [ ] E2E 테스트 (Playwright)
  - [ ] 로그인 플로우
  - [ ] 게시물 작성 플로우
  - [ ] 댓글 작성 플로우
  - [ ] 팔로우 플로우

### 10-2. 배포 준비

- [ ] 환경 변수 설정
  - [ ] 프로덕션 환경 변수 확인
  - [ ] Vercel 환경 변수 설정
- [ ] Vercel 배포 설정
  - [ ] 빌드 설정 확인
  - [ ] 환경 변수 연결
- [ ] 도메인 설정 (선택적)
- [ ] SEO 최적화
  - [ ] 메타 태그 설정
  - [ ] Open Graph 설정
  - [ ] sitemap.xml 생성

---

## 참고

- **PRD 문서**: `docs/PRD.md`
- **구현 계획**: `docs/implementation-plan-*.md`
- **마지막 업데이트**: 2025-01-27

---

## 진행 상황 업데이트 로그

### 2025-01-27 (최신)

- 홈 피드 페이지 버그 수정 완료
  - React key prop 경고 해결 (PostFeed, PostCard)
  - 이미지 로드 무한 루프 문제 해결 (기본 아바타 처리)
  - Next.js Image 설정 업데이트 (images.unsplash.com 호스트 추가)
  - 기본 아바타 SVG fallback 구현 (파일 없이도 동작)
  - 에러 핸들링 개선 (프로필 이미지 로드 실패 시)

### 2025-01-27

- TODO.md 파일 고도화 및 최신화 완료
  - PRD.md 기반으로 체계적으로 재구성
  - 현재 구현 상태 반영 (완료/진행 중/미구현)
  - 우선순위와 의존성 명시
  - 체크박스로 진행 상황 추적 가능

### 2025-01-27 (이전)

- 홈 피드 페이지 게시물 목록 기능 완료
  - PostCard, PostCardSkeleton, PostFeed 컴포넌트 구현
  - 무한 스크롤 및 페이지네이션 구현
  - 댓글 미리보기 기능 추가 (최신 2개)
  - 단일 게시물 API 구현 (`/api/posts/[postId]`)
  - useInfiniteScroll 커스텀 훅 구현
  - 에러 처리 및 재시도 로직 구현

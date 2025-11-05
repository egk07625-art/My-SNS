# Instagram Clone SNS 샘플 데이터 생성 가이드

Instagram Clone SNS 스키마를 기반으로 포괄적인 샘플 데이터를 생성하는 방법입니다.

## 생성되는 데이터

이 스크립트는 다음 데이터를 생성합니다:

1. **사용자 (Users)**
   - 기존 사용자 활용 또는 샘플 사용자 생성 (최대 3명)

2. **게시글 (Posts)**
   - 5개의 게시글
   - Unsplash 이미지 URL 사용
   - 다양한 작성 시간 (2시간 전 ~ 3일 전)
   - 한국어 캡션 포함

3. **좋아요 (Likes)**
   - 게시글별로 1~3개의 좋아요
   - 총 6개의 좋아요

4. **댓글 (Comments)**
   - 게시글별로 1~2개의 댓글
   - 총 5개의 댓글
   - 한국어 댓글

5. **팔로우 (Follows)**
   - 사용자 간 팔로우 관계
   - 총 3개의 팔로우 관계

## 사용 방법

### 방법 1: Supabase 대시보드 SQL Editor 사용 (권장)

#### 단계별 절차

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 사이드바에서 **SQL Editor** 클릭
   - 또는 상단 메뉴에서 **SQL Editor** 선택

3. **새 쿼리 작성**
   - **New query** 버튼 클릭
   - 또는 빈 에디터 영역 클릭

4. **SQL 스크립트 복사 후 붙여넣기**
   - `supabase/seed_sample_data.sql` 파일의 전체 내용 복사
   - SQL Editor에 붙여넣기

5. **실행**
   - **RUN** 버튼 클릭 (또는 `Ctrl + Enter` / `Cmd + Enter`)
   - 실행 결과 확인

6. **확인 쿼리 실행 (선택사항)**

```sql
-- 게시글 확인 (좋아요/댓글 수 포함)
SELECT 
  p.id,
  u.name as author,
  p.caption,
  p.created_at,
  (SELECT COUNT(*) FROM public.likes WHERE post_id = p.id) as likes_count,
  (SELECT COUNT(*) FROM public.comments WHERE post_id = p.id) as comments_count
FROM public.posts p
JOIN public.users u ON p.user_id = u.id
ORDER BY p.created_at DESC;

-- post_stats 뷰 확인
SELECT 
  post_id,
  user_id,
  likes_count,
  comments_count,
  created_at
FROM public.post_stats
ORDER BY created_at DESC
LIMIT 5;

-- user_stats 뷰 확인
SELECT 
  user_id,
  name,
  posts_count,
  followers_count,
  following_count
FROM public.user_stats
ORDER BY posts_count DESC;
```

---

## 스크립트 동작 방식

### 1. 사용자 처리
- 기존 사용자 수를 확인
- 사용자가 3명 미만이면 샘플 사용자 자동 생성
- 사용자 ID를 임시 테이블에 저장하여 후속 쿼리에서 사용

### 2. 게시글 생성
- 5개의 게시글을 생성
- Unsplash 이미지 URL 사용 (1080px 너비)
- 다양한 작성 시간 설정:
  - 2시간 전
  - 5시간 전
  - 1일 전
  - 2일 전
  - 3일 전

### 3. 좋아요 생성
- 첫 번째 게시글: 2개 좋아요
- 두 번째 게시글: 1개 좋아요
- 세 번째 게시글: 3개 좋아요
- 중복 좋아요 방지 (UNIQUE 제약조건)

### 4. 댓글 생성
- 첫 번째 게시글: 2개 댓글
- 두 번째 게시글: 1개 댓글
- 세 번째 게시글: 2개 댓글
- 자연스러운 한국어 댓글

### 5. 팔로우 관계 생성
- user_2가 user_1을 팔로우
- user_3이 user_1을 팔로우
- user_1이 user_2를 팔로우
- 자기 자신 팔로우 방지 (CHECK 제약조건)

---

## 결과 확인

### 홈 피드에서 확인
1. 브라우저에서 `http://localhost:3000` 접속
2. 홈 피드에 5개의 샘플 게시글이 표시되는지 확인
3. 각 게시글의 좋아요/댓글 수가 표시되는지 확인
4. 게시글은 최신순(created_at DESC)으로 정렬되어 표시됩니다

### post_stats 뷰 확인
- `post_stats` 뷰는 자동으로 좋아요/댓글 수를 계산합니다
- 다음 쿼리로 확인:
  ```sql
  SELECT * FROM public.post_stats ORDER BY created_at DESC;
  ```

### user_stats 뷰 확인
- `user_stats` 뷰는 자동으로 게시물 수, 팔로워 수, 팔로잉 수를 계산합니다
- 다음 쿼리로 확인:
  ```sql
  SELECT * FROM public.user_stats;
  ```

---

## 문제 해결

### 에러: "사용자를 찾을 수 없습니다"
- 스크립트가 자동으로 샘플 사용자를 생성합니다
- 만약 에러가 발생하면, `users` 테이블에 최소 1명의 사용자가 있는지 확인하세요

### 에러: "UNIQUE constraint violation"
- 중복 데이터 삽입 시도 시 발생할 수 있습니다
- 이미 데이터가 존재하는 경우, 먼저 기존 데이터를 삭제하세요 (아래 참고)

### 기존 샘플 데이터 삭제
샘플 데이터를 다시 생성하려면 먼저 기존 데이터를 삭제하세요:

```sql
-- 주의: 이 쿼리는 모든 데이터를 삭제합니다!
-- 외래키 제약조건으로 인해 순서대로 삭제해야 합니다.

DELETE FROM public.follows;
DELETE FROM public.comments;
DELETE FROM public.likes;
DELETE FROM public.posts;
-- users 테이블은 삭제하지 않습니다 (기존 사용자 유지)
```

---

## 생성되는 데이터 요약

| 항목 | 개수 | 설명 |
|------|------|------|
| 게시글 | 5개 | Unsplash 이미지, 한국어 캡션 |
| 좋아요 | 6개 | 게시글별로 1~3개씩 |
| 댓글 | 5개 | 게시글별로 1~2개씩 |
| 팔로우 | 3개 | 사용자 간 팔로우 관계 |

---

## 추가 정보

- 모든 샘플 데이터는 `post_stats` 및 `user_stats` 뷰에서 자동으로 통계가 계산됩니다
- `created_at` 타임스탬프는 게시글 작성 시간을 기준으로 설정됩니다
- 중복 데이터 방지를 위해 `ON CONFLICT` 절을 사용합니다
- 임시 테이블은 스크립트 실행 후 자동으로 삭제됩니다

---

## 관련 파일

- `supabase/seed_sample_data.sql` - 전체 샘플 데이터 생성 스크립트
- `supabase/seed_sample_posts.sql` - 게시글만 생성하는 간단한 스크립트
- `supabase/migrations/sns_shema.sql` - 데이터베이스 스키마 정의


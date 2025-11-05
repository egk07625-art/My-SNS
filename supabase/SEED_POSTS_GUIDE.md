# 게시글 샘플 데이터 생성 가이드

홈 피드 테스트를 위한 샘플 게시글 5개를 생성하는 방법입니다.

## 방법 1: Supabase 대시보드 SQL Editor 사용 (권장)

### 단계별 절차

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 사이드바에서 **SQL Editor** 클릭
   - 또는 상단 메뉴에서 **SQL Editor** 선택

3. **새 쿼리 작성**
   - **New query** 버튼 클릭
   - 또는 빈 에디터 영역 클릭

4. **아래 SQL 스크립트 복사 후 붙여넣기**

```sql
-- ============================================
-- 게시글 샘플 데이터 삽입 (5개)
-- ============================================
-- Unsplash 이미지 URL 사용
-- 사용자 ID: 22692d4d-4b51-4362-b2a3-02cd5d37f5d8

INSERT INTO public.posts (user_id, image_url, caption, created_at, updated_at)
VALUES
  (
    '22692d4d-4b51-4362-b2a3-02cd5d37f5d8',
    'https://images.unsplash.com/photo-1762268773812-ecc373ab25d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    '오늘 하루도 자연과 함께 🌿 아침 산책하면서 만난 풍경이 너무 아름다워서 담아봤어요. 이런 날이면 모든 걱정이 사라지는 것 같아요.',
    now() - INTERVAL '2 hours',
    now() - INTERVAL '2 hours'
  ),
  (
    '22692d4d-4b51-4362-b2a3-02cd5d37f5d8',
    'https://images.unsplash.com/photo-1762268773805-67cbc382cc88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHwyfHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    '휴가의 추억 ✈️',
    now() - INTERVAL '5 hours',
    now() - INTERVAL '5 hours'
  ),
  (
    '22692d4d-4b51-4362-b2a3-02cd5d37f5d8',
    'https://images.unsplash.com/photo-1762245267105-8c8dcb5e7180?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHwzfHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    '일상의 소중함을 느끼는 순간들. 작은 것들에도 감사하는 마음을 갖고 싶어요. 오늘도 행복한 하루 보내세요! 😊',
    now() - INTERVAL '1 day',
    now() - INTERVAL '1 day'
  ),
  (
    '22692d4d-4b51-4362-b2a3-02cd5d37f5d8',
    'https://images.unsplash.com/photo-1762245265298-19aa1625f40d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHw0fHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    '새로운 시작을 향해 🚀 항상 도전하는 마음으로 살고 싶어요.',
    now() - INTERVAL '2 days',
    now() - INTERVAL '2 days'
  ),
  (
    '22692d4d-4b51-4362-b2a3-02cd5d37f5d8',
    'https://images.unsplash.com/photo-1762245282007-1fe7e42d027b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHw1fHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    '평화로운 순간들 ☕',
    now() - INTERVAL '3 days',
    now() - INTERVAL '3 days'
  );
```

5. **실행**
   - **RUN** 버튼 클릭 (또는 `Ctrl + Enter` / `Cmd + Enter`)
   - 실행 결과 확인

6. **확인 쿼리 실행 (선택사항)**

```sql
-- 삽입된 게시글 확인
SELECT 
  id,
  user_id,
  caption,
  created_at,
  image_url
FROM public.posts
ORDER BY created_at DESC
LIMIT 5;

-- post_stats 뷰에서 자동 계산된 통계 확인
SELECT 
  post_id,
  user_id,
  likes_count,
  comments_count,
  created_at
FROM public.post_stats
ORDER BY created_at DESC
LIMIT 5;
```

---

## 방법 2: API 엔드포인트 사용

### 전제 조건
- 개발 서버가 실행 중이어야 합니다 (`pnpm dev`)
- 인증된 사용자로 로그인되어 있어야 합니다

### 단계별 절차

1. **개발 서버 실행 확인**
   ```bash
   # 터미널에서 확인
   # http://localhost:3000 에 접속 가능한지 확인
   ```

2. **브라우저 개발자 도구 열기**
   - 브라우저에서 `F12` 또는 `Ctrl + Shift + I` (Windows) / `Cmd + Option + I` (Mac)
   - **Console** 탭 선택

3. **아래 JavaScript 코드 복사 후 실행**

```javascript
fetch('http://localhost:3000/api/admin/seed-posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then(response => response.json())
  .then(data => {
    console.log('✅ 성공:', data);
    console.log('생성된 게시글 수:', data.posts?.length || 0);
  })
  .catch(error => {
    console.error('❌ 오류:', error);
  });
```

4. **또는 터미널에서 curl 사용 (PowerShell)**

```powershell
# PowerShell에서 실행
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/seed-posts" -Method POST -ContentType "application/json"
```

---

## 결과 확인

### 홈 피드에서 확인
1. 브라우저에서 `http://localhost:3000` 접속
2. 홈 피드에 5개의 샘플 게시글이 표시되는지 확인
3. 게시글은 최신순(created_at DESC)으로 정렬되어 표시됩니다

### 생성되는 게시글 정보
- **총 5개의 게시글**
- **Unsplash 이미지** 사용 (1080px 너비)
- **한국어 캡션** 포함
- **다양한 작성 시간**: 2시간 전 ~ 3일 전
- **좋아요/댓글 수**: 초기값 0 (post_stats 뷰에서 자동 계산)

---

## 문제 해결

### 에러: "사용자를 찾을 수 없습니다"
- `users` 테이블에 데이터가 있는지 확인
- API를 사용하는 경우, 먼저 로그인하여 사용자가 생성되었는지 확인

### 에러: "인증이 필요합니다"
- API를 사용하는 경우, 먼저 로그인해야 합니다
- SQL Editor를 사용하는 경우 이 문제가 발생하지 않습니다

### 게시글이 표시되지 않음
- 브라우저 캐시 클리어 후 새로고침
- 개발 서버 콘솔에서 에러 확인
- Supabase 대시보드에서 `posts` 테이블 데이터 확인

---

## 추가 정보

- 샘플 데이터 삭제가 필요한 경우:
  ```sql
  DELETE FROM public.posts WHERE user_id = '22692d4d-4b51-4362-b2a3-02cd5d37f5d8';
  ```

- `post_stats` 뷰는 자동으로 좋아요/댓글 수를 계산합니다
- 모든 게시글은 동일한 사용자(`22692d4d-4b51-4362-b2a3-02cd5d37f5d8`)로 생성됩니다


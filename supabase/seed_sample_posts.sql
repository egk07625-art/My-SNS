-- ============================================
-- 게시글 샘플 데이터 삽입 스크립트
-- ============================================
-- 이 스크립트는 홈 피드 테스트를 위한 샘플 게시글 5개를 생성합니다.
-- 
-- 사용 방법:
-- 1. Supabase 대시보드 → SQL Editor 열기
-- 2. 이 파일의 내용을 복사하여 붙여넣기
-- 3. RUN 버튼 클릭 (또는 Ctrl+Enter)
-- 
-- 상세 가이드: supabase/SEED_POSTS_GUIDE.md 참고
-- ============================================

-- 게시글 샘플 데이터 삽입 (5개)
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

-- 삽입 확인 쿼리 (선택사항)
-- SELECT COUNT(*) as total_posts FROM public.posts;

-- post_stats 뷰에서 자동 계산된 통계 확인 (선택사항)
-- SELECT 
--   post_id,
--   user_id,
--   likes_count,
--   comments_count,
--   created_at
-- FROM public.post_stats
-- ORDER BY created_at DESC
-- LIMIT 5;


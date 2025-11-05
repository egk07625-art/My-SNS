-- ============================================
-- Instagram Clone SNS 샘플 데이터 삽입 스크립트
-- ============================================
-- 이 스크립트는 홈 피드 테스트를 위한 포괄적인 샘플 데이터를 생성합니다.
-- 
-- 생성되는 데이터:
-- 1. 샘플 사용자 (기존 사용자 + 추가 샘플 사용자)
-- 2. 게시글 (5개)
-- 3. 좋아요 (일부 게시글에 좋아요 추가)
-- 4. 댓글 (일부 게시글에 댓글 추가)
-- 5. 팔로우 관계 (사용자 간 팔로우)
-- 
-- 사용 방법:
-- 1. Supabase 대시보드 → SQL Editor 열기
-- 2. 이 파일의 내용을 복사하여 붙여넣기
-- 3. RUN 버튼 클릭 (또는 Ctrl+Enter)
-- 
-- 참고: 기존 사용자 ID를 확인하고 아래 스크립트에서 수정해야 할 수 있습니다.
-- ============================================

-- ============================================
-- 1. 기존 사용자 확인 및 샘플 사용자 추가
-- ============================================
-- 먼저 기존 사용자가 있는지 확인하고, 없으면 샘플 사용자를 생성합니다.
-- 기존 사용자 ID를 사용하려면 아래 쿼리로 확인 후 user_id_1, user_id_2 등을 수정하세요.

-- 기존 사용자 확인 쿼리 (주석 해제하여 실행):
-- SELECT id, clerk_id, name FROM users LIMIT 3;

-- 샘플 사용자 생성 (기존 사용자가 부족한 경우)
-- 주의: clerk_id는 실제 Clerk 사용자 ID와 일치해야 합니다.
-- 테스트용으로 더미 clerk_id를 사용하지만, 실제 환경에서는 실제 Clerk ID를 사용해야 합니다.

DO $$
DECLARE
    user_count INTEGER;
    sample_user_1_id UUID;
    sample_user_2_id UUID;
    sample_user_3_id UUID;
    existing_user_id UUID;
BEGIN
    -- 기존 사용자 수 확인
    SELECT COUNT(*) INTO user_count FROM public.users;
    
    -- 기존 사용자 중 첫 번째 사용자 ID 가져오기
    SELECT id INTO existing_user_id FROM public.users LIMIT 1;
    
    -- 사용자가 1명만 있으면 샘플 사용자 2명 추가
    IF user_count < 3 THEN
        -- 샘플 사용자 1 생성
        INSERT INTO public.users (clerk_id, name)
        VALUES ('sample_user_clerk_001', '샘플 사용자 1')
        ON CONFLICT (clerk_id) DO NOTHING
        RETURNING id INTO sample_user_1_id;
        
        -- 샘플 사용자 2 생성
        INSERT INTO public.users (clerk_id, name)
        VALUES ('sample_user_clerk_002', '샘플 사용자 2')
        ON CONFLICT (clerk_id) DO NOTHING
        RETURNING id INTO sample_user_2_id;
        
        -- 샘플 사용자 3 생성
        INSERT INTO public.users (clerk_id, name)
        VALUES ('sample_user_clerk_003', '샘플 사용자 3')
        ON CONFLICT (clerk_id) DO NOTHING
        RETURNING id INTO sample_user_3_id;
    END IF;
END $$;

-- 사용자 ID 변수 설정을 위한 임시 테이블 생성
CREATE TEMP TABLE IF NOT EXISTS temp_user_ids (
    user_key TEXT PRIMARY KEY,
    user_id UUID
);

-- 사용자 ID 저장
INSERT INTO temp_user_ids (user_key, user_id)
SELECT 'user_1', id FROM public.users ORDER BY created_at ASC LIMIT 1
ON CONFLICT (user_key) DO UPDATE SET user_id = EXCLUDED.user_id;

INSERT INTO temp_user_ids (user_key, user_id)
SELECT 'user_2', id FROM public.users ORDER BY created_at ASC OFFSET 1 LIMIT 1
ON CONFLICT (user_key) DO UPDATE SET user_id = EXCLUDED.user_id;

INSERT INTO temp_user_ids (user_key, user_id)
SELECT 'user_3', id FROM public.users ORDER BY created_at ASC OFFSET 2 LIMIT 1
ON CONFLICT (user_key) DO UPDATE SET user_id = EXCLUDED.user_id;

-- ============================================
-- 2. 게시글 삽입 (5개)
-- ============================================
-- Unsplash 이미지 URL 사용
-- 다양한 작성 시간 설정

INSERT INTO public.posts (user_id, image_url, caption, created_at, updated_at)
SELECT
    (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1'),
    'https://images.unsplash.com/photo-1762268773812-ecc373ab25d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    '오늘 하루도 자연과 함께 🌿 아침 산책하면서 만난 풍경이 너무 아름다워서 담아봤어요. 이런 날이면 모든 걱정이 사라지는 것 같아요.',
    now() - INTERVAL '2 hours',
    now() - INTERVAL '2 hours'
WHERE EXISTS (SELECT 1 FROM temp_user_ids WHERE user_key = 'user_1');

INSERT INTO public.posts (user_id, image_url, caption, created_at, updated_at)
SELECT
    (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1'),
    'https://images.unsplash.com/photo-1762268773805-67cbc382cc88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHwyfHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    '휴가의 추억 ✈️',
    now() - INTERVAL '5 hours',
    now() - INTERVAL '5 hours'
WHERE EXISTS (SELECT 1 FROM temp_user_ids WHERE user_key = 'user_1');

INSERT INTO public.posts (user_id, image_url, caption, created_at, updated_at)
SELECT
    COALESCE((SELECT user_id FROM temp_user_ids WHERE user_key = 'user_2'), (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1')),
    'https://images.unsplash.com/photo-1762245267105-8c8dcb5e7180?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHwzfHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    '일상의 소중함을 느끼는 순간들. 작은 것들에도 감사하는 마음을 갖고 싶어요. 오늘도 행복한 하루 보내세요! 😊',
    now() - INTERVAL '1 day',
    now() - INTERVAL '1 day'
WHERE EXISTS (SELECT 1 FROM temp_user_ids);

INSERT INTO public.posts (user_id, image_url, caption, created_at, updated_at)
SELECT
    COALESCE((SELECT user_id FROM temp_user_ids WHERE user_key = 'user_2'), (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1')),
    'https://images.unsplash.com/photo-1762245265298-19aa1625f40d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHw0fHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    '새로운 시작을 향해 🚀 항상 도전하는 마음으로 살고 싶어요.',
    now() - INTERVAL '2 days',
    now() - INTERVAL '2 days'
WHERE EXISTS (SELECT 1 FROM temp_user_ids);

INSERT INTO public.posts (user_id, image_url, caption, created_at, updated_at)
SELECT
    COALESCE((SELECT user_id FROM temp_user_ids WHERE user_key = 'user_3'), (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1')),
    'https://images.unsplash.com/photo-1762245282007-1fe7e42d027b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTU3NzB8MHwxfHNlYXJjaHw1fHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8Mnx8MTc2MjMxNDg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    '평화로운 순간들 ☕',
    now() - INTERVAL '3 days',
    now() - INTERVAL '3 days'
WHERE EXISTS (SELECT 1 FROM temp_user_ids);

-- ============================================
-- 3. 좋아요 삽입
-- ============================================
-- 첫 번째 게시글에 좋아요 2개 추가
-- 두 번째 게시글에 좋아요 1개 추가
-- 세 번째 게시글에 좋아요 3개 추가

INSERT INTO public.likes (post_id, user_id, created_at)
SELECT
    p.id,
    (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1'),
    p.created_at + INTERVAL '10 minutes'
FROM public.posts p
ORDER BY p.created_at DESC
LIMIT 1
ON CONFLICT (post_id, user_id) DO NOTHING;

INSERT INTO public.likes (post_id, user_id, created_at)
SELECT
    p.id,
    COALESCE((SELECT user_id FROM temp_user_ids WHERE user_key = 'user_2'), (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1')),
    p.created_at + INTERVAL '20 minutes'
FROM public.posts p
ORDER BY p.created_at DESC
LIMIT 1
ON CONFLICT (post_id, user_id) DO NOTHING;

INSERT INTO public.likes (post_id, user_id, created_at)
SELECT
    p.id,
    (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1'),
    p.created_at + INTERVAL '30 minutes'
FROM public.posts p
ORDER BY p.created_at DESC
OFFSET 1
LIMIT 1
ON CONFLICT (post_id, user_id) DO NOTHING;

INSERT INTO public.likes (post_id, user_id, created_at)
SELECT
    p.id,
    (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1'),
    p.created_at + INTERVAL '15 minutes'
FROM public.posts p
ORDER BY p.created_at DESC
OFFSET 2
LIMIT 1
ON CONFLICT (post_id, user_id) DO NOTHING;

INSERT INTO public.likes (post_id, user_id, created_at)
SELECT
    p.id,
    COALESCE((SELECT user_id FROM temp_user_ids WHERE user_key = 'user_2'), (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1')),
    p.created_at + INTERVAL '25 minutes'
FROM public.posts p
ORDER BY p.created_at DESC
OFFSET 2
LIMIT 1
ON CONFLICT (post_id, user_id) DO NOTHING;

INSERT INTO public.likes (post_id, user_id, created_at)
SELECT
    p.id,
    COALESCE((SELECT user_id FROM temp_user_ids WHERE user_key = 'user_3'), (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1')),
    p.created_at + INTERVAL '35 minutes'
FROM public.posts p
ORDER BY p.created_at DESC
OFFSET 2
LIMIT 1
ON CONFLICT (post_id, user_id) DO NOTHING;

-- ============================================
-- 4. 댓글 삽입
-- ============================================
-- 첫 번째 게시글에 댓글 2개
-- 두 번째 게시글에 댓글 1개
-- 세 번째 게시글에 댓글 2개

INSERT INTO public.comments (post_id, user_id, content, created_at, updated_at)
SELECT
    p.id,
    COALESCE((SELECT user_id FROM temp_user_ids WHERE user_key = 'user_2'), (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1')),
    '정말 아름다운 풍경이네요! 어디인가요? 😍',
    p.created_at + INTERVAL '1 hour',
    p.created_at + INTERVAL '1 hour'
FROM public.posts p
ORDER BY p.created_at DESC
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.comments (post_id, user_id, content, created_at, updated_at)
SELECT
    p.id,
    COALESCE((SELECT user_id FROM temp_user_ids WHERE user_key = 'user_3'), (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1')),
    '저도 거기 가보고 싶어요!',
    p.created_at + INTERVAL '2 hours',
    p.created_at + INTERVAL '2 hours'
FROM public.posts p
ORDER BY p.created_at DESC
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.comments (post_id, user_id, content, created_at, updated_at)
SELECT
    p.id,
    COALESCE((SELECT user_id FROM temp_user_ids WHERE user_key = 'user_2'), (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1')),
    '좋은 휴가 보내고 계시는군요! ✈️',
    p.created_at + INTERVAL '1 hour',
    p.created_at + INTERVAL '1 hour'
FROM public.posts p
ORDER BY p.created_at DESC
OFFSET 1
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.comments (post_id, user_id, content, created_at, updated_at)
SELECT
    p.id,
    (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1'),
    '감사합니다! 항상 긍정적인 에너지가 느껴지네요 💪',
    p.created_at + INTERVAL '3 hours',
    p.created_at + INTERVAL '3 hours'
FROM public.posts p
ORDER BY p.created_at DESC
OFFSET 2
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.comments (post_id, user_id, content, created_at, updated_at)
SELECT
    p.id,
    COALESCE((SELECT user_id FROM temp_user_ids WHERE user_key = 'user_2'), (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1')),
    '화이팅! 응원합니다! 🎉',
    p.created_at + INTERVAL '4 hours',
    p.created_at + INTERVAL '4 hours'
FROM public.posts p
ORDER BY p.created_at DESC
OFFSET 2
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. 팔로우 관계 삽입
-- ============================================
-- user_2가 user_1을 팔로우
-- user_3이 user_1을 팔로우
-- user_1이 user_2를 팔로우

INSERT INTO public.follows (follower_id, following_id, created_at)
SELECT
    COALESCE((SELECT user_id FROM temp_user_ids WHERE user_key = 'user_2'), (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1')),
    (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1'),
    now() - INTERVAL '7 days'
WHERE EXISTS (SELECT 1 FROM temp_user_ids WHERE user_key = 'user_2')
ON CONFLICT (follower_id, following_id) DO NOTHING;

INSERT INTO public.follows (follower_id, following_id, created_at)
SELECT
    COALESCE((SELECT user_id FROM temp_user_ids WHERE user_key = 'user_3'), (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1')),
    (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1'),
    now() - INTERVAL '5 days'
WHERE EXISTS (SELECT 1 FROM temp_user_ids WHERE user_key = 'user_3')
ON CONFLICT (follower_id, following_id) DO NOTHING;

INSERT INTO public.follows (follower_id, following_id, created_at)
SELECT
    (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1'),
    COALESCE((SELECT user_id FROM temp_user_ids WHERE user_key = 'user_2'), (SELECT user_id FROM temp_user_ids WHERE user_key = 'user_1')),
    now() - INTERVAL '3 days'
WHERE EXISTS (SELECT 1 FROM temp_user_ids WHERE user_key = 'user_2')
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- ============================================
-- 임시 테이블 정리
-- ============================================
DROP TABLE IF EXISTS temp_user_ids;

-- ============================================
-- 확인 쿼리 (선택사항)
-- ============================================
-- 아래 쿼리들을 주석 해제하여 실행하면 생성된 데이터를 확인할 수 있습니다.

-- 게시글 확인
-- SELECT 
--   p.id,
--   u.name as author,
--   p.caption,
--   p.created_at,
--   (SELECT COUNT(*) FROM public.likes WHERE post_id = p.id) as likes_count,
--   (SELECT COUNT(*) FROM public.comments WHERE post_id = p.id) as comments_count
-- FROM public.posts p
-- JOIN public.users u ON p.user_id = u.id
-- ORDER BY p.created_at DESC;

-- post_stats 뷰 확인
-- SELECT 
--   post_id,
--   user_id,
--   likes_count,
--   comments_count,
--   created_at
-- FROM public.post_stats
-- ORDER BY created_at DESC
-- LIMIT 5;

-- user_stats 뷰 확인
-- SELECT 
--   user_id,
--   name,
--   posts_count,
--   followers_count,
--   following_count
-- FROM public.user_stats
-- ORDER BY created_at DESC;


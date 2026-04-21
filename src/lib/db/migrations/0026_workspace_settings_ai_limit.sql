-- Task 5-2-2b: AI 호출 한도 2필드를 user_settings → workspace_settings 이관
--
-- ❗ 선행 0025 전략 번복: 0025 주석에 "AI 한도 2필드는 user_settings 유지"로 계획됐으나,
--    Phase 5.5 billing 준비 과정에서 workspace 단위 공유 한도가 자연스럽다고 판단되어 재이관.
--
-- 배경:
--  - Phase 5.5 billing 전환 시 AI 사용량은 workspace(조직) 단위로 과금 예정.
--  - 지금은 user_settings의 aiDailyCallCount/aiLastResetAt로 "사용자별" 한도.
--  - 이관 전략: Parallel Change — 컬럼 즉시 DROP 금지 (롤백 대비).
--    1) workspace_settings에 동일 컬럼 ADD + 백필
--    2) 코드에서 stop reading/writing user_settings.*
--    3) 1~2 릴리스 후 별도 Task에서 user_settings 컬럼 일괄 DROP
--
-- 백필 정책:
--  - 각 workspace의 owner user(workspace_members.role='owner')의 user_settings 값을 해당 workspace로 복사.
--  - owner 부재 workspace는 default(0, now())로 초기화 (신규 INSERT 시 동일).
--  - assertion: 백필 후 owner user가 있는 workspace에서 aiDailyCallCount mismatch 0건 확인.

BEGIN;

-- 1) 컬럼 추가 (default로 기존 row 즉시 채움, NOT NULL 보장)
ALTER TABLE public.workspace_settings
  ADD COLUMN IF NOT EXISTS ai_daily_call_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_last_reset_at timestamptz NOT NULL DEFAULT now();

-- 2) 백필: owner user의 user_settings → 해당 workspace의 workspace_settings
--    workspaces 1개당 owner 여러 명일 수 있으므로 가장 먼저 가입한 owner(created_at ASC)를 선택.
--    tie-breaker로 user_id ASC 추가 (결정론적 선택 보장).
WITH picked_owner AS (
  SELECT DISTINCT ON (wm.workspace_id)
    wm.workspace_id,
    wm.user_id,
    us.ai_daily_call_count,
    us.ai_last_reset_at
  FROM public.workspace_members wm
  INNER JOIN public.user_settings us ON us.user_id = wm.user_id
  WHERE wm.role = 'owner'
  ORDER BY wm.workspace_id, wm.joined_at ASC, wm.user_id ASC
)
UPDATE public.workspace_settings ws
SET
  ai_daily_call_count = po.ai_daily_call_count,
  ai_last_reset_at = po.ai_last_reset_at,
  updated_at = now()
FROM picked_owner po
WHERE ws.workspace_id = po.workspace_id;

-- 3) Assertion: owner가 있는 모든 workspace의 aiDailyCallCount가 owner user_settings와 일치해야 함.
--    mismatch 발견 시 RAISE EXCEPTION → 트랜잭션 전체 롤백 (partial apply 방지).
DO $$
DECLARE
  mismatch_count integer;
  missing_owner_count integer;
BEGIN
  -- owner가 있는 workspace인데 백필된 값이 owner user_settings와 다른 경우
  SELECT COUNT(*) INTO mismatch_count
  FROM public.workspace_settings ws
  INNER JOIN (
    SELECT DISTINCT ON (wm.workspace_id)
      wm.workspace_id,
      us.ai_daily_call_count,
      us.ai_last_reset_at
    FROM public.workspace_members wm
    INNER JOIN public.user_settings us ON us.user_id = wm.user_id
    WHERE wm.role = 'owner'
    ORDER BY wm.workspace_id, wm.joined_at ASC, wm.user_id ASC
  ) po ON po.workspace_id = ws.workspace_id
  WHERE
    ws.ai_daily_call_count IS DISTINCT FROM po.ai_daily_call_count
    OR ws.ai_last_reset_at IS DISTINCT FROM po.ai_last_reset_at;

  IF mismatch_count > 0 THEN
    RAISE EXCEPTION
      'AI limit backfill assertion failed: % workspace(s) have ai_daily_call_count or ai_last_reset_at mismatch with owner user_settings',
      mismatch_count;
  END IF;

  -- owner 부재 workspace 개수 (참고용 로그, 실패 사유는 아님 — default 0, now()로 초기화됨)
  SELECT COUNT(*) INTO missing_owner_count
  FROM public.workspace_settings ws
  WHERE NOT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = ws.workspace_id AND wm.role = 'owner'
  );

  RAISE NOTICE
    'AI limit backfill OK: all workspaces with owner are consistent. workspaces without owner (initialized to defaults): %',
    missing_owner_count;
END $$;

COMMIT;

-- ─── Rollback (수동 실행 시) ───────────────────────────────────────
-- BEGIN;
-- ALTER TABLE public.workspace_settings
--   DROP COLUMN IF EXISTS ai_daily_call_count,
--   DROP COLUMN IF EXISTS ai_last_reset_at;
-- COMMIT;

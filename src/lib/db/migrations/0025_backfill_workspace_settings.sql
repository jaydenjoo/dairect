-- Phase 5 Task 5-2-2 (2026-04-21) — user_settings 13 필드 → workspace_settings 이관 백필.
--
-- 전제:
--   0017 workspaces 4 테이블 (workspace_settings 포함 생성)
--   0020 각 user별 default workspace 생성 + workspace_settings 빈 row 생성
--   ─── 이 파일 0025: owner user의 user_settings 값을 해당 workspace_settings에 복사 ───
--
-- 대상 13 필드:
--   사업자 정보 7: company_name, representative_name, business_number, business_address,
--                business_phone, business_email, bank_info
--   견적 기본값 5: estimate_number_prefix, contract_number_prefix, invoice_number_prefix,
--                daily_rate, default_payment_split
--   기능 프리셋 1: feature_presets
--
-- AI 한도 2필드(ai_daily_call_count, ai_last_reset_at)는 user_settings 유지 — user-level state.
-- Phase 5.5 billing 전환 시 별도 Task에서 workspace 단위로 재설계.
--
-- 멱등성:
--   여러 owner 동시 소유 시나리오는 현재 없음 (1 user = 1 workspace).
--   동일 user가 여러 workspace owner면 모든 workspace에 같은 값 복사됨 (향후 발생 시 수동 조정).
--   재실행 안전: 기존 workspace_settings 값이 같은 값으로 덮어써지므로 dirty write 없음.
--
-- ⚠️ POST-APPLY:
--   schema.ts에는 변경 없음 (workspace_settings 정의 이미 0017에서 완성).
--   user_settings의 13 필드 컬럼은 **유지** — Parallel Change 패턴.
--   Phase 5.5 + AI 한도 이관 완료 후 별도 Task에서 column drop.

UPDATE workspace_settings ws
SET
  company_name           = us.company_name,
  representative_name    = us.representative_name,
  business_number        = us.business_number,
  business_address       = us.business_address,
  business_phone         = us.business_phone,
  business_email         = us.business_email,
  bank_info              = us.bank_info,
  estimate_number_prefix = COALESCE(us.estimate_number_prefix, ws.estimate_number_prefix),
  contract_number_prefix = COALESCE(us.contract_number_prefix, ws.contract_number_prefix),
  invoice_number_prefix  = COALESCE(us.invoice_number_prefix, ws.invoice_number_prefix),
  daily_rate             = COALESCE(us.daily_rate, ws.daily_rate),
  default_payment_split  = COALESCE(us.default_payment_split, ws.default_payment_split),
  feature_presets        = COALESCE(us.feature_presets, ws.feature_presets),
  updated_at             = now()
FROM user_settings us
JOIN workspace_members wm ON wm.user_id = us.user_id AND wm.role = 'owner'
WHERE ws.workspace_id = wm.workspace_id;

-- Assertion — 복사 결과 검증 (owner user_settings와 해당 workspace_settings 주요 필드 일치).
-- 실패 시 RAISE EXCEPTION → 전체 트랜잭션 롤백 (migration 실패 처리).
DO $$
DECLARE mismatch bigint;
BEGIN
  SELECT COUNT(*) INTO mismatch
  FROM user_settings us
  JOIN workspace_members wm ON wm.user_id = us.user_id AND wm.role = 'owner'
  JOIN workspace_settings ws ON ws.workspace_id = wm.workspace_id
  WHERE COALESCE(us.company_name,'')             != COALESCE(ws.company_name,'')
     OR COALESCE(us.business_number,'')          != COALESCE(ws.business_number,'')
     OR COALESCE(us.business_email,'')           != COALESCE(ws.business_email,'')
     OR COALESCE(us.daily_rate, -1)              != COALESCE(ws.daily_rate, -1)
     OR COALESCE(us.estimate_number_prefix,'')   != COALESCE(ws.estimate_number_prefix,'')
     OR COALESCE(us.contract_number_prefix,'')   != COALESCE(ws.contract_number_prefix,'')
     OR COALESCE(us.invoice_number_prefix,'')    != COALESCE(ws.invoice_number_prefix,'');
  IF mismatch > 0 THEN
    RAISE EXCEPTION 'backfill mismatch: % rows differ between user_settings and workspace_settings (owner basis)', mismatch;
  END IF;
END $$;

-- ROLLBACK (user_settings 값은 원본 보존이므로 workspace_settings만 초기화):
-- UPDATE workspace_settings SET
--   company_name = NULL, representative_name = NULL, business_number = NULL,
--   business_address = NULL, business_phone = NULL, business_email = NULL, bank_info = NULL,
--   estimate_number_prefix = 'EST', contract_number_prefix = 'CON', invoice_number_prefix = 'INV',
--   daily_rate = 700000,
--   default_payment_split = '[{"label":"착수금","percentage":30},{"label":"중도금","percentage":40},{"label":"잔금","percentage":30}]'::jsonb,
--   feature_presets = '[]'::jsonb,
--   updated_at = now();

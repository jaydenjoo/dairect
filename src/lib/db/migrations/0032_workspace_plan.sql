-- Phase 5 Epic 5-2 Task 5-2-2b 잔여 C-H1: workspace_settings.plan 도입 (AI 한도 분기 설계)
--
-- 배경 (learnings.md 2026-04-21 심야 "workspace 공유 카운터 vs user 쿨다운 비대칭" 참조):
--   AI_DAILY_LIMIT = 200 고정 상수를 workspace 공유 카운터에 그대로 사용 중.
--   workspace 멤버 N명 진입 시 체감 한도 = 200/N으로 희석 (C-H1).
--   Phase C(5-2-4/5 초대 시스템) 진입 전 plan 분기 설계만이라도 선행하여
--   Phase 5.5 billing 통합 시 컬럼 재생성/데이터 이관 불필요하도록 호환 레이어 확보.
--
-- 설계 결정:
--   [D1] plan은 text + CHECK 제약 (enum 타입 대신). 근거: Phase 5.5에서 plan 종류
--        추가/변경 시 enum은 ALTER TYPE + COMMIT PHASE 제약이 무거움. text+CHECK는
--        DROP/ADD CONSTRAINT만으로 plan 집합 조정 가능.
--   [D2] NOT NULL + default 'free'. 기존 row는 모두 'free'로 백필 (현재 Jayden 단일 계정 1 row).
--   [D3] 허용 값: 'free', 'pro', 'team' — TS PLAN_AI_DAILY_LIMITS 맵과 동기화 필수.
--        변경 시 양쪽 파일 동반 수정:
--          src/lib/validation/ai-estimate.ts (PLAN_AI_DAILY_LIMITS)
--          이 마이그레이션의 CHECK IN 목록
--
-- 트랜잭션 래핑: BEGIN/COMMIT으로 원자성 보장 (ADD COLUMN + ADD CONSTRAINT 동시 성공/실패).
--
-- 롤백 SQL (역방향):
--   BEGIN;
--   ALTER TABLE "workspace_settings" DROP CONSTRAINT "workspace_settings_plan_check";
--   ALTER TABLE "workspace_settings" DROP COLUMN "plan";
--   COMMIT;
--
-- POST-APPLY:
--   schema.ts의 workspaceSettings 정의 동기화 필수 (plan: text("plan").notNull().default("free")).
--   애플리케이션 레이어 AI_DAILY_LIMIT 상수 → getAiDailyLimit(plan) 교체 4파일:
--     src/lib/ai/briefing-actions.ts
--     src/lib/ai/report-actions.ts
--     src/app/dashboard/estimates/ai-actions.ts
--     src/app/dashboard/estimates/new/estimate-form.tsx (prop 전환)

BEGIN;--> statement-breakpoint

ALTER TABLE "workspace_settings"
  ADD COLUMN "plan" text NOT NULL DEFAULT 'free';--> statement-breakpoint

ALTER TABLE "workspace_settings"
  ADD CONSTRAINT "workspace_settings_plan_check"
  CHECK ("plan" IN ('free', 'pro', 'team'));--> statement-breakpoint

COMMIT;

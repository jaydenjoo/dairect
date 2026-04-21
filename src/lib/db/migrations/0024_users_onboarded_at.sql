ALTER TABLE "users" ADD COLUMN "onboarded_at" timestamptz;--> statement-breakpoint

-- Phase 5 Task 5-2-1 (2026-04-21) — /onboarding 플로우 진입 여부 플래그.
--
-- 의미:
--   NULL      = 미완료 (신규 가입자). dashboard layout 가드가 /onboarding으로 리다이렉트.
--   NOT NULL  = 완료 or 건너뛰기. 이후 /dashboard 직행.
--
-- 백필 정책:
--   Phase 5 도입 전 가입자는 이미 workspace 소유 + 실사용 중이므로 onboarding 건너뛴 것으로 처리.
--   `workspace_members`에 등록된 user만 백필 — 혹여 workspace 없는 "깨진" user row가 있다면
--   NULL 유지해서 다음 로그인 시 onboarding 플로우로 복구.
UPDATE "users"
SET "onboarded_at" = now()
WHERE "onboarded_at" IS NULL
  AND "id" IN (SELECT DISTINCT "user_id" FROM "workspace_members");

-- ROLLBACK:
-- ALTER TABLE "users" DROP COLUMN IF EXISTS "onboarded_at";

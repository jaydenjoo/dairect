-- 기존 row에 NULL이 남아있으면 NOT NULL 제약 추가가 실패하므로 먼저 보정
UPDATE "user_settings" SET "ai_daily_call_count" = 0 WHERE "ai_daily_call_count" IS NULL;--> statement-breakpoint
UPDATE "user_settings" SET "ai_last_reset_at" = now() WHERE "ai_last_reset_at" IS NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "ai_daily_call_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "ai_last_reset_at" SET NOT NULL;

-- ROLLBACK:
-- ALTER TABLE "user_settings" ALTER COLUMN "ai_daily_call_count" DROP NOT NULL;
-- ALTER TABLE "user_settings" ALTER COLUMN "ai_last_reset_at" DROP NOT NULL;
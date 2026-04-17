ALTER TABLE "user_settings" ADD COLUMN "ai_daily_call_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "ai_last_reset_at" timestamp with time zone DEFAULT now();

-- ROLLBACK:
-- ALTER TABLE "user_settings" DROP COLUMN IF EXISTS "ai_daily_call_count";
-- ALTER TABLE "user_settings" DROP COLUMN IF EXISTS "ai_last_reset_at";
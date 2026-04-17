ALTER TABLE "briefings" ADD COLUMN "generation_type" text DEFAULT 'ai' NOT NULL;--> statement-breakpoint
ALTER TABLE "briefings" ADD CONSTRAINT "briefings_generation_type_check" CHECK ("briefings"."generation_type" IN ('ai', 'empty_fallback'));--> statement-breakpoint

-- RLS 방어선 추가 (defense-in-depth).
-- 현재 Drizzle은 postgres role(superuser)로 접근해 RLS 우회되므로 영향 없음.
-- 향후 Supabase anon/authenticated 클라이언트 도입 시 anon 트래픽 원천 차단.
-- authenticated 정책은 anon client 도입 시점에 별도 추가 예정 (PROGRESS.md Phase 3 백로그).
ALTER TABLE "briefings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "briefings_deny_anon" ON "briefings" FOR ALL TO anon USING (false);

-- ROLLBACK:
-- DROP POLICY IF EXISTS "briefings_deny_anon" ON "briefings";
-- ALTER TABLE "briefings" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "briefings" DROP CONSTRAINT IF EXISTS "briefings_generation_type_check";
-- ALTER TABLE "briefings" DROP COLUMN IF EXISTS "generation_type";
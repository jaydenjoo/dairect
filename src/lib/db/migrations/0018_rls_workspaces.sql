-- Phase 5.0 Task 5-1-1 RLS 방어선 (defense-in-depth).
-- 현재 Drizzle은 postgres role(superuser)로 접근해 RLS 우회되므로 앱 동작 영향 없음.
-- 향후 Supabase anon/authenticated 클라이언트 도입 시 anon 트래픽 원천 차단.
-- authenticated 정책은 anon client 도입 시점에 별도 추가 예정 (PRD-phase5.md Task 5-1-5 워크스페이스 멤버십 기반 RLS).
-- briefings 0009 패턴 복제.

ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "workspaces_deny_anon" ON "workspaces" FOR ALL TO anon USING (false);--> statement-breakpoint

ALTER TABLE "workspace_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "workspace_members_deny_anon" ON "workspace_members" FOR ALL TO anon USING (false);--> statement-breakpoint

ALTER TABLE "workspace_invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "workspace_invitations_deny_anon" ON "workspace_invitations" FOR ALL TO anon USING (false);--> statement-breakpoint

ALTER TABLE "workspace_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "workspace_settings_deny_anon" ON "workspace_settings" FOR ALL TO anon USING (false);

-- ROLLBACK:
-- DROP POLICY IF EXISTS "workspace_settings_deny_anon" ON "workspace_settings";
-- ALTER TABLE "workspace_settings" DISABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "workspace_invitations_deny_anon" ON "workspace_invitations";
-- ALTER TABLE "workspace_invitations" DISABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "workspace_members_deny_anon" ON "workspace_members";
-- ALTER TABLE "workspace_members" DISABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "workspaces_deny_anon" ON "workspaces";
-- ALTER TABLE "workspaces" DISABLE ROW LEVEL SECURITY;

-- Phase 5 Epic 5-1 Task 5-1-5: 13 도메인 테이블 workspace 멤버십 기반 RLS 52 정책.
--   (weekly_reports 포함 — Task 5-1-4 db-engineer 리뷰 H-1 후속 반영)
--
-- 전제 (적용 순서):
--   0017_modern_eternals.sql       — workspaces / workspace_members / workspace_invitations / workspace_settings 생성
--   0018_rls_workspaces.sql         — 4 부속 테이블 ENABLE RLS + deny_anon
--   0019_slim_gertrude_yorkes.sql   — 12 도메인 테이블 workspace_id NULLABLE
--   0020_backfill_workspaces.sql    — default workspace 생성 + 12 테이블 backfill + assertion
--   (선행 권장) Task 5-1-4         — 12 테이블 workspace_id NOT NULL 전환
--
-- 영향 범위:
--   현재 앱은 Drizzle + postgres.js(postgres superuser)로 접속 → RLS 우회.
--   이 마이그레이션은 **defense-in-depth** 선제 구축. 실효력은 Phase 5.5+에서
--   Supabase anon/authenticated 클라이언트 도입 시 활성.
--
-- 설계 결정 (계획 단계 확정):
--   [D1] role 세분화 제외 — owner/admin/member 권한 분리는 Task 5-1-7 (Server Action guard).
--        RLS에서 CASE WHEN role='member' 분기 시 48 × 3 = 144 branch로 폭발 → Layered security
--        원칙 (RLS = workspace 격리 / Server Action = role 권한).
--   [D2] 부모 경유 체크 제외 — client_notes/milestones/estimate_items 모두 직접 workspace_id 보유
--        (Task 5-1-2에서 JOIN 회피 목적 비정규화). 단일 컬럼 is_workspace_member(workspace_id)로 충분.
--   [D3] deny_anon 유지 + authenticated 정책 추가 — 2중 방어 레이어.
--        briefings(0009) / workspaces(0018) 기존 패턴 계승.
--   [D4] helper function SECURITY DEFINER — authenticated role이 workspace_members SELECT 권한
--        없을 수 있음. owner(postgres) 권한으로 실행 → RLS check 통과.
--        search_path = public 고정 (SQL injection / function shadowing 방어 — Supabase 공식 권장).
--   [D5] soft-delete workspace 격리 — is_workspace_member 내부에서 workspaces.deleted_at IS NULL
--        필터 (Task 5-1-6 get-workspace-id.ts H-2 수정과 정합성 유지).
--
-- 멱등성:
--   모든 POLICY는 DROP POLICY IF EXISTS 선행 → 재실행 안전.
--   ALTER TABLE ENABLE RLS는 DDL idempotent (이미 enabled여도 에러 없음).
--
-- 트랜잭션 래핑 (Review H3 반영):
--   BEGIN/COMMIT으로 전체 마이그레이션을 단일 트랜잭션으로 감싼다.
--   drizzle-kit push / psql statement-별 commit 경로에서도 DROP POLICY → CREATE POLICY
--   사이 짧은 race window를 제거. 중간 실패 시 전체 자동 롤백.

BEGIN;--> statement-breakpoint

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. Helper function: is_workspace_member(uuid) → boolean
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM workspace_members wm
    INNER JOIN workspaces w ON w.id = wm.workspace_id
    WHERE wm.workspace_id = ws_id
      -- Review H2 반영: auth.uid()를 (select ...) 서브쿼리로 래핑해
      -- Postgres 옵티마이저가 InitPlan으로 한 번만 평가하도록 유도 (Supabase 공식 권장).
      AND wm.user_id = (select auth.uid())
      AND w.deleted_at IS NULL
  );
$$;--> statement-breakpoint

-- authenticated role이 함수 EXECUTE 가능하도록 권한 부여 (SECURITY DEFINER라도 EXECUTE 권한 필요).
-- Review M1 반영: anon은 deny_anon RESTRICTIVE 정책으로 모든 row 접근 차단되므로
--   is_workspace_member 호출 경로가 없음. 공격 표면 축소 차원에서 anon GRANT 제거.
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid) TO authenticated;--> statement-breakpoint

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. 12 도메인 테이블 × 4 CRUD policy (+ deny_anon 재적용)
--    구조: ENABLE RLS → deny_anon → select → insert → update → delete
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ─── clients ───
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "clients_deny_anon" ON "clients";--> statement-breakpoint
CREATE POLICY "clients_deny_anon" ON "clients" AS RESTRICTIVE FOR ALL TO anon USING (false);--> statement-breakpoint
DROP POLICY IF EXISTS "clients_select_members" ON "clients";--> statement-breakpoint
CREATE POLICY "clients_select_members" ON "clients" FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "clients_insert_members" ON "clients";--> statement-breakpoint
CREATE POLICY "clients_insert_members" ON "clients" FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "clients_update_members" ON "clients";--> statement-breakpoint
CREATE POLICY "clients_update_members" ON "clients" FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "clients_delete_members" ON "clients";--> statement-breakpoint
CREATE POLICY "clients_delete_members" ON "clients" FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint

-- ─── client_notes ───
ALTER TABLE "client_notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "client_notes_deny_anon" ON "client_notes";--> statement-breakpoint
CREATE POLICY "client_notes_deny_anon" ON "client_notes" AS RESTRICTIVE FOR ALL TO anon USING (false);--> statement-breakpoint
DROP POLICY IF EXISTS "client_notes_select_members" ON "client_notes";--> statement-breakpoint
CREATE POLICY "client_notes_select_members" ON "client_notes" FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "client_notes_insert_members" ON "client_notes";--> statement-breakpoint
CREATE POLICY "client_notes_insert_members" ON "client_notes" FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "client_notes_update_members" ON "client_notes";--> statement-breakpoint
CREATE POLICY "client_notes_update_members" ON "client_notes" FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "client_notes_delete_members" ON "client_notes";--> statement-breakpoint
CREATE POLICY "client_notes_delete_members" ON "client_notes" FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint

-- ─── leads ───
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "leads_deny_anon" ON "leads";--> statement-breakpoint
CREATE POLICY "leads_deny_anon" ON "leads" AS RESTRICTIVE FOR ALL TO anon USING (false);--> statement-breakpoint
DROP POLICY IF EXISTS "leads_select_members" ON "leads";--> statement-breakpoint
CREATE POLICY "leads_select_members" ON "leads" FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "leads_insert_members" ON "leads";--> statement-breakpoint
CREATE POLICY "leads_insert_members" ON "leads" FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "leads_update_members" ON "leads";--> statement-breakpoint
CREATE POLICY "leads_update_members" ON "leads" FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "leads_delete_members" ON "leads";--> statement-breakpoint
CREATE POLICY "leads_delete_members" ON "leads" FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint

-- ─── projects ───
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "projects_deny_anon" ON "projects";--> statement-breakpoint
CREATE POLICY "projects_deny_anon" ON "projects" AS RESTRICTIVE FOR ALL TO anon USING (false);--> statement-breakpoint
DROP POLICY IF EXISTS "projects_select_members" ON "projects";--> statement-breakpoint
CREATE POLICY "projects_select_members" ON "projects" FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "projects_insert_members" ON "projects";--> statement-breakpoint
CREATE POLICY "projects_insert_members" ON "projects" FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "projects_update_members" ON "projects";--> statement-breakpoint
CREATE POLICY "projects_update_members" ON "projects" FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "projects_delete_members" ON "projects";--> statement-breakpoint
CREATE POLICY "projects_delete_members" ON "projects" FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint

-- ─── milestones ───
ALTER TABLE "milestones" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "milestones_deny_anon" ON "milestones";--> statement-breakpoint
CREATE POLICY "milestones_deny_anon" ON "milestones" AS RESTRICTIVE FOR ALL TO anon USING (false);--> statement-breakpoint
DROP POLICY IF EXISTS "milestones_select_members" ON "milestones";--> statement-breakpoint
CREATE POLICY "milestones_select_members" ON "milestones" FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "milestones_insert_members" ON "milestones";--> statement-breakpoint
CREATE POLICY "milestones_insert_members" ON "milestones" FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "milestones_update_members" ON "milestones";--> statement-breakpoint
CREATE POLICY "milestones_update_members" ON "milestones" FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "milestones_delete_members" ON "milestones";--> statement-breakpoint
CREATE POLICY "milestones_delete_members" ON "milestones" FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint

-- ─── estimates ───
ALTER TABLE "estimates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "estimates_deny_anon" ON "estimates";--> statement-breakpoint
CREATE POLICY "estimates_deny_anon" ON "estimates" AS RESTRICTIVE FOR ALL TO anon USING (false);--> statement-breakpoint
DROP POLICY IF EXISTS "estimates_select_members" ON "estimates";--> statement-breakpoint
CREATE POLICY "estimates_select_members" ON "estimates" FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "estimates_insert_members" ON "estimates";--> statement-breakpoint
CREATE POLICY "estimates_insert_members" ON "estimates" FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "estimates_update_members" ON "estimates";--> statement-breakpoint
CREATE POLICY "estimates_update_members" ON "estimates" FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "estimates_delete_members" ON "estimates";--> statement-breakpoint
CREATE POLICY "estimates_delete_members" ON "estimates" FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint

-- ─── estimate_items ───
ALTER TABLE "estimate_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "estimate_items_deny_anon" ON "estimate_items";--> statement-breakpoint
CREATE POLICY "estimate_items_deny_anon" ON "estimate_items" AS RESTRICTIVE FOR ALL TO anon USING (false);--> statement-breakpoint
DROP POLICY IF EXISTS "estimate_items_select_members" ON "estimate_items";--> statement-breakpoint
CREATE POLICY "estimate_items_select_members" ON "estimate_items" FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "estimate_items_insert_members" ON "estimate_items";--> statement-breakpoint
CREATE POLICY "estimate_items_insert_members" ON "estimate_items" FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "estimate_items_update_members" ON "estimate_items";--> statement-breakpoint
CREATE POLICY "estimate_items_update_members" ON "estimate_items" FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "estimate_items_delete_members" ON "estimate_items";--> statement-breakpoint
CREATE POLICY "estimate_items_delete_members" ON "estimate_items" FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint

-- ─── contracts ───
ALTER TABLE "contracts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "contracts_deny_anon" ON "contracts";--> statement-breakpoint
CREATE POLICY "contracts_deny_anon" ON "contracts" AS RESTRICTIVE FOR ALL TO anon USING (false);--> statement-breakpoint
DROP POLICY IF EXISTS "contracts_select_members" ON "contracts";--> statement-breakpoint
CREATE POLICY "contracts_select_members" ON "contracts" FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "contracts_insert_members" ON "contracts";--> statement-breakpoint
CREATE POLICY "contracts_insert_members" ON "contracts" FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "contracts_update_members" ON "contracts";--> statement-breakpoint
CREATE POLICY "contracts_update_members" ON "contracts" FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "contracts_delete_members" ON "contracts";--> statement-breakpoint
CREATE POLICY "contracts_delete_members" ON "contracts" FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint

-- ─── invoices ───
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "invoices_deny_anon" ON "invoices";--> statement-breakpoint
CREATE POLICY "invoices_deny_anon" ON "invoices" AS RESTRICTIVE FOR ALL TO anon USING (false);--> statement-breakpoint
DROP POLICY IF EXISTS "invoices_select_members" ON "invoices";--> statement-breakpoint
CREATE POLICY "invoices_select_members" ON "invoices" FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "invoices_insert_members" ON "invoices";--> statement-breakpoint
CREATE POLICY "invoices_insert_members" ON "invoices" FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "invoices_update_members" ON "invoices";--> statement-breakpoint
CREATE POLICY "invoices_update_members" ON "invoices" FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "invoices_delete_members" ON "invoices";--> statement-breakpoint
CREATE POLICY "invoices_delete_members" ON "invoices" FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint

-- ─── activity_logs ───
ALTER TABLE "activity_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "activity_logs_deny_anon" ON "activity_logs";--> statement-breakpoint
CREATE POLICY "activity_logs_deny_anon" ON "activity_logs" AS RESTRICTIVE FOR ALL TO anon USING (false);--> statement-breakpoint
DROP POLICY IF EXISTS "activity_logs_select_members" ON "activity_logs";--> statement-breakpoint
CREATE POLICY "activity_logs_select_members" ON "activity_logs" FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "activity_logs_insert_members" ON "activity_logs";--> statement-breakpoint
CREATE POLICY "activity_logs_insert_members" ON "activity_logs" FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "activity_logs_update_members" ON "activity_logs";--> statement-breakpoint
CREATE POLICY "activity_logs_update_members" ON "activity_logs" FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "activity_logs_delete_members" ON "activity_logs";--> statement-breakpoint
CREATE POLICY "activity_logs_delete_members" ON "activity_logs" FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint

-- ─── briefings (0009에서 이미 ENABLE RLS + deny_anon. authenticated 4 정책만 신규 추가) ───
-- Review M2 반영: briefings_deny_anon은 0009 소유이므로 이 파일에서 건드리지 않음.
--   (0009/0018 deny_anon 정책 RESTRICTIVE 전환은 별도 후속 Task 범위)
ALTER TABLE "briefings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "briefings_select_members" ON "briefings";--> statement-breakpoint
CREATE POLICY "briefings_select_members" ON "briefings" FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "briefings_insert_members" ON "briefings";--> statement-breakpoint
CREATE POLICY "briefings_insert_members" ON "briefings" FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "briefings_update_members" ON "briefings";--> statement-breakpoint
CREATE POLICY "briefings_update_members" ON "briefings" FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "briefings_delete_members" ON "briefings";--> statement-breakpoint
CREATE POLICY "briefings_delete_members" ON "briefings" FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint

-- ─── portal_tokens ───
ALTER TABLE "portal_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "portal_tokens_deny_anon" ON "portal_tokens";--> statement-breakpoint
CREATE POLICY "portal_tokens_deny_anon" ON "portal_tokens" AS RESTRICTIVE FOR ALL TO anon USING (false);--> statement-breakpoint
DROP POLICY IF EXISTS "portal_tokens_select_members" ON "portal_tokens";--> statement-breakpoint
CREATE POLICY "portal_tokens_select_members" ON "portal_tokens" FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "portal_tokens_insert_members" ON "portal_tokens";--> statement-breakpoint
CREATE POLICY "portal_tokens_insert_members" ON "portal_tokens" FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "portal_tokens_update_members" ON "portal_tokens";--> statement-breakpoint
CREATE POLICY "portal_tokens_update_members" ON "portal_tokens" FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "portal_tokens_delete_members" ON "portal_tokens";--> statement-breakpoint
CREATE POLICY "portal_tokens_delete_members" ON "portal_tokens" FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint

-- ─── weekly_reports (H-1 후속 추가: 12 → 13 도메인 테이블) ───
ALTER TABLE "weekly_reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "weekly_reports_deny_anon" ON "weekly_reports";--> statement-breakpoint
CREATE POLICY "weekly_reports_deny_anon" ON "weekly_reports" AS RESTRICTIVE FOR ALL TO anon USING (false);--> statement-breakpoint
DROP POLICY IF EXISTS "weekly_reports_select_members" ON "weekly_reports";--> statement-breakpoint
CREATE POLICY "weekly_reports_select_members" ON "weekly_reports" FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "weekly_reports_insert_members" ON "weekly_reports";--> statement-breakpoint
CREATE POLICY "weekly_reports_insert_members" ON "weekly_reports" FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "weekly_reports_update_members" ON "weekly_reports";--> statement-breakpoint
CREATE POLICY "weekly_reports_update_members" ON "weekly_reports" FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));--> statement-breakpoint
DROP POLICY IF EXISTS "weekly_reports_delete_members" ON "weekly_reports";--> statement-breakpoint
CREATE POLICY "weekly_reports_delete_members" ON "weekly_reports" FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));--> statement-breakpoint

COMMIT;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ROLLBACK (역순: authenticated 정책 → deny_anon → DISABLE → helper function)
-- 주의: 전체 DO 블록 또는 수동 BEGIN/COMMIT 트랜잭션으로 묶어 실행 권장.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--
-- -- weekly_reports (H-1 후속 추가)
-- DROP POLICY IF EXISTS "weekly_reports_delete_members" ON "weekly_reports";
-- DROP POLICY IF EXISTS "weekly_reports_update_members" ON "weekly_reports";
-- DROP POLICY IF EXISTS "weekly_reports_insert_members" ON "weekly_reports";
-- DROP POLICY IF EXISTS "weekly_reports_select_members" ON "weekly_reports";
-- DROP POLICY IF EXISTS "weekly_reports_deny_anon" ON "weekly_reports";
-- ALTER TABLE "weekly_reports" DISABLE ROW LEVEL SECURITY;
--
-- -- portal_tokens
-- DROP POLICY IF EXISTS "portal_tokens_delete_members" ON "portal_tokens";
-- DROP POLICY IF EXISTS "portal_tokens_update_members" ON "portal_tokens";
-- DROP POLICY IF EXISTS "portal_tokens_insert_members" ON "portal_tokens";
-- DROP POLICY IF EXISTS "portal_tokens_select_members" ON "portal_tokens";
-- DROP POLICY IF EXISTS "portal_tokens_deny_anon" ON "portal_tokens";
-- ALTER TABLE "portal_tokens" DISABLE ROW LEVEL SECURITY;
--
-- -- briefings (0009 deny_anon 유지 위해 authenticated 4 정책만 롤백 권장)
-- DROP POLICY IF EXISTS "briefings_delete_members" ON "briefings";
-- DROP POLICY IF EXISTS "briefings_update_members" ON "briefings";
-- DROP POLICY IF EXISTS "briefings_insert_members" ON "briefings";
-- DROP POLICY IF EXISTS "briefings_select_members" ON "briefings";
--
-- -- activity_logs
-- DROP POLICY IF EXISTS "activity_logs_delete_members" ON "activity_logs";
-- DROP POLICY IF EXISTS "activity_logs_update_members" ON "activity_logs";
-- DROP POLICY IF EXISTS "activity_logs_insert_members" ON "activity_logs";
-- DROP POLICY IF EXISTS "activity_logs_select_members" ON "activity_logs";
-- DROP POLICY IF EXISTS "activity_logs_deny_anon" ON "activity_logs";
-- ALTER TABLE "activity_logs" DISABLE ROW LEVEL SECURITY;
--
-- -- invoices
-- DROP POLICY IF EXISTS "invoices_delete_members" ON "invoices";
-- DROP POLICY IF EXISTS "invoices_update_members" ON "invoices";
-- DROP POLICY IF EXISTS "invoices_insert_members" ON "invoices";
-- DROP POLICY IF EXISTS "invoices_select_members" ON "invoices";
-- DROP POLICY IF EXISTS "invoices_deny_anon" ON "invoices";
-- ALTER TABLE "invoices" DISABLE ROW LEVEL SECURITY;
--
-- -- contracts
-- DROP POLICY IF EXISTS "contracts_delete_members" ON "contracts";
-- DROP POLICY IF EXISTS "contracts_update_members" ON "contracts";
-- DROP POLICY IF EXISTS "contracts_insert_members" ON "contracts";
-- DROP POLICY IF EXISTS "contracts_select_members" ON "contracts";
-- DROP POLICY IF EXISTS "contracts_deny_anon" ON "contracts";
-- ALTER TABLE "contracts" DISABLE ROW LEVEL SECURITY;
--
-- -- estimate_items
-- DROP POLICY IF EXISTS "estimate_items_delete_members" ON "estimate_items";
-- DROP POLICY IF EXISTS "estimate_items_update_members" ON "estimate_items";
-- DROP POLICY IF EXISTS "estimate_items_insert_members" ON "estimate_items";
-- DROP POLICY IF EXISTS "estimate_items_select_members" ON "estimate_items";
-- DROP POLICY IF EXISTS "estimate_items_deny_anon" ON "estimate_items";
-- ALTER TABLE "estimate_items" DISABLE ROW LEVEL SECURITY;
--
-- -- estimates
-- DROP POLICY IF EXISTS "estimates_delete_members" ON "estimates";
-- DROP POLICY IF EXISTS "estimates_update_members" ON "estimates";
-- DROP POLICY IF EXISTS "estimates_insert_members" ON "estimates";
-- DROP POLICY IF EXISTS "estimates_select_members" ON "estimates";
-- DROP POLICY IF EXISTS "estimates_deny_anon" ON "estimates";
-- ALTER TABLE "estimates" DISABLE ROW LEVEL SECURITY;
--
-- -- milestones
-- DROP POLICY IF EXISTS "milestones_delete_members" ON "milestones";
-- DROP POLICY IF EXISTS "milestones_update_members" ON "milestones";
-- DROP POLICY IF EXISTS "milestones_insert_members" ON "milestones";
-- DROP POLICY IF EXISTS "milestones_select_members" ON "milestones";
-- DROP POLICY IF EXISTS "milestones_deny_anon" ON "milestones";
-- ALTER TABLE "milestones" DISABLE ROW LEVEL SECURITY;
--
-- -- projects
-- DROP POLICY IF EXISTS "projects_delete_members" ON "projects";
-- DROP POLICY IF EXISTS "projects_update_members" ON "projects";
-- DROP POLICY IF EXISTS "projects_insert_members" ON "projects";
-- DROP POLICY IF EXISTS "projects_select_members" ON "projects";
-- DROP POLICY IF EXISTS "projects_deny_anon" ON "projects";
-- ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;
--
-- -- leads
-- DROP POLICY IF EXISTS "leads_delete_members" ON "leads";
-- DROP POLICY IF EXISTS "leads_update_members" ON "leads";
-- DROP POLICY IF EXISTS "leads_insert_members" ON "leads";
-- DROP POLICY IF EXISTS "leads_select_members" ON "leads";
-- DROP POLICY IF EXISTS "leads_deny_anon" ON "leads";
-- ALTER TABLE "leads" DISABLE ROW LEVEL SECURITY;
--
-- -- client_notes
-- DROP POLICY IF EXISTS "client_notes_delete_members" ON "client_notes";
-- DROP POLICY IF EXISTS "client_notes_update_members" ON "client_notes";
-- DROP POLICY IF EXISTS "client_notes_insert_members" ON "client_notes";
-- DROP POLICY IF EXISTS "client_notes_select_members" ON "client_notes";
-- DROP POLICY IF EXISTS "client_notes_deny_anon" ON "client_notes";
-- ALTER TABLE "client_notes" DISABLE ROW LEVEL SECURITY;
--
-- -- clients
-- DROP POLICY IF EXISTS "clients_delete_members" ON "clients";
-- DROP POLICY IF EXISTS "clients_update_members" ON "clients";
-- DROP POLICY IF EXISTS "clients_insert_members" ON "clients";
-- DROP POLICY IF EXISTS "clients_select_members" ON "clients";
-- DROP POLICY IF EXISTS "clients_deny_anon" ON "clients";
-- ALTER TABLE "clients" DISABLE ROW LEVEL SECURITY;
--
-- -- helper function (다른 마이그레이션이 참조하지 않는지 확인 후 삭제)
-- REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid) FROM authenticated;
-- DROP FUNCTION IF EXISTS public.is_workspace_member(uuid);

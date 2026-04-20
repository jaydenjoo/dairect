ALTER TABLE "activity_logs" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "briefings" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "client_notes" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "estimate_items" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "estimates" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "portal_tokens" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "weekly_reports" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefings" ADD CONSTRAINT "briefings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_tokens" ADD CONSTRAINT "portal_tokens_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

-- Phase 5.0 Task 5-1-2 (2026-04-20) — 13 도메인 테이블에 workspace_id NULLABLE 추가 (weekly_reports 포함, H-1 후속 수정)
-- PRD-phase5.md Epic 5-1 Task 5-1-2 + PRD-phase5-erd.md 섹션 4 명세 구현.
-- NULLABLE 유지 (backfill 전단계). Task 5-1-3에서 default workspace로 일괄 UPDATE,
-- Task 5-1-4에서 NOT NULL 전환 + 채번 UNIQUE (user_id, contract/invoice_number) → (workspace_id, ...) 재조정.
-- ON DELETE RESTRICT: workspace hard delete 시 하위 data 고아화 방지 (soft delete는 workspaces.deleted_at 30일 유예).
-- 인덱스 추가 (workspace_id, created_at) 복합는 Task 5-1-5 (NOT NULL 이후 NULL 비효율 회피).
-- 전제: 0017 (workspaces 테이블) + 0018 (RLS) 적용 후 실행. FK 대상 workspaces.id 존재 필요.

-- ROLLBACK (single transaction — 중간 실패 시 schema.ts ↔ DB 불일치 방지):
-- BEGIN;
-- ALTER TABLE "weekly_reports" DROP CONSTRAINT IF EXISTS "weekly_reports_workspace_id_workspaces_id_fk";
-- ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_workspace_id_workspaces_id_fk";
-- ALTER TABLE "portal_tokens" DROP CONSTRAINT IF EXISTS "portal_tokens_workspace_id_workspaces_id_fk";
-- ALTER TABLE "milestones" DROP CONSTRAINT IF EXISTS "milestones_workspace_id_workspaces_id_fk";
-- ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_workspace_id_workspaces_id_fk";
-- ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_workspace_id_workspaces_id_fk";
-- ALTER TABLE "estimates" DROP CONSTRAINT IF EXISTS "estimates_workspace_id_workspaces_id_fk";
-- ALTER TABLE "estimate_items" DROP CONSTRAINT IF EXISTS "estimate_items_workspace_id_workspaces_id_fk";
-- ALTER TABLE "contracts" DROP CONSTRAINT IF EXISTS "contracts_workspace_id_workspaces_id_fk";
-- ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "clients_workspace_id_workspaces_id_fk";
-- ALTER TABLE "client_notes" DROP CONSTRAINT IF EXISTS "client_notes_workspace_id_workspaces_id_fk";
-- ALTER TABLE "briefings" DROP CONSTRAINT IF EXISTS "briefings_workspace_id_workspaces_id_fk";
-- ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_workspace_id_workspaces_id_fk";
-- ALTER TABLE "weekly_reports" DROP COLUMN IF EXISTS "workspace_id";
-- ALTER TABLE "projects" DROP COLUMN IF EXISTS "workspace_id";
-- ALTER TABLE "portal_tokens" DROP COLUMN IF EXISTS "workspace_id";
-- ALTER TABLE "milestones" DROP COLUMN IF EXISTS "workspace_id";
-- ALTER TABLE "leads" DROP COLUMN IF EXISTS "workspace_id";
-- ALTER TABLE "invoices" DROP COLUMN IF EXISTS "workspace_id";
-- ALTER TABLE "estimates" DROP COLUMN IF EXISTS "workspace_id";
-- ALTER TABLE "estimate_items" DROP COLUMN IF EXISTS "workspace_id";
-- ALTER TABLE "contracts" DROP COLUMN IF EXISTS "workspace_id";
-- ALTER TABLE "clients" DROP COLUMN IF EXISTS "workspace_id";
-- ALTER TABLE "client_notes" DROP COLUMN IF EXISTS "workspace_id";
-- ALTER TABLE "briefings" DROP COLUMN IF EXISTS "workspace_id";
-- ALTER TABLE "activity_logs" DROP COLUMN IF EXISTS "workspace_id";
-- COMMIT;
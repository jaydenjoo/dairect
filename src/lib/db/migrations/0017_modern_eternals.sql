CREATE TABLE "workspace_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"token" text NOT NULL,
	"invited_by" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_invitations_token_unique" UNIQUE("token"),
	CONSTRAINT "workspace_invitations_role_check" CHECK ("workspace_invitations"."role" IN ('owner', 'admin', 'member'))
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_members_ws_user_unique" UNIQUE("workspace_id","user_id"),
	CONSTRAINT "workspace_members_role_check" CHECK ("workspace_members"."role" IN ('owner', 'admin', 'member'))
);
--> statement-breakpoint
CREATE TABLE "workspace_settings" (
	"workspace_id" uuid PRIMARY KEY NOT NULL,
	"company_name" text,
	"representative_name" text,
	"business_number" text,
	"business_address" text,
	"business_phone" text,
	"business_email" text,
	"bank_info" jsonb,
	"estimate_number_prefix" text DEFAULT 'EST',
	"contract_number_prefix" text DEFAULT 'CON',
	"invoice_number_prefix" text DEFAULT 'INV',
	"daily_rate" bigint DEFAULT 700000,
	"default_payment_split" jsonb DEFAULT '[
    {"label":"착수금","percentage":30},
    {"label":"중도금","percentage":40},
    {"label":"잔금","percentage":30}
  ]'::jsonb,
	"feature_presets" jsonb DEFAULT '[]'::jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"subscription_status" text DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspaces_slug_unique" UNIQUE("slug"),
	CONSTRAINT "workspaces_subscription_status_check" CHECK ("workspaces"."subscription_status" IN ('free', 'active', 'past_due', 'canceled', 'paused'))
);
--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD CONSTRAINT "workspace_settings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_invitations_pending_idx" ON "workspace_invitations" USING btree ("workspace_id","email") WHERE "workspace_invitations"."accepted_at" IS NULL AND "workspace_invitations"."revoked_at" IS NULL;--> statement-breakpoint
CREATE INDEX "workspace_members_user_idx" ON "workspace_members" USING btree ("user_id");

-- Phase 5.0 Task 5-1-1 (2026-04-20)
-- PRD-phase5.md Epic 5-1 + PRD-phase5-erd.md 섹션 3 명세 구현.
-- db-engineer 독립 리뷰 HIGH 2 + MEDIUM 2 반영:
--   - workspace_settings.updated_at NOT NULL 강제 (기존 패턴 일관)
--   - workspace_invitations.invited_by ON DELETE SET NULL (감사 보존 + user 삭제 운영 장애 방지)
--   - workspace_members user_id 단독 인덱스 (로그인 핫패스 — B-tree prefix 회피)
--   - workspace_settings 자동 생성 책임 주석 강화 (schema.ts)
-- RLS 정책은 0018_rls_workspaces.sql에서 별도 관리 (briefings 0008/0009 패턴 동일).

-- ROLLBACK:
-- DROP INDEX IF EXISTS "workspace_members_user_idx";
-- DROP INDEX IF EXISTS "workspace_invitations_pending_idx";
-- ALTER TABLE "workspace_settings" DROP CONSTRAINT IF EXISTS "workspace_settings_workspace_id_workspaces_id_fk";
-- ALTER TABLE "workspace_members" DROP CONSTRAINT IF EXISTS "workspace_members_user_id_users_id_fk";
-- ALTER TABLE "workspace_members" DROP CONSTRAINT IF EXISTS "workspace_members_workspace_id_workspaces_id_fk";
-- ALTER TABLE "workspace_invitations" DROP CONSTRAINT IF EXISTS "workspace_invitations_invited_by_users_id_fk";
-- ALTER TABLE "workspace_invitations" DROP CONSTRAINT IF EXISTS "workspace_invitations_workspace_id_workspaces_id_fk";
-- DROP TABLE IF EXISTS "workspace_settings";
-- DROP TABLE IF EXISTS "workspace_members";
-- DROP TABLE IF EXISTS "workspace_invitations";
-- DROP TABLE IF EXISTS "workspaces";
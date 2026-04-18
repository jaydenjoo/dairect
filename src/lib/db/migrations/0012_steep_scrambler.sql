CREATE TABLE "portal_feedbacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"token_id" uuid NOT NULL,
	"message" text NOT NULL,
	"client_ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portal_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"token" text NOT NULL,
	"issued_by" uuid NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_accessed_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portal_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "portal_feedbacks" ADD CONSTRAINT "portal_feedbacks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_feedbacks" ADD CONSTRAINT "portal_feedbacks_token_id_portal_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."portal_tokens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_tokens" ADD CONSTRAINT "portal_tokens_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_tokens" ADD CONSTRAINT "portal_tokens_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- 인덱스: 프로젝트별 활성 토큰 조회 (revokedAt IS NULL) — issue/revoke 액션에서 반복 사용
CREATE INDEX "portal_tokens_project_active_idx" ON "portal_tokens" ("project_id") WHERE "revoked_at" IS NULL;--> statement-breakpoint

-- 인덱스: 피드백 프로젝트별 조회
CREATE INDEX "portal_feedbacks_project_idx" ON "portal_feedbacks" ("project_id");--> statement-breakpoint

-- RLS 방어선 (defense-in-depth) — 0009 briefings 패턴 재사용.
-- 현재 Drizzle은 postgres role(superuser)로 접근해 RLS 우회되므로 영향 없음.
-- 향후 Supabase anon/authenticated 클라이언트 도입 시 anon 트래픽 원천 차단.
-- 고객 포털(`/portal/[token]`)은 Server Action + Drizzle superuser로 접근 — 토큰 검증은 앱 레이어에서 수행.
ALTER TABLE "portal_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "portal_tokens_deny_anon" ON "portal_tokens" FOR ALL TO anon USING (false);--> statement-breakpoint
ALTER TABLE "portal_feedbacks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "portal_feedbacks_deny_anon" ON "portal_feedbacks" FOR ALL TO anon USING (false);

-- ROLLBACK:
-- DROP POLICY IF EXISTS "portal_feedbacks_deny_anon" ON "portal_feedbacks";
-- ALTER TABLE "portal_feedbacks" DISABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "portal_tokens_deny_anon" ON "portal_tokens";
-- ALTER TABLE "portal_tokens" DISABLE ROW LEVEL SECURITY;
-- DROP INDEX IF EXISTS "portal_feedbacks_project_idx";
-- DROP INDEX IF EXISTS "portal_tokens_project_active_idx";
-- DROP TABLE IF EXISTS "portal_feedbacks";
-- DROP TABLE IF EXISTS "portal_tokens";
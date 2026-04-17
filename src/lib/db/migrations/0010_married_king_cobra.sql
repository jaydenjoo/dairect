CREATE TABLE "weekly_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"week_start_date" date NOT NULL,
	"content_json" jsonb NOT NULL,
	"generation_type" text DEFAULT 'ai' NOT NULL,
	"ai_generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_reports_user_project_week_unique" UNIQUE("user_id","project_id","week_start_date"),
	CONSTRAINT "weekly_reports_generation_type_check" CHECK ("weekly_reports"."generation_type" IN ('ai', 'empty_fallback'))
);
--> statement-breakpoint
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;

-- RLS 방어선 (Task 3-2 briefings와 동일 패턴): Drizzle은 postgres role로 우회되지만 향후 anon client 도입 시점 대비.
ALTER TABLE "weekly_reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "weekly_reports_deny_anon" ON "weekly_reports" FOR ALL TO anon USING (false);

-- ROLLBACK:
-- DROP POLICY IF EXISTS "weekly_reports_deny_anon" ON "weekly_reports";
-- ALTER TABLE "weekly_reports" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "weekly_reports" DROP CONSTRAINT IF EXISTS "weekly_reports_project_id_projects_id_fk";
-- ALTER TABLE "weekly_reports" DROP CONSTRAINT IF EXISTS "weekly_reports_user_id_users_id_fk";
-- DROP TABLE IF EXISTS "weekly_reports";
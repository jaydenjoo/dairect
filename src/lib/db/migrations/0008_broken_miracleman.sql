CREATE TABLE "briefings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"week_start_date" date NOT NULL,
	"content_json" jsonb NOT NULL,
	"ai_generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "briefings_user_week_unique" UNIQUE("user_id","week_start_date")
);
--> statement-breakpoint
ALTER TABLE "briefings" ADD CONSTRAINT "briefings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

-- ROLLBACK:
-- ALTER TABLE "briefings" DROP CONSTRAINT IF EXISTS "briefings_user_id_users_id_fk";
-- DROP TABLE IF EXISTS "briefings";
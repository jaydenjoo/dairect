ALTER TABLE "portal_feedbacks" ADD COLUMN "is_read" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "portal_feedbacks" ADD COLUMN "read_at" timestamp with time zone;
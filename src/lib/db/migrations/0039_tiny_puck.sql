CREATE TABLE "portfolio_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"slug" text,
	"name" text NOT NULL,
	"name_amber" text DEFAULT '',
	"description" text DEFAULT '',
	"cat" text DEFAULT 'saas' NOT NULL,
	"year" text DEFAULT '',
	"duration" text DEFAULT '',
	"stack" text DEFAULT '',
	"status_text" text DEFAULT '',
	"status_type" text DEFAULT 'live',
	"badge" text DEFAULT '',
	"meta_hint" text DEFAULT '',
	"live_url" text,
	"demo_url" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_items_workspace_slug_unique" ON "portfolio_items" USING btree ("workspace_id","slug") WHERE "portfolio_items"."slug" IS NOT NULL AND "portfolio_items"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "portfolio_items_public_order_idx" ON "portfolio_items" USING btree ("display_order") WHERE "portfolio_items"."is_public" = true AND "portfolio_items"."deleted_at" IS NULL;
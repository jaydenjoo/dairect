ALTER TABLE "invoices" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_to_project_id_projects_id_fk" FOREIGN KEY ("converted_to_project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_user_number_unique" UNIQUE("user_id","contract_number");
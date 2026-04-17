ALTER TABLE "leads" ADD CONSTRAINT "leads_source_check" CHECK ("leads"."source" IS NULL OR "leads"."source" IN ('wishket', 'kmong', 'referral', 'direct', 'landing_form', 'other'));--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_status_check" CHECK ("leads"."status" IS NULL OR "leads"."status" IN ('new', 'scheduled', 'consulted', 'estimated', 'contracted', 'failed'));

-- ROLLBACK:
-- ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_source_check";
-- ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_status_check";
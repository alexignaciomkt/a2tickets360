ALTER TABLE "event_categories" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "category_code" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "external_championship_id" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "sports_integration_status" text DEFAULT 'not_applicable' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "sports_integration_error_code" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "sports_integration_error" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "sports_last_sync_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "chk_sports_status" CHECK ("sports_integration_status" IN ('not_applicable', 'pending', 'provisioning', 'integrated', 'failed'));
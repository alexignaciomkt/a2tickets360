-- Custom Safe Migration for Revenue Type and Webhook Logs
DO $$ BEGIN
    CREATE TYPE "public"."sales_revenue_type" AS ENUM('TICKET', 'REGISTRATION', 'REPECHAGE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "revenue_type" "sales_revenue_type" DEFAULT 'TICKET' NOT NULL;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "webhook_logs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "event_key" text NOT NULL,
    "url" text,
    "status" text,
    "payload" jsonb,
    "response" text,
    "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'webhook_logs_event_key_key'
    ) THEN
        ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_event_key_key" UNIQUE("event_key");
    END IF;
END $$;

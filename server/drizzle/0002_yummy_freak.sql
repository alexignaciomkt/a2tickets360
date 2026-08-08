ALTER TABLE "tickets" ADD COLUMN "registration_type" text DEFAULT 'INDIVIDUAL';--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "participants_per_registration" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "ticket_purpose" text DEFAULT 'REGISTRATION';
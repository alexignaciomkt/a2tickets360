CREATE TABLE IF NOT EXISTS "staff_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff_application_functions" (
	"staff_application_id" uuid NOT NULL,
	"professional_function_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "staff_application_functions_staff_application_id_professional_function_id_pk" PRIMARY KEY("staff_application_id","professional_function_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff_applications" ADD CONSTRAINT "staff_applications_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff_application_functions" ADD CONSTRAINT "staff_application_functions_staff_application_id_staff_applications_id_fk" FOREIGN KEY ("staff_application_id") REFERENCES "staff_applications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff_application_functions" ADD CONSTRAINT "staff_application_functions_professional_function_id_staff_professional_functions_id_fk" FOREIGN KEY ("professional_function_id") REFERENCES "staff_professional_functions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unq_active_staff_application" ON "staff_applications" ("event_id","user_id") WHERE status IN ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE IF NOT EXISTS "event_staff_vacancies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"professional_function_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chk_event_staff_vacancies_quantity" CHECK ("quantity" > 0),
	CONSTRAINT "chk_event_staff_vacancies_status" CHECK ("status" IN ('OPEN', 'PAUSED', 'CLOSED')),
	CONSTRAINT "unq_event_staff_vacancies_event_function" UNIQUE("event_id","professional_function_id")
);

CREATE INDEX IF NOT EXISTS "idx_event_staff_vacancies_event_status" ON "event_staff_vacancies" ("event_id","status");

DO $$ BEGIN
 ALTER TABLE "event_staff_vacancies" ADD CONSTRAINT "event_staff_vacancies_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_staff_vacancies" ADD CONSTRAINT "event_staff_vacancies_prof_func_id_fk" FOREIGN KEY ("professional_function_id") REFERENCES "staff_professional_functions"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "staff_applications" ADD COLUMN IF NOT EXISTS "vacancy_id" uuid;

DO $$ BEGIN
 ALTER TABLE "staff_applications" ADD CONSTRAINT "staff_applications_vacancy_id_fk" FOREIGN KEY ("vacancy_id") REFERENCES "event_staff_vacancies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "event_staff" ADD COLUMN IF NOT EXISTS "vacancy_id" uuid;

DO $$ BEGIN
 ALTER TABLE "event_staff" ADD CONSTRAINT "event_staff_vacancy_id_fk" FOREIGN KEY ("vacancy_id") REFERENCES "event_staff_vacancies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

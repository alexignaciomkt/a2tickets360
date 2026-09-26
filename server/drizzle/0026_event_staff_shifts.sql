-- 0026_event_staff_shifts.sql

ALTER TABLE "event_staff_vacancies" ADD COLUMN "work_date" date;
ALTER TABLE "event_staff_vacancies" ADD COLUMN "start_time" time;
ALTER TABLE "event_staff_vacancies" ADD COLUMN "expected_end_time" time;
ALTER TABLE "event_staff_vacancies" ADD COLUMN "compensation_amount" numeric(10, 2);
ALTER TABLE "event_staff_vacancies" ADD COLUMN "compensation_type" text DEFAULT 'FIXED';
ALTER TABLE "event_staff_vacancies" ADD COLUMN "currency" text DEFAULT 'BRL';
ALTER TABLE "event_staff_vacancies" ADD COLUMN "public_notes" text;

ALTER TABLE "event_staff" ADD COLUMN "contract_type" text DEFAULT 'DAILY_FREELANCER';
ALTER TABLE "event_staff" ADD COLUMN "compensation_amount" numeric(10, 2);
ALTER TABLE "event_staff" ADD COLUMN "compensation_type" text DEFAULT 'FIXED';
ALTER TABLE "event_staff" ADD COLUMN "currency" text DEFAULT 'BRL';

CREATE TABLE IF NOT EXISTS "event_staff_shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_staff_id" uuid NOT NULL,
	"shift_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"break_duration_minutes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "event_staff_shifts" ADD CONSTRAINT "event_staff_shifts_event_staff_id_event_staff_id_fk" FOREIGN KEY ("event_staff_id") REFERENCES "event_staff"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "event_staff_shifts" ADD CONSTRAINT "break_duration_check" CHECK ("break_duration_minutes" >= 0);

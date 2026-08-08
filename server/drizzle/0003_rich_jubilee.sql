CREATE TABLE IF NOT EXISTS "sport_registration_players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" uuid NOT NULL,
	"player_order" integer NOT NULL,
	"name" text NOT NULL,
	"cpf" text NOT NULL,
	"phone" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sport_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"ticket_id" uuid NOT NULL,
	"sale_id" uuid,
	"purchased_ticket_id" uuid,
	"team_name" text,
	"registration_type" text DEFAULT 'INDIVIDUAL' NOT NULL,
	"participants_per_registration" integer DEFAULT 1 NOT NULL,
	"ticket_purpose" text DEFAULT 'REGISTRATION' NOT NULL,
	"original_registration_id" uuid,
	"repechage_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_srp_cpf" ON "sport_registration_players" ("cpf");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sr_event_id" ON "sport_registrations" ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sr_original" ON "sport_registrations" ("original_registration_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sr_status" ON "sport_registrations" ("status");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sport_registration_players" ADD CONSTRAINT "sport_registration_players_registration_id_sport_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "sport_registrations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sport_registrations" ADD CONSTRAINT "sport_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sport_registrations" ADD CONSTRAINT "sport_registrations_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sport_registrations" ADD CONSTRAINT "sport_registrations_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sport_registrations" ADD CONSTRAINT "sport_registrations_purchased_ticket_id_purchased_tickets_id_fk" FOREIGN KEY ("purchased_ticket_id") REFERENCES "purchased_tickets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

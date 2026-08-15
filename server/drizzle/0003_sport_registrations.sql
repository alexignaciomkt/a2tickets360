-- ============================================================
-- MIGRATION: 0003_sport_registrations
-- Criado em: 2026-08-08
-- NAO APLICAR AUTOMATICAMENTE - revisar antes de executar
-- ============================================================
-- Depende de: 0002_yummy_freak.sql (tickets.registration_type,
--   tickets.participants_per_registration, tickets.ticket_purpose)
-- ============================================================

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sport_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"ticket_id" uuid NOT NULL,
	"sale_id" uuid,
	"purchased_ticket_id" uuid,
	"team_name" text,
	"registration_type" text NOT NULL DEFAULT 'INDIVIDUAL',
	"participants_per_registration" integer NOT NULL DEFAULT 1,
	"ticket_purpose" text NOT NULL DEFAULT 'REGISTRATION',
	"original_registration_id" uuid,
	"repechage_count" integer NOT NULL DEFAULT 0,
	"status" text NOT NULL DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
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
ALTER TABLE "sport_registrations"
	ADD CONSTRAINT "sport_registrations_event_id_events_id_fk"
	FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sport_registrations"
	ADD CONSTRAINT "sport_registrations_ticket_id_tickets_id_fk"
	FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sport_registrations"
	ADD CONSTRAINT "sport_registrations_sale_id_sales_id_fk"
	FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sport_registrations"
	ADD CONSTRAINT "sport_registrations_purchased_ticket_id_purchased_tickets_id_fk"
	FOREIGN KEY ("purchased_ticket_id") REFERENCES "purchased_tickets"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sport_registrations"
	ADD CONSTRAINT "sport_registrations_original_registration_id_sport_registrations_id_fk"
	FOREIGN KEY ("original_registration_id") REFERENCES "sport_registrations"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sport_registration_players"
	ADD CONSTRAINT "sport_registration_players_registration_id_sport_registrations_id_fk"
	FOREIGN KEY ("registration_id") REFERENCES "sport_registrations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_srp_cpf" ON "sport_registration_players" ("cpf");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sr_event_id" ON "sport_registrations" ("event_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sr_original" ON "sport_registrations" ("original_registration_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sr_status" ON "sport_registrations" ("status");

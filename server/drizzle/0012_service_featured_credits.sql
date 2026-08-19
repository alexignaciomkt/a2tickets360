DO $$ BEGIN
 CREATE TYPE "service_credit_type" AS ENUM('EVENT_FEATURED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "service_credit_order_status" AS ENUM('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "service_credit_status" AS ENUM('AVAILABLE', 'RESERVED', 'CONSUMED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "service_credit_ledger_action" AS ENUM('CREATED', 'RESERVED', 'RELEASED', 'CONSUMED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "featured_cycle_planned_end_reason" AS ENUM('CYCLE_EXPIRED', 'EVENT_ENDED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "featured_cycle_actual_end_reason" AS ENUM('ADMIN_STOPPED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "events" ADD COLUMN "featured_at" timestamp;
ALTER TABLE "events" ADD COLUMN "timezone" text;

UPDATE "events" SET "timezone" = 'America/Sao_Paulo' WHERE "timezone" IS NULL;

ALTER TABLE "events" ALTER COLUMN "timezone" SET NOT NULL;

CREATE TABLE IF NOT EXISTS "service_credit_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizer_id" uuid NOT NULL,
	"credit_type" "service_credit_type" NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"asaas_payment_id" text,
	"external_reference" text NOT NULL,
	"payment_status" "service_credit_order_status" DEFAULT 'PENDING' NOT NULL,
	"origin_event_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_credit_orders_asaas_payment_id_unique" UNIQUE("asaas_payment_id"),
	CONSTRAINT "service_credit_orders_external_reference_unique" UNIQUE("external_reference")
);

CREATE TABLE IF NOT EXISTS "organizer_service_credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizer_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"credit_number" integer NOT NULL,
	"credit_type" "service_credit_type" NOT NULL,
	"status" "service_credit_status" DEFAULT 'AVAILABLE' NOT NULL,
	"origin_event_id" uuid,
	"reserved_event_id" uuid,
	"consumed_event_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reserved_at" timestamp,
	"consumed_at" timestamp,
	"cancelled_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unqOrderCreditNum" UNIQUE("order_id","credit_number")
);

CREATE TABLE IF NOT EXISTS "service_credit_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credit_id" uuid NOT NULL,
	"action" "service_credit_ledger_action" NOT NULL,
	"event_id" uuid,
	"actor_user_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "event_featured_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"credit_id" uuid NOT NULL,
	"featured_at" timestamp NOT NULL,
	"featured_until" timestamp NOT NULL,
	"planned_end_reason" "featured_cycle_planned_end_reason" NOT NULL,
	"actual_end_reason" "featured_cycle_actual_end_reason",
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_featured_cycles_credit_id_unique" UNIQUE("credit_id")
);

DO $$ BEGIN
 ALTER TABLE "service_credit_orders" ADD CONSTRAINT "service_credit_orders_organizer_id_organizer_details_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "organizer_details"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
 ALTER TABLE "service_credit_orders" ADD CONSTRAINT "service_credit_orders_origin_event_id_events_id_fk" FOREIGN KEY ("origin_event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "organizer_service_credits" ADD CONSTRAINT "organizer_service_credits_organizer_id_organizer_details_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "organizer_details"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
 ALTER TABLE "organizer_service_credits" ADD CONSTRAINT "organizer_service_credits_order_id_service_credit_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "service_credit_orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
 ALTER TABLE "organizer_service_credits" ADD CONSTRAINT "organizer_service_credits_origin_event_id_events_id_fk" FOREIGN KEY ("origin_event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
 ALTER TABLE "organizer_service_credits" ADD CONSTRAINT "organizer_service_credits_reserved_event_id_events_id_fk" FOREIGN KEY ("reserved_event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
 ALTER TABLE "organizer_service_credits" ADD CONSTRAINT "organizer_service_credits_consumed_event_id_events_id_fk" FOREIGN KEY ("consumed_event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "service_credit_ledger" ADD CONSTRAINT "service_credit_ledger_credit_id_organizer_service_credits_id_fk" FOREIGN KEY ("credit_id") REFERENCES "organizer_service_credits"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
 ALTER TABLE "service_credit_ledger" ADD CONSTRAINT "service_credit_ledger_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_featured_cycles" ADD CONSTRAINT "event_featured_cycles_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
 ALTER TABLE "event_featured_cycles" ADD CONSTRAINT "event_featured_cycles_credit_id_organizer_service_credits_id_fk" FOREIGN KEY ("credit_id") REFERENCES "organizer_service_credits"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "service_credit_orders" ADD CONSTRAINT "chk_quantity_positive" CHECK (quantity > 0);
ALTER TABLE "service_credit_orders" ADD CONSTRAINT "chk_unit_price_positive" CHECK (unit_price >= 0);
ALTER TABLE "service_credit_orders" ADD CONSTRAINT "chk_total_amount_non_negative" CHECK (total_amount >= 0);
ALTER TABLE "organizer_service_credits" ADD CONSTRAINT "chk_credit_number" CHECK (credit_number > 0);

CREATE INDEX IF NOT EXISTS "idx_service_credits_org_status" ON "organizer_service_credits" ("organizer_id", "status");
CREATE INDEX IF NOT EXISTS "idx_service_credits_order" ON "organizer_service_credits" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_service_credits_res_event" ON "organizer_service_credits" ("reserved_event_id");
CREATE INDEX IF NOT EXISTS "idx_service_credits_cons_event" ON "organizer_service_credits" ("consumed_event_id");
CREATE INDEX IF NOT EXISTS "idx_feat_cycles_event" ON "event_featured_cycles" ("event_id");
CREATE INDEX IF NOT EXISTS "idx_feat_cycles_until" ON "event_featured_cycles" ("featured_until");

-- Custom SQL migration for Financial Engine (Phase C.2)

CREATE TABLE IF NOT EXISTS "event_promoters" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "event_id" uuid NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "promoter_id" uuid NOT NULL,
    "commission_rate" numeric(5, 2) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100),
    "discount_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL CHECK (discount_rate >= 0 AND discount_rate <= 100),
    "referral_code" text NOT NULL UNIQUE,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "unq_event_promoter" UNIQUE("event_id", "promoter_id")
);

--> statement-breakpoint

ALTER TABLE "sales" ADD COLUMN "unit_price" numeric(10, 2) NOT NULL CHECK (unit_price >= 0);
ALTER TABLE "sales" ADD COLUMN "quantity" integer NOT NULL CHECK (quantity > 0);
ALTER TABLE "sales" ADD COLUMN "billable_units" integer NOT NULL CHECK (billable_units > 0);
ALTER TABLE "sales" ADD COLUMN "gross_amount" numeric(12, 2) NOT NULL CHECK (gross_amount >= 0);
ALTER TABLE "sales" ADD COLUMN "discount_amount" numeric(12, 2) NOT NULL CHECK (discount_amount >= 0);
ALTER TABLE "sales" ADD COLUMN "commercial_amount" numeric(12, 2) NOT NULL CHECK (commercial_amount >= 0);
ALTER TABLE "sales" ADD COLUMN "platform_fee_amount" numeric(12, 2) NOT NULL CHECK (platform_fee_amount >= 0);
ALTER TABLE "sales" ADD COLUMN "producer_amount" numeric(12, 2) NOT NULL CHECK (producer_amount >= 0);
ALTER TABLE "sales" ADD COLUMN "fee_passed_to_buyer" boolean NOT NULL;
ALTER TABLE "sales" ADD COLUMN "buyer_total" numeric(12, 2) NOT NULL CHECK (buyer_total >= 0);
ALTER TABLE "sales" ADD COLUMN "event_promoter_id" uuid REFERENCES "event_promoters"("id") ON DELETE SET NULL;
ALTER TABLE "sales" ADD COLUMN "promoter_commission_rate" numeric(5, 2) CHECK (promoter_commission_rate IS NULL OR (promoter_commission_rate >= 0 AND promoter_commission_rate <= 100));


ALTER TABLE "event_promoters" ADD COLUMN "settlement_mode" text DEFAULT 'MANUAL' NOT NULL;
ALTER TABLE "sales" ADD COLUMN "promoter_settlement_mode" text;
ALTER TABLE "event_promoters" ADD CONSTRAINT "event_promoters_settlement_mode_check" CHECK ("settlement_mode" IN ('MANUAL', 'ASAAS_SPLIT'));
ALTER TABLE "sales" ADD CONSTRAINT "sales_promoter_settlement_mode_check" CHECK ("promoter_settlement_mode" IS NULL OR "promoter_settlement_mode" IN ('MANUAL', 'ASAAS_SPLIT'));
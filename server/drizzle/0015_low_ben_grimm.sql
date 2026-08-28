-- Adiciona status
ALTER TABLE "event_promoters" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'PENDING' NOT NULL;
ALTER TABLE "event_promoters" DROP CONSTRAINT IF EXISTS "event_promoters_status_check";
ALTER TABLE "event_promoters" ADD CONSTRAINT "event_promoters_status_check" CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED'));

-- Permite referral_code ser nulo (promoter pendente/rejeitado não tem)
ALTER TABLE "event_promoters" ALTER COLUMN "referral_code" DROP NOT NULL;

-- Adiciona a restrição Unique parcial para o referral_code (caso o Drizzle não suporte partial idx bem, um create unique index custom resolve)
CREATE UNIQUE INDEX IF NOT EXISTS "event_promoters_referral_code_unique_idx" ON "event_promoters" ("referral_code") WHERE "referral_code" IS NOT NULL;
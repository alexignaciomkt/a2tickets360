ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "cpf" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "birth_date" date;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "city" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "state" text;
ALTER TABLE "promoters" ADD COLUMN IF NOT EXISTS "profile_complete" boolean DEFAULT false NOT NULL;
ALTER TABLE "staff_profiles" ADD COLUMN IF NOT EXISTS "profile_complete" boolean DEFAULT false NOT NULL;

-- Backfill Determinístico (Promoter)
UPDATE "promoters" 
SET "profile_complete" = true 
WHERE "user_id" IN (
    SELECT p.user_id 
    FROM "promoters" p 
    JOIN "profiles" pr ON p.user_id = pr.user_id 
    WHERE pr.profile_complete = true
);


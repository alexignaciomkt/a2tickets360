ALTER TABLE "organizer_service_credits" ADD COLUMN "reservation_token" varchar(255);
ALTER TABLE "organizer_service_credits" ADD COLUMN "expires_at" timestamp with time zone;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_service_credits_reservation_token" ON "organizer_service_credits" ("reservation_token") WHERE "reservation_token" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_service_credits_expiration" ON "organizer_service_credits" ("organizer_id", "status", "expires_at");

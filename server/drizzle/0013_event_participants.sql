-- 1. Criação da Tabela Minimalista de Participantes
CREATE TABLE "event_participants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_id" uuid NOT NULL,
  "profile_id" uuid,
  "full_name" text NOT NULL,
  "cpf" text,
  "email" text,
  "phone" text,
  "photo_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 2. Adição de Colunas nas Tabelas Dependentes
ALTER TABLE "purchased_tickets" ADD COLUMN "participant_id" uuid;
ALTER TABLE "sport_registration_players" ADD COLUMN "event_participant_id" uuid;
ALTER TABLE "sport_registration_players" ADD COLUMN "event_id" uuid;

-- 3. Backfill de event_id em sport_registration_players
UPDATE "sport_registration_players" srp
SET "event_id" = sr."event_id"
FROM "sport_registrations" sr
WHERE srp."registration_id" = sr."id";

-- 4. Constraint NOT NULL após backfill limpo
ALTER TABLE "sport_registration_players" ALTER COLUMN "event_id" SET NOT NULL;

-- 5. UNIQUE Constraints para habilitar FKs Compostas
ALTER TABLE "event_participants" ADD CONSTRAINT "unq_event_participants_id_event" UNIQUE ("id", "event_id");

DO $$ BEGIN
  ALTER TABLE "sport_registrations" ADD CONSTRAINT "unq_sport_registrations_id_event" UNIQUE ("id", "event_id");
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 6. Foreign Keys Simples da tabela de Participantes
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE restrict;
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE set null;

-- 7. Composite Foreign Keys (Cross-Event Shield)
ALTER TABLE "purchased_tickets" ADD CONSTRAINT "fk_purchased_tickets_participant_cross" FOREIGN KEY ("participant_id", "event_id") REFERENCES "event_participants"("id", "event_id") ON DELETE restrict;
ALTER TABLE "sport_registration_players" ADD CONSTRAINT "fk_sport_players_participant_cross" FOREIGN KEY ("event_participant_id", "event_id") REFERENCES "event_participants"("id", "event_id") ON DELETE restrict;
ALTER TABLE "sport_registration_players" ADD CONSTRAINT "fk_sport_players_registration_cross" FOREIGN KEY ("registration_id", "event_id") REFERENCES "sport_registrations"("id", "event_id") ON DELETE cascade;

-- 8. Índices de Performance e Integridade
CREATE INDEX "idx_event_participants_event_id" ON "event_participants" ("event_id");
CREATE INDEX "idx_event_participants_profile_id" ON "event_participants" ("profile_id");
CREATE INDEX "idx_purchased_tickets_participant_id" ON "purchased_tickets" ("participant_id");
CREATE INDEX "idx_srp_event_participant_id" ON "sport_registration_players" ("event_participant_id");

-- Deduplicação de CPF Parcial (Ignora Nulls/Vazios)
CREATE UNIQUE INDEX "unq_event_participant_cpf" ON "event_participants" ("event_id", "cpf") WHERE "cpf" IS NOT NULL AND "cpf" != '';

-- 9. Row Level Security (RLS)
ALTER TABLE "event_participants" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organizers can manage own event participants" ON "event_participants"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM "events"
    WHERE "events"."id" = "event_participants"."event_id"
    AND "events"."organizer_id" = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM "events"
    WHERE "events"."id" = "event_participants"."event_id"
    AND "events"."organizer_id" = auth.uid()
  )
);

-- Migration 0014: Permitir que o comprador leia os participantes atrelados as suas credenciais
CREATE POLICY "Buyers can view participants from their credentials"
ON "event_participants"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "purchased_tickets"
    WHERE "purchased_tickets"."participant_id" = "event_participants"."id"
      AND "purchased_tickets"."user_id" = auth.uid()
  )
);

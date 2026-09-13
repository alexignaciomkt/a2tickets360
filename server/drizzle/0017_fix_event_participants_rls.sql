-- Migration para correção da política RLS na tabela event_participants (BUG-HOM-007)
-- 
-- Problema: A política comparava `events.organizer_id` (que aponta para `organizer_details.id`) diretamente 
-- com `auth.uid()` (que é o ID do usuário).
-- Solução: Fazer o JOIN com `organizer_details` para verificar se o `user_id` do organizador bate com `auth.uid()`.

DROP POLICY IF EXISTS "Organizers can manage own event participants" ON "event_participants";

CREATE POLICY "Organizers can manage own event participants" ON "event_participants"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM "events" e
    JOIN "organizer_details" od ON od."id" = e."organizer_id"
    WHERE e."id" = "event_participants"."event_id"
    AND od."user_id" = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM "events" e
    JOIN "organizer_details" od ON od."id" = e."organizer_id"
    WHERE e."id" = "event_participants"."event_id"
    AND od."user_id" = auth.uid()
  )
);

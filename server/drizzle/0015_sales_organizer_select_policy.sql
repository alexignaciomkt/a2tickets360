CREATE POLICY "Organizers can view sales from own events"
ON "sales"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "events"
    WHERE "events"."id" = "sales"."event_id"
      AND "events"."organizer_id" = auth.uid()
  )
);

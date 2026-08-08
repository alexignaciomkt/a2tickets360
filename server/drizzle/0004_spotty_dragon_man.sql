DO $$ BEGIN
 ALTER TABLE "sport_registrations" ADD CONSTRAINT "sport_registrations_original_registration_id_sport_registrations_id_fk" FOREIGN KEY ("original_registration_id") REFERENCES "sport_registrations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

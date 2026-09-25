ALTER TABLE staff_profiles ADD COLUMN slug TEXT;
ALTER TABLE staff_profiles ADD CONSTRAINT staff_profiles_slug_unique UNIQUE (slug);

ALTER TABLE events ADD CONSTRAINT events_slug_unique UNIQUE (slug);

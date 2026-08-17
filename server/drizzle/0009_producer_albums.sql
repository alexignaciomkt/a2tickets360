DO $$ BEGIN
 CREATE TYPE "producer_album_status" AS ENUM('DRAFT', 'PUBLISHED', 'HIDDEN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "producer_albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizer_id" uuid NOT NULL,
	"event_id" uuid,
	"title" varchar(100) NOT NULL,
	"description" varchar(150),
	"cover_photo_id" uuid,
	"status" "producer_album_status" DEFAULT 'DRAFT' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"event_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "producer_album_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"album_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"object_key" text NOT NULL,
	"caption" varchar(150),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unq_producer_photos_object_key" UNIQUE("object_key")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_producer_albums_org_stat_sort" ON "producer_albums" ("organizer_id","status","sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_producer_albums_event" ON "producer_albums" ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_producer_photos_album_sort" ON "producer_album_photos" ("album_id","sort_order");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "producer_albums" ADD CONSTRAINT "producer_albums_organizer_id_organizer_details_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "organizer_details"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "producer_albums" ADD CONSTRAINT "producer_albums_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "producer_album_photos" ADD CONSTRAINT "producer_album_photos_album_id_producer_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "producer_albums"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "producer_albums" ADD CONSTRAINT "producer_albums_cover_photo_id_producer_album_photos_id_fk" FOREIGN KEY ("cover_photo_id") REFERENCES "producer_album_photos"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

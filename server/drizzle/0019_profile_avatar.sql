-- Custom Migration: Identity Foundation (Avatar)
-- Idempotent setup for the global avatar field
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "avatar_url" text;

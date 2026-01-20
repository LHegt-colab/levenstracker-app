-- FIX DATABASE SCRIPT V2
-- Run this in Supabase SQL Editor to fix 'Verzameling', 'Reflectie' and 'Kalender' issues.

-- 1. FIX VERZAMELING (Add missing description column)
ALTER TABLE public.verzameling_items ADD COLUMN IF NOT EXISTS description text;

-- 2. FIX KALENDER (Ensure all columns exist)
ALTER TABLE public.kalender_events ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.kalender_events ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE public.kalender_events ADD COLUMN IF NOT EXISTS recurrence jsonb;

-- 3. FIX REFLECTIES (Ensure jsonb answers exist)
ALTER TABLE public.reflecties ADD COLUMN IF NOT EXISTS answers jsonb;
ALTER TABLE public.reflecties ADD COLUMN IF NOT EXISTS type text;

-- 4. FIX DAGBOEK (Just in case V1 didn't run completely)
ALTER TABLE public.dagboek_entries ADD COLUMN IF NOT EXISTS energy integer;
ALTER TABLE public.dagboek_entries ADD COLUMN IF NOT EXISTS stress integer;
ALTER TABLE public.dagboek_entries ADD COLUMN IF NOT EXISTS sleep integer;
ALTER TABLE public.dagboek_entries ADD COLUMN IF NOT EXISTS sport jsonb;

-- 5. FIX VOEDING
ALTER TABLE public.voeding_meals ADD COLUMN IF NOT EXISTS amount numeric;
ALTER TABLE public.voeding_meals ADD COLUMN IF NOT EXISTS unit text;
ALTER TABLE public.voeding_meals ADD COLUMN IF NOT EXISTS notes text;

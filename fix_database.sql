-- FIX DATABASE SCRIPT
-- Run this in your Supabase SQL Editor to fix all save errors

-- 1. FIX DAGBOEK (Add missing wellness columns)
ALTER TABLE public.dagboek_entries ADD COLUMN IF NOT EXISTS energy integer;
ALTER TABLE public.dagboek_entries ADD COLUMN IF NOT EXISTS stress integer;
ALTER TABLE public.dagboek_entries ADD COLUMN IF NOT EXISTS sleep integer;
ALTER TABLE public.dagboek_entries ADD COLUMN IF NOT EXISTS sport jsonb;

-- 2. FIX KALENDER (Add location, color, recurrence)
ALTER TABLE public.kalender_events ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.kalender_events ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE public.kalender_events ADD COLUMN IF NOT EXISTS recurrence jsonb;

-- 3. FIX VOEDING (Add amount, unit, notes)
ALTER TABLE public.voeding_meals ADD COLUMN IF NOT EXISTS amount numeric;
ALTER TABLE public.voeding_meals ADD COLUMN IF NOT EXISTS unit text;
ALTER TABLE public.voeding_meals ADD COLUMN IF NOT EXISTS notes text;

-- 4. FIX VERZAMELING (Add color to categories)
ALTER TABLE public.verzameling_categories ADD COLUMN IF NOT EXISTS color text;

-- 5. ENSURE JSONB COLUMNS EXIST (For Doelen & Reflecties)
ALTER TABLE public.doelen ADD COLUMN IF NOT EXISTS milestones jsonb;
ALTER TABLE public.reflecties ADD COLUMN IF NOT EXISTS answers jsonb;
ALTER TABLE public.reflecties ADD COLUMN IF NOT EXISTS type text;

-- 6. OPTIONAL: Insert default categories for Verzameling if empty
-- (Only runs if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.verzameling_categories) THEN
        INSERT INTO public.verzameling_categories (id, user_id, name, color, created_at)
        SELECT 
            uuid_generate_v4(),
            auth.uid(), -- WARNING: This might fail if run in SQL editor without active user. 
            -- Better to let the app handle default categories via the fallback code I added.
            name, 
            color,
            now()
        FROM (VALUES 
            ('Lezen', '#3B82F6'), 
            ('Kijken', '#10B981'), 
            ('Luisteren', '#8B5CF6'), 
            ('Tools', '#F59E0B'), 
            ('Recepten', '#EC4899'), 
            ('Overig', '#6B7280')
        ) AS categories(name, color)
        WHERE auth.uid() IS NOT NULL; 
    END IF;
END $$;

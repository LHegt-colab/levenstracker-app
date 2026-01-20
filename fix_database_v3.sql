-- FIX DATABASE SCRIPT V3
-- Run this in Supabase SQL Editor to fix Settings (Theme and Notifications)

-- 1. FIX SETTINGS (Add missing theme column)
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS theme text DEFAULT 'system';

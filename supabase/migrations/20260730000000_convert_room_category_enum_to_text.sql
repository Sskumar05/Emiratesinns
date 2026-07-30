-- Migration: Convert room_category ENUM columns to TEXT
--
-- Purpose: Allow free-text room category names (e.g. "Deluxe", "Suite",
--          "Presidential Suite") instead of the fixed ENUM values.
--
-- Impact:
--   • public.rooms.category    → TEXT NOT NULL
--   • public.bookings.category → TEXT NOT NULL
--   • Drops the now-unused room_category ENUM type
--
-- All existing rows are preserved; ENUM values are cast to their
-- string representations automatically (e.g. 'ac_double' stays 'ac_double').

-- 1. Alter rooms.category
ALTER TABLE public.rooms
  ALTER COLUMN category TYPE TEXT
  USING category::TEXT;

-- 2. Alter bookings.category
ALTER TABLE public.bookings
  ALTER COLUMN category TYPE TEXT
  USING category::TEXT;

-- 3. Drop the ENUM type (no longer referenced by any column)
DROP TYPE IF EXISTS public.room_category;

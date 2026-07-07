-- ============================================================
-- Migration: Stay Mode Support
-- Date: 2026-07-06
-- Run this against your Supabase project with:
--   npx supabase db push
-- Or paste directly into the Supabase SQL Editor.
-- ============================================================

-- 1. Create the system_settings table (safe — will not fail if re-run)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT        NOT NULL UNIQUE,
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Seed default stay mode ('standard') — skipped if already present
INSERT INTO public.system_settings (key, value)
VALUES ('global_stay_mode', '"standard"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. GRANTs
GRANT SELECT            ON public.system_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.system_settings TO authenticated;
GRANT ALL               ON public.system_settings TO service_role;

-- 4. Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to allow safe re-runs
DROP POLICY IF EXISTS "Public read system settings"    ON public.system_settings;
DROP POLICY IF EXISTS "Admins manage system settings"  ON public.system_settings;

CREATE POLICY "Public read system settings"
  ON public.system_settings FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins manage system settings"
  ON public.system_settings FOR ALL TO authenticated
  USING   (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Auto-update updated_at (safe — trigger function already exists)
DROP TRIGGER IF EXISTS trg_system_settings_updated ON public.system_settings;
CREATE TRIGGER trg_system_settings_updated
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Add price_12_hours to rooms (safe — IF NOT EXISTS prevents duplicates)
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS price_12_hours NUMERIC(10,2) NOT NULL DEFAULT 0;

-- 7. Add stay_type to bookings (safe — IF NOT EXISTS prevents duplicates)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS stay_type TEXT NOT NULL DEFAULT 'standard';

-- ============================================================
-- After running this migration, Supabase's schema cache will
-- refresh automatically within ~30 seconds, or you can force
-- it immediately via: Supabase Dashboard > API > Reload Schema
-- ============================================================

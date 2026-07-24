-- Add walk-in booking fields to bookings table
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_source TEXT NOT NULL DEFAULT 'online',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS adults INT,
  ADD COLUMN IF NOT EXISTS children INT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS id_proof_type TEXT,
  ADD COLUMN IF NOT EXISTS id_proof_number TEXT,
  ADD COLUMN IF NOT EXISTS special_request TEXT;

-- Add check constraint for booking_source if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'bookings' AND constraint_name = 'check_booking_source'
  ) THEN
    ALTER TABLE public.bookings ADD CONSTRAINT check_booking_source CHECK (booking_source IN ('online', 'walk_in'));
  END IF;
END $$;

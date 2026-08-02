-- 040_musyawarah_foundation.sql
-- Adds missing fields to the events table to form the complete Musyawarah business entity.

-- Add new fields
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS period_start TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS period_end TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS registration_open TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS registration_close TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS candidate_registration_open TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS candidate_registration_close TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_url VARCHAR(255);

-- Map existing start_date to period_start if exists (for backwards compatibility if any data exists)
UPDATE events SET period_start = start_date WHERE period_start IS NULL;

-- Drop obsolete fields
ALTER TABLE events
  DROP COLUMN IF EXISTS start_date,
  DROP COLUMN IF EXISTS period;

-- Ensure status check constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'chk_events_status'
    ) THEN
        ALTER TABLE events ADD CONSTRAINT chk_events_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));
    END IF;
END $$;

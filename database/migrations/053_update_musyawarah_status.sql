-- 053_update_musyawarah_status.sql
-- Update the status check constraint to match the requested lifecycle states.

DO $$
BEGIN
    -- Drop the existing constraint (from 040_musyawarah_foundation or 004_create_events)
    ALTER TABLE events DROP CONSTRAINT IF EXISTS chk_events_status;
    
    -- Add the new constraint with the exact requested states
    ALTER TABLE events ADD CONSTRAINT chk_events_status 
        CHECK (status IN ('DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'ARCHIVED'));
END $$;

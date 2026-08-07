-- Migration: Add Registration Capacity Settings and Support Nullable Registration Number
-- 059_add_registration_capacity_settings.sql

-- 1. Make registration_number nullable on participants to support Waiting List participants
ALTER TABLE participants ALTER COLUMN registration_number DROP NOT NULL;

-- 2. Drop existing unique constraint if present and create partial unique index
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_registration_number_key;
DROP INDEX IF EXISTS idx_participants_registration_number;
CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_registration_number 
ON participants(registration_number) 
WHERE deleted_at IS NULL AND registration_number IS NOT NULL AND registration_number != '';

-- 3. Update system_configurations for registration group to include participant_limit and capacity_mode
UPDATE system_configurations
SET settings = settings || '{"participant_limit": 0, "capacity_mode": "CLOSE"}'::jsonb
WHERE group_name = 'registration' 
  AND (NOT settings ? 'participant_limit' OR NOT settings ? 'capacity_mode');

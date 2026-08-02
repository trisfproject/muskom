-- 039_add_musyawarah_multi_crud.sql
-- Extends the events table to support full multi-Musyawarah CRUD.
-- The existing `is_default_active` column serves as the "active" flag.
-- We add `period` for human-readable period labels.

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS period VARCHAR(100),
  ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Ensure only one event can be default active at a time via a partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS uq_events_single_default_active
  ON events (is_default_active)
  WHERE is_default_active = true AND deleted_at IS NULL;

-- Create an index for faster lookups by status
CREATE INDEX IF NOT EXISTS idx_events_is_default_active ON events (is_default_active) WHERE deleted_at IS NULL;

-- Remove event_name and event_year from website_identity system configuration
-- since Musyawarah is now the source of truth for these fields.
UPDATE system_configurations
SET settings = settings
  - 'event_name'
  - 'event_year'
WHERE group_name = 'website_identity';

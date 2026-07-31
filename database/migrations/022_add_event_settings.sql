-- Add Settings to Events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{
  "registration_enabled": false,
  "candidate_enabled": false,
  "attendance_enabled": false,
  "voting_enabled": false,
  "notification_enabled": false,
  "realtime_enabled": true
}'::jsonb;

-- Add explicit active flag
ALTER TABLE events
ADD COLUMN IF NOT EXISTS is_default_active BOOLEAN NOT NULL DEFAULT false;

-- Ensure only ONE event can be the default active event at any given time
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_single_active ON events (is_default_active) WHERE is_default_active = true;

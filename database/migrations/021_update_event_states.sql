-- Remove rigid DB-level status constraints to allow the application-level State Machine 
-- to dynamically govern entity lifecycle and states.

ALTER TABLE events DROP CONSTRAINT IF EXISTS chk_events_status;

-- Note: The `events.status` column remains a VARCHAR(50).
-- Valid states are now defined and enforced by `apps/api/platform/workflow` definitions.

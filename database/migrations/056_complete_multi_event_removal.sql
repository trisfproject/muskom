-- Complete Multi-Event Removal (Notification Tables)

ALTER TABLE notification_templates DROP CONSTRAINT IF EXISTS notification_templates_event_id_fkey;
DROP INDEX IF EXISTS idx_notification_templates_event;
ALTER TABLE notification_templates DROP COLUMN IF EXISTS event_id;

ALTER TABLE notification_jobs DROP CONSTRAINT IF EXISTS notification_jobs_event_id_fkey;
DROP INDEX IF EXISTS idx_notification_jobs_event;
ALTER TABLE notification_jobs DROP COLUMN IF EXISTS event_id;

ALTER TABLE notification_history DROP CONSTRAINT IF EXISTS notification_history_event_id_fkey;
DROP INDEX IF EXISTS idx_notification_history_event;
ALTER TABLE notification_history DROP COLUMN IF EXISTS event_id;

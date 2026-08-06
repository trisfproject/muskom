-- Remove Multi-Event Concepts

-- 1. Drop foreign keys and indexes first to safely drop columns
ALTER TABLE participants DROP CONSTRAINT IF EXISTS fk_participants_musyawarah;
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_musyawarah_id_fkey;
DROP INDEX IF EXISTS idx_participants_musyawarah_id;

ALTER TABLE candidates DROP CONSTRAINT IF EXISTS fk_candidates_musyawarah;
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_musyawarah_id_fkey;
DROP INDEX IF EXISTS idx_candidates_musyawarah_id;
DROP INDEX IF EXISTS idx_candidates_number_musyawarah;
DROP INDEX IF EXISTS idx_candidates_unique_email;

ALTER TABLE votes DROP CONSTRAINT IF EXISTS fk_votes_events;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS uq_votes_event_registration;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS uq_votes_event_participant;

ALTER TABLE announcements DROP CONSTRAINT IF EXISTS fk_announcements_events;
DROP INDEX IF EXISTS idx_announcements_event_id;

ALTER TABLE automation_rules DROP CONSTRAINT IF EXISTS automation_rules_event_id_fkey;
DROP INDEX IF EXISTS idx_automation_rules_event;

ALTER TABLE integration_logs DROP CONSTRAINT IF EXISTS integration_logs_event_id_fkey;
DROP INDEX IF EXISTS idx_integration_logs_event;

ALTER TABLE report_history DROP CONSTRAINT IF EXISTS report_history_event_id_fkey;
DROP INDEX IF EXISTS idx_report_history_event;

ALTER TABLE documents DROP CONSTRAINT IF EXISTS fk_documents_events;
DROP INDEX IF EXISTS idx_documents_event_id;

ALTER TABLE registrations DROP CONSTRAINT IF EXISTS fk_registrations_events;
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS uq_registrations_event_person;

-- 2. Drop columns
ALTER TABLE participants DROP COLUMN IF EXISTS musyawarah_id;
ALTER TABLE candidates DROP COLUMN IF EXISTS musyawarah_id;
ALTER TABLE votes DROP COLUMN IF EXISTS event_id;
ALTER TABLE announcements DROP COLUMN IF EXISTS event_id;
ALTER TABLE automation_rules DROP COLUMN IF EXISTS event_id;
ALTER TABLE integration_logs DROP COLUMN IF EXISTS event_id;
ALTER TABLE report_history DROP COLUMN IF EXISTS event_id;
ALTER TABLE documents DROP COLUMN IF EXISTS event_id;
ALTER TABLE registrations DROP COLUMN IF EXISTS event_id;

-- 3. Drop obsolete tables
DROP TABLE IF EXISTS event_settings CASCADE;
DROP TABLE IF EXISTS event_phases CASCADE;
DROP TABLE IF EXISTS voting_sessions CASCADE;
DROP TABLE IF EXISTS timelines CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- 4. Recreate unique indexes without event_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_number ON candidates(candidate_number) WHERE deleted_at IS NULL AND candidate_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_unique_email ON candidates(email) WHERE deleted_at IS NULL;

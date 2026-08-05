-- 054_fix_attendance_votes_participants_fk.sql
-- Fix foreign key constraints on attendance and votes tables to point to participants(id) instead of deprecated registrations(id)

-- 1. Attendance Table
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS fk_attendance_registrations;
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS uq_attendance_registration;
DROP INDEX IF EXISTS attendance_registration_id_active_idx;

ALTER TABLE attendance RENAME COLUMN registration_id TO participant_id;

ALTER TABLE attendance ADD CONSTRAINT uq_attendance_participant UNIQUE (participant_id);
ALTER TABLE attendance ADD CONSTRAINT fk_attendance_participants FOREIGN KEY (participant_id) REFERENCES participants (id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX IF NOT EXISTS attendance_participant_id_active_idx ON attendance (participant_id) WHERE undone_at IS NULL;

-- 2. Votes Table
ALTER TABLE votes DROP CONSTRAINT IF EXISTS fk_votes_registrations;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS uq_votes_event_registration;

ALTER TABLE votes RENAME COLUMN registration_id TO participant_id;

ALTER TABLE votes ADD CONSTRAINT uq_votes_event_participant UNIQUE (event_id, participant_id);
ALTER TABLE votes ADD CONSTRAINT fk_votes_participants FOREIGN KEY (participant_id) REFERENCES participants (id) ON DELETE RESTRICT;

-- Indexes
DROP INDEX IF EXISTS idx_votes_registration_id;
CREATE INDEX IF NOT EXISTS idx_votes_participant_id ON votes (participant_id);


-- Add Undo tracking to attendance table to support immutability
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS undone_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS undone_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS undo_reason TEXT;

-- We still keep the unique constraint on registration_id so a user can only check-in once, 
-- but if we want them to be able to check-in again after being undone, we might need a partial index.
-- However, the requirement states "Participant can only check in once." 
-- "Undo Check-in is allowed... Attendance is immutable."
-- So we'll drop the existing constraint and create a partial unique index for active check-ins.
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_registration_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS attendance_registration_id_active_idx 
ON attendance (registration_id) 
WHERE undone_at IS NULL;

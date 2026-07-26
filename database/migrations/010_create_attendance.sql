CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checked_in_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_attendance_registration UNIQUE (registration_id),
    CONSTRAINT fk_attendance_registrations FOREIGN KEY (registration_id) REFERENCES registrations (id) ON DELETE RESTRICT,
    CONSTRAINT fk_attendance_checked_in_by FOREIGN KEY (checked_in_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_attendance_checked_in_by ON attendance (checked_in_by);

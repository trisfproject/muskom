CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    person_id UUID NOT NULL,
    participant_category VARCHAR(100),
    source VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_registrations_event_person UNIQUE (event_id, person_id),
    CONSTRAINT fk_registrations_events FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE RESTRICT,
    CONSTRAINT fk_registrations_persons FOREIGN KEY (person_id) REFERENCES persons (id) ON DELETE RESTRICT,
    CONSTRAINT fk_registrations_approved_by FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_registrations_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_person_id ON registrations (person_id);
CREATE INDEX IF NOT EXISTS idx_registrations_approved_by ON registrations (approved_by);

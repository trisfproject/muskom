CREATE TABLE IF NOT EXISTS candidate_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL,
    vision TEXT,
    mission TEXT,
    work_program TEXT,
    photo_path VARCHAR(255),
    document_path VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_candidate_applications_registration UNIQUE (registration_id),
    CONSTRAINT fk_candidate_applications_registration FOREIGN KEY (registration_id) REFERENCES registrations (id) ON DELETE RESTRICT,
    CONSTRAINT fk_candidate_applications_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_candidate_apps_status CHECK (status IN ('SUBMITTED', 'REVIEWING', 'ACCEPTED', 'REJECTED'))
);

CREATE INDEX IF NOT EXISTS idx_candidate_applications_reviewed_by ON candidate_applications (reviewed_by);

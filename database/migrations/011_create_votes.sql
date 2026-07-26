CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    registration_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_votes_event_registration UNIQUE (event_id, registration_id),
    CONSTRAINT fk_votes_events FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE RESTRICT,
    CONSTRAINT fk_votes_registrations FOREIGN KEY (registration_id) REFERENCES registrations (id) ON DELETE RESTRICT,
    CONSTRAINT fk_votes_candidates FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes (candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_registration_id ON votes (registration_id);

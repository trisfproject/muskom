CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    registration_id UUID NOT NULL,
    candidate_number INTEGER NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_candidates_registration UNIQUE (registration_id),
    CONSTRAINT uq_candidates_event_number UNIQUE (event_id, candidate_number),
    CONSTRAINT fk_candidates_events FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE RESTRICT,
    CONSTRAINT fk_candidates_registrations FOREIGN KEY (registration_id) REFERENCES registrations (id) ON DELETE RESTRICT
);

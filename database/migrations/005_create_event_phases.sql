CREATE TABLE IF NOT EXISTS event_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    phase VARCHAR(100) NOT NULL,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_event_phases_event_id_phase UNIQUE (event_id, phase),
    CONSTRAINT fk_event_phases_events FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
);

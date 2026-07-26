CREATE TABLE IF NOT EXISTS event_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    auto_scheduler BOOLEAN NOT NULL DEFAULT false,
    show_live_result BOOLEAN NOT NULL DEFAULT false,
    registration_limit INTEGER,
    allow_walkin BOOLEAN NOT NULL DEFAULT false,
    allow_candidate_registration BOOLEAN NOT NULL DEFAULT false,
    telegram_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_event_settings_event_id UNIQUE (event_id),
    CONSTRAINT fk_event_settings_events FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
);

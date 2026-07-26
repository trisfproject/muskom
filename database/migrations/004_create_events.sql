CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    theme VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    banner_path VARCHAR(255),
    logo_path VARCHAR(255),
    start_date TIMESTAMPTZ,
    event_date TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,

    -- Enforce business rules on status
    CONSTRAINT chk_events_status CHECK (status IN ('DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT uq_events_slug UNIQUE (slug)
);

-- Index for status since it will likely be used for filtering
CREATE INDEX IF NOT EXISTS idx_events_status ON events (status);

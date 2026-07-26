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
    deleted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_events_slug UNIQUE (slug),
    CONSTRAINT chk_events_status CHECK (status IN ('DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'))
);

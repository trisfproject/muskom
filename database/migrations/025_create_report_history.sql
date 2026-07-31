CREATE TABLE IF NOT EXISTS report_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    report_type VARCHAR(100) NOT NULL,
    file_format VARCHAR(20) NOT NULL,
    generated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_history_event ON report_history(event_id);

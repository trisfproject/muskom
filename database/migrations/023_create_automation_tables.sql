CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(255) NOT NULL, -- e.g. "ParticipantApproved"
    provider VARCHAR(100) NOT NULL, -- e.g. "EmailProvider", "WhatsAppProvider"
    action VARCHAR(255) NOT NULL, -- e.g. "SendVerificationEmail"
    config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Custom payload/template mapping
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_event ON automation_rules(event_id, event_type);

CREATE TABLE IF NOT EXISTS integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL,
    provider VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- "SUCCESS", "FAILED", "RETRIED"
    duration_ms INT NOT NULL DEFAULT 0,
    retries INT NOT NULL DEFAULT 0,
    error_message TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integration_logs_status ON integration_logs(status);
CREATE INDEX IF NOT EXISTS idx_integration_logs_event ON integration_logs(event_id);

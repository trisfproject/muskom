-- 066_create_email_logs.sql

CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    last_retry_at TIMESTAMPTZ,
    retry_count INT DEFAULT 0,
    error_message TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_email_logs_registration FOREIGN KEY (registration_id) REFERENCES registrations (id) ON DELETE CASCADE,
    CONSTRAINT fk_email_logs_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_email_logs_registration_id ON email_logs(registration_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

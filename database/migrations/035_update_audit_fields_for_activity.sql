-- Add new fields to audit_logs for enhanced traceability
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS previous_value JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_value JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS correlation_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation_id ON audit_logs (correlation_id);

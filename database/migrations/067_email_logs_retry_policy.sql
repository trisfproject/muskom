-- 067_email_logs_retry_policy.sql

ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS max_retry INT NOT NULL DEFAULT 5;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ NULL;
ALTER TABLE email_logs RENAME COLUMN error_message TO last_error;
ALTER TABLE email_logs ALTER COLUMN retry_count SET NOT NULL;
ALTER TABLE email_logs ALTER COLUMN retry_count SET DEFAULT 0;

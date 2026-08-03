-- 047_candidate_unique_email.sql
-- Adds a partial unique index to prevent duplicate registrations for the same musyawarah using the same email

CREATE UNIQUE INDEX idx_candidates_unique_email ON candidates(musyawarah_id, email) WHERE deleted_at IS NULL;

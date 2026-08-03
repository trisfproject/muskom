-- 045_add_publication_columns.sql
-- Adds publication control and display settings to candidates table

ALTER TABLE candidates
ADD COLUMN candidate_number INT,
ADD COLUMN display_order INT NOT NULL DEFAULT 0,
ADD COLUMN publication_status VARCHAR(50) NOT NULL DEFAULT 'Hidden',
ADD COLUMN published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN show_biography BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN show_vision BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN show_mission BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN show_photo BOOLEAN NOT NULL DEFAULT true;

-- Ensure candidate_number is unique per musyawarah (if provided)
CREATE UNIQUE INDEX idx_candidates_number_musyawarah ON candidates(musyawarah_id, candidate_number) WHERE deleted_at IS NULL AND candidate_number IS NOT NULL;

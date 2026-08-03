-- 044_add_verification_columns.sql

ALTER TABLE candidates
ADD COLUMN verification_notes TEXT;

ALTER TABLE candidate_documents
ADD COLUMN verification_status VARCHAR(50) DEFAULT 'Pending',
ADD COLUMN verification_notes TEXT;

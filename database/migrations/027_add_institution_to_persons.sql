-- Add institution column to persons table
-- This column is referenced in attendance and verification queries.

ALTER TABLE persons ADD COLUMN IF NOT EXISTS institution VARCHAR(255);

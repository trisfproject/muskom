-- Up
ALTER TABLE candidates DROP COLUMN IF EXISTS gender;
ALTER TABLE participants DROP COLUMN IF EXISTS gender;

-- Down
ALTER TABLE candidates ADD COLUMN gender VARCHAR(50);
ALTER TABLE participants ADD COLUMN gender VARCHAR(50);

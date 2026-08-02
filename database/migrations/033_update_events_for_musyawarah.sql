-- 033_update_events_for_musyawarah.sql

ALTER TABLE events
ADD COLUMN IF NOT EXISTS tagline VARCHAR(255),
ADD COLUMN IF NOT EXISTS year INT,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
ADD COLUMN IF NOT EXISTS venue VARCHAR(255),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS province VARCHAR(100),
ADD COLUMN IF NOT EXISTS meeting_type VARCHAR(50) DEFAULT 'OFFLINE';

-- To gracefully migrate existing status without breaking existing code:
-- existing states are DRAFT, UPCOMING, ONGOING, COMPLETED, CANCELLED
-- we map them: UPCOMING, ONGOING, COMPLETED -> PUBLISHED (or we can just leave as is, since the constraint was dropped in 021)
UPDATE events SET status = 'PUBLISHED' WHERE status IN ('UPCOMING', 'ONGOING', 'COMPLETED');
UPDATE events SET status = 'ARCHIVED' WHERE status = 'CANCELLED';

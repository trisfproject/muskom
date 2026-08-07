CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    thumbnail_url VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'Normal',
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    attachments JSONB,
    pinned BOOLEAN NOT NULL DEFAULT false,
    publish_date TIMESTAMP WITH TIME ZONE,
    expire_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_publish_date ON announcements(publish_date);
CREATE INDEX idx_announcements_pinned ON announcements(pinned);

CREATE TABLE IF NOT EXISTS broadcast_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    target_audience VARCHAR(50) NOT NULL,
    channels JSONB NOT NULL, -- e.g., ["Email", "In-App"]
    status VARCHAR(50) NOT NULL DEFAULT 'Queued',
    total_targets INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_broadcast_jobs_status ON broadcast_jobs(status);
CREATE INDEX idx_broadcast_jobs_announcement_id ON broadcast_jobs(announcement_id);

-- Optional: Track read status / clicks for statistics (simplified for RC1 via In-App notifications, 
-- but we might want a simple views table for announcements)
CREATE TABLE IF NOT EXISTS announcement_views (
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Null if public view
    ip_address VARCHAR(45),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_announcement_views_ann_id ON announcement_views(announcement_id);

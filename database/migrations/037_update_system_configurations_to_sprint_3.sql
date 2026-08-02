-- Delete old system configurations that are no longer used
DELETE FROM system_configurations WHERE group_name IN ('website', 'event', 'voting', 'attendance', 'notification', 'security', 'feature_flags');

-- Seed New Configurations for SPRINT-003.0
INSERT INTO system_configurations (group_name, settings)
VALUES
    ('website_identity', '{"community_name": "MUSKOM", "event_name": "Musyawarah Komunitas", "event_year": "2026", "website_title": "MUSKOM — Portal Musyawarah", "website_description": "Portal resmi pengelolaan musyawarah.", "logo_url": "/logo.png", "favicon_url": "/favicon.ico"}'::jsonb),
    ('publication', '{"website_status": "PUBLISHED", "maintenance_mode": false, "public_visibility": true}'::jsonb),
    ('registration', '{"candidate_registration": true, "participant_registration": true, "opening_date": null, "closing_date": null}'::jsonb),
    ('timeline', '{"active_timeline_mode": true, "countdown_source": "TIMELINE_EVENT"}'::jsonb),
    ('contact', '{"email": "admin@muskom.local", "whatsapp": "+6281234567890", "secretariat": "Jl. Musyawarah No. 1, Jakarta", "maps_embed": ""}'::jsonb)
ON CONFLICT (group_name) DO UPDATE SET settings = EXCLUDED.settings;

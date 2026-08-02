-- Remove timeline since we use feature_flags now
DELETE FROM system_configurations WHERE group_name = 'timeline';

-- Add new defaults or updates to existing
INSERT INTO system_configurations (group_name, settings)
VALUES
    ('publication', '{"website_status": "PUBLISHED", "maintenance_mode": false, "public_visibility": true, "offline_message": "Sistem sedang dalam pemeliharaan."}'::jsonb),
    ('registration', '{"candidate_registration": true, "participant_registration": true, "opening_date": null, "closing_date": null, "registration_information": "Silakan mendaftar untuk mengikuti musyawarah."}'::jsonb),
    ('seo', '{"meta_title": "MUSKOM - Portal Resmi", "meta_description": "Portal resmi pengelolaan musyawarah.", "meta_keywords": "musyawarah, komunitas", "opengraph_image": "/logo.png"}'::jsonb),
    ('feature_flags', '{"show_hero": true, "show_countdown": true, "show_timeline": true, "show_candidate": true, "show_information": true, "show_footer": true, "enable_registration": true, "enable_dark_theme": true}'::jsonb)
ON CONFLICT (group_name) DO UPDATE SET settings = EXCLUDED.settings;

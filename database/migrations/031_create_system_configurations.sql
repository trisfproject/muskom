CREATE TABLE IF NOT EXISTS system_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_name VARCHAR(50) UNIQUE NOT NULL,
    settings JSONB NOT NULL DEFAULT '{}',
    updated_by UUID, -- Can be null for system/default updates
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Default Configurations
INSERT INTO system_configurations (group_name, settings)
VALUES
    ('website', '{"site_name": "MUSKOM", "theme": "default", "primary_color": "#2563EB", "default_theme": "system", "maintenance": false, "landing_enabled": true}'::jsonb),
    ('event', '{"active_event_id": null, "timezone": "Asia/Jakarta", "current_election": null, "current_musyawarah": null, "archive_mode": false}'::jsonb),
    ('registration', '{"participant_registration_enabled": true, "candidate_registration_enabled": true, "registration_deadline": null, "max_participants": 500}'::jsonb),
    ('voting', '{"voting_enabled": false, "voting_start": null, "voting_end": null, "realtime_result": false, "public_result": false}'::jsonb),
    ('attendance', '{"attendance_enabled": false, "qr_expiration": 60, "check_in_window": 120}'::jsonb),
    ('notification', '{"telegram_enabled": false, "email_enabled": false, "reminder_enabled": false}'::jsonb),
    ('security', '{"max_login_attempts": 5, "session_timeout_minutes": 1440}'::jsonb),
    ('feature_flags', '{"candidate_module": true, "voting_module": true, "attendance_module": true, "statistics_module": false, "gallery_module": false}'::jsonb)
ON CONFLICT (group_name) DO NOTHING;

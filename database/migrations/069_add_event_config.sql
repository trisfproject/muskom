-- Add event configuration to system_configurations if it doesn't exist

INSERT INTO system_configurations (group_name, settings)
VALUES (
    'event',
    '{"event_name": "Musyawarah KOMITKABE 2026", "event_date": "29 Agustus 2026", "event_time": "08:00 - Selesai WIB", "event_location": "Gedung Serbaguna KOMITKABE"}'::jsonb
)
ON CONFLICT (group_name) DO NOTHING;

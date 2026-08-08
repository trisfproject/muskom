-- 041_musyawarah_seeder.sql

-- Insert a default Musyawarah event to allow the system to operate if none exists
INSERT INTO events (
    name, 
    slug, 
    theme, 
    description, 
    location, 
    address, 
    google_maps_url,
    period_start, 
    period_end, 
    event_date,
    registration_open,
    registration_close,
    candidate_registration_open,
    candidate_registration_close,
    status,
    is_default_active,
    settings,
    created_at,
    updated_at
)
SELECT 
    'MUSKOM',
    'munas-2026',
    'Bersama Membangun Bangsa',
    'Musyawarah Komunitas (MUSKOM) merupakan forum pengambilan keputusan tertinggi.',
    'Gedung Serbaguna',
    'Jl. Jend. Sudirman No. 1, Jakarta',
    'https://maps.google.com/?q=Jakarta',
    '2026-01-01',
    '2026-12-31',
    '2026-10-15',
    '2026-08-01',
    '2026-09-30',
    '2026-07-01',
    '2026-07-31',
    'PUBLISHED',
    true,
    '{}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM events WHERE slug = 'munas-2026'
);

-- Note: In a real environment, we'd also insert associated records like event_settings here.
-- But since it's a foundation seeder, inserting the parent event is sufficient for testing.

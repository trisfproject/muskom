-- ==============================================================================
-- MUSKOM Increment 2: Website CMS Foundation
-- ==============================================================================

-- 1. Website General Settings
CREATE TABLE IF NOT EXISTS website_general_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name VARCHAR(255) NOT NULL DEFAULT 'MUSKOM',
    tagline VARCHAR(255) NOT NULL DEFAULT '',
    theme VARCHAR(100) NOT NULL DEFAULT 'modern-tech',
    primary_color VARCHAR(50) NOT NULL DEFAULT '#2563EB',
    secondary_color VARCHAR(50) NOT NULL DEFAULT '#38BDF8',
    default_light_theme BOOLEAN NOT NULL DEFAULT true,
    default_dark_theme BOOLEAN NOT NULL DEFAULT false,
    registration_enabled BOOLEAN NOT NULL DEFAULT true,
    maintenance_mode BOOLEAN NOT NULL DEFAULT false,
    seo_title VARCHAR(255) NOT NULL DEFAULT 'MUSKOM — Official Event Portal',
    seo_description TEXT NOT NULL DEFAULT 'Portal resmi Musyawarah KOMITKABE. Membangun proses pemilihan yang transparan, profesional, dan dapat dipercaya oleh seluruh anggota komunitas.',
    seo_image_url TEXT NOT NULL DEFAULT '',
    favicon_url TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Website Hero Settings
CREATE TABLE IF NOT EXISTS website_hero_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hero_badge VARCHAR(255) NOT NULL DEFAULT '',
    primary_cta_label VARCHAR(100) NOT NULL DEFAULT '',
    primary_cta_url VARCHAR(255) NOT NULL DEFAULT '',
    primary_cta_enabled BOOLEAN NOT NULL DEFAULT true,
    secondary_cta_label VARCHAR(100) NOT NULL DEFAULT '',
    secondary_cta_url VARCHAR(255) NOT NULL DEFAULT '',
    secondary_cta_enabled BOOLEAN NOT NULL DEFAULT true,
    background_mode VARCHAR(50) NOT NULL DEFAULT 'aurora-blueprint',
    hero_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Website Timeline Phases
CREATE TABLE IF NOT EXISTS website_timeline_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    registration_type VARCHAR(50) NOT NULL DEFAULT 'NONE', -- 'NONE', 'PARTICIPANT', 'CANDIDATE', 'BOTH'
    current_indicator BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    deleted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_timeline_order ON website_timeline_phases (display_order);
CREATE INDEX IF NOT EXISTS idx_website_timeline_dates ON website_timeline_phases (start_date, end_date);

-- 4. Website Announcements
CREATE TABLE IF NOT EXISTS website_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Pengumuman',
    summary TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    thumbnail_url TEXT NOT NULL DEFAULT '',
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_website_announcements_slug UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_website_announcements_pinned ON website_announcements (is_pinned, published_at DESC);

-- 5. Website Candidate Settings
CREATE TABLE IF NOT EXISTS website_candidate_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_title VARCHAR(255) NOT NULL DEFAULT 'Bursa Calon Ketua',
    section_description TEXT NOT NULL DEFAULT 'Mengenal lebih dekat visi dan misi calon pemimpin yang akan membawa perubahan untuk komunitas.',
    registration_status VARCHAR(50) NOT NULL DEFAULT 'PENJARINGAN',
    empty_state_message TEXT NOT NULL DEFAULT 'Calon Ketua Umum akan dipublikasikan setelah proses verifikasi administrasi selesai.',
    publication_message TEXT NOT NULL DEFAULT 'Daftar calon resmi telah ditetapkan.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Website Footer Settings
CREATE TABLE IF NOT EXISTS website_footer_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name VARCHAR(255) NOT NULL DEFAULT 'MUSKOM',
    description TEXT NOT NULL DEFAULT 'Portal resmi Musyawarah KOMITKABE. Membangun proses pemilihan yang transparan, profesional, dan dapat dipercaya oleh seluruh anggota komunitas.',
    copyright VARCHAR(255) NOT NULL DEFAULT '© 2026 MUSKOM. Seluruh hak cipta dilindungi.',
    official_badge VARCHAR(255) NOT NULL DEFAULT 'OFFICIAL PORTAL',
    tagline VARCHAR(255) NOT NULL DEFAULT 'Dibangun untuk kemajuan bersama.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- Initial Seeds for CMS tables
-- ==============================================================================

INSERT INTO website_general_settings (
    id, site_name, tagline, theme, primary_color, secondary_color, 
    default_light_theme, default_dark_theme, registration_enabled, maintenance_mode, 
    seo_title, seo_description, seo_image_url, favicon_url
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'MUSKOM',
    '',
    'modern-tech',
    '#2563EB',
    '#38BDF8',
    true,
    false,
    true,
    false,
    'MUSKOM — Official Event Portal',
    'Portal resmi Musyawarah KOMITKABE. Membangun proses pemilihan yang transparan, profesional, dan dapat dipercaya oleh seluruh anggota komunitas.',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO website_hero_settings (
    id, hero_badge,
    primary_cta_label, primary_cta_url, primary_cta_enabled,
    secondary_cta_label, secondary_cta_url, secondary_cta_enabled,
    background_mode, hero_status, is_published
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '',
    '',
    '',
    true,
    '',
    '',
    true,
    'aurora-blueprint',
    'ACTIVE',
    true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO website_candidate_settings (
    id, section_title, section_description, registration_status, empty_state_message, publication_message
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Bursa Calon Ketua',
    'Mengenal lebih dekat visi dan misi calon pemimpin yang akan membawa perubahan untuk komunitas.',
    'PENJARINGAN',
    'Calon Ketua Umum akan dipublikasikan setelah proses verifikasi administrasi selesai.',
    'Daftar calon resmi telah ditetapkan.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO website_footer_settings (
    id, organization_name, description, copyright, official_badge, tagline
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'MUSKOM',
    'Portal resmi Musyawarah KOMITKABE. Membangun proses pemilihan yang transparan, profesional, dan dapat dipercaya oleh seluruh anggota komunitas.',
    '© 2026 MUSKOM. Seluruh hak cipta dilindungi.',
    'OFFICIAL PORTAL',
    'Dibangun untuk kemajuan bersama.'
) ON CONFLICT (id) DO NOTHING;

-- Initial Timeline Phases matching approved schedule
INSERT INTO website_timeline_phases (id, title, description, start_date, end_date, display_order, registration_type, current_indicator, is_published)
VALUES 
    (gen_random_uuid(), 'Sidang Mandat', 'Verifikasi mandat dan kepesertaan', '2026-07-18 00:00:00+00', '2026-07-18 23:59:59+00', 1, 'NONE', false, true),
    (gen_random_uuid(), 'Penjaringan Aspirasi', 'Pengumpulan aspirasi anggota komunitas', '2026-07-19 00:00:00+00', '2026-07-25 23:59:59+00', 2, 'NONE', false, true),
    (gen_random_uuid(), 'Penjaringan Bakal Calon Ketua Umum', 'Pendaftaran terbuka calon ketua umum', '2026-07-26 00:00:00+00', '2026-08-08 23:59:59+00', 3, 'CANDIDATE', true, true),
    (gen_random_uuid(), 'Verifikasi Administrasi', 'Pemeriksaan berkas dan persyaratan calon', '2026-08-09 00:00:00+00', '2026-08-09 23:59:59+00', 4, 'NONE', false, true),
    (gen_random_uuid(), 'Penetapan Calon Ketua Umum', 'Pengumuman nomor urut dan profil kandidat', '2026-08-12 00:00:00+00', '2026-08-12 23:59:59+00', 5, 'NONE', false, true),
    (gen_random_uuid(), 'Masa Kampanye', 'Pemaparan visi, misi, dan program kerja', '2026-08-13 00:00:00+00', '2026-08-26 23:59:59+00', 6, 'PARTICIPANT', false, true),
    (gen_random_uuid(), 'Masa Tenang', 'Persiapan teknis musyawarah dan pemungutan suara', '2026-08-26 00:00:00+00', '2026-08-28 23:59:59+00', 7, 'NONE', false, true),
    (gen_random_uuid(), 'Musyawarah', 'Pelaksanaan musyawarah dan voting pemilihan', '2026-08-29 00:00:00+00', '2026-08-29 23:59:59+00', 8, 'NONE', false, true);

-- Initial Announcements
INSERT INTO website_announcements (id, title, slug, category, summary, content, is_pinned, is_published, published_at)
VALUES 
    (
        gen_random_uuid(),
        'Pembukaan Penjaringan Bakal Calon Ketua Umum KOMITKABE 2026',
        'pembukaan-penjaringan-bakal-calon-ketua-umum-2026',
        'Tahapan',
        'Pendaftaran Bakal Calon Ketua Umum resmi dibuka mulai 26 Juli hingga 8 Agustus 2026.',
        'Panitia Musyawarah KOMITKABE 2026 mengumumkan dibukanya tahapan penjaringan bakal calon ketua umum. Seluruh anggota yang memenuhi syarat dipersilakan mendaftarkan diri melalui formulir pendaftaran resmi.',
        true,
        true,
        '2026-07-26 08:00:00+00'
    ),
    (
        gen_random_uuid(),
        'Panduan Pendaftaran dan Persyaratan Berkas Peserta',
        'panduan-pendaftaran-dan-persyaratan-berkas-peserta',
        'Panduan',
        'Informasi lengkap mengenai alur verifikasi data dan persyaratan peserta musyawarah.',
        'Berikut adalah panduan lengkap alur pendaftaran peserta dan kelengkapan dokumen yang diperlukan untuk menghadiri musyawarah akbar tahun 2026.',
        false,
        true,
        '2026-07-20 10:00:00+00'
    );

-- ==============================================================================
-- MUSKOM Increment 1: Website Information Pages
-- ==============================================================================

CREATE TABLE IF NOT EXISTS website_information_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_website_information_pages_slug UNIQUE (slug)
);

-- Seeds
INSERT INTO website_information_pages (id, slug, title, content, is_published)
VALUES 
    (gen_random_uuid(), 'tata-tertib-musyawarah', 'Tata Tertib Musyawarah', 'Isi tata tertib musyawarah akan ditampilkan di sini.', true),
    (gen_random_uuid(), 'tata-cara-pemilihan', 'Tata Cara Pemilihan', 'Isi tata cara pemilihan akan ditampilkan di sini.', true),
    (gen_random_uuid(), 'panduan-peserta', 'Panduan Peserta', 'Isi panduan peserta akan ditampilkan di sini.', true),
    (gen_random_uuid(), 'panduan-bakal-calon', 'Panduan Bakal Calon', 'Isi panduan bakal calon akan ditampilkan di sini.', true)
ON CONFLICT (slug) DO NOTHING;

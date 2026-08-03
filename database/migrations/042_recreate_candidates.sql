-- 042_recreate_candidates.sql
-- Drops legacy tables and recreates the candidates table mapped to the events (musyawarah) entity.

DROP TABLE IF EXISTS candidate_applications CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;

CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    musyawarah_id UUID NOT NULL,
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    birth_place VARCHAR(100),
    birth_date DATE,
    occupation VARCHAR(255),
    organization VARCHAR(255),
    address TEXT,
    biography TEXT,
    motivation TEXT,
    vision TEXT,
    mission TEXT,
    profile_photo VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_candidates_musyawarah FOREIGN KEY (musyawarah_id) REFERENCES events(id) ON DELETE RESTRICT
);

-- Ensure a single registration number index exists
CREATE INDEX idx_candidates_musyawarah_id ON candidates(musyawarah_id) WHERE deleted_at IS NULL;



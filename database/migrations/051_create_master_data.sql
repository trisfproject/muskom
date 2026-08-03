-- Migration 051: Create Master Data Tables
-- Sprint 3.2-R8: Master Data Management

-- ─── Industrial Areas ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS master_industrial_areas (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    code        VARCHAR(50),
    city        VARCHAR(100),
    province    VARCHAR(100),
    is_active   BOOLEAN     NOT NULL DEFAULT true,
    sort_order  INT         NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    CONSTRAINT master_industrial_areas_name_unique UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS idx_master_industrial_areas_active ON master_industrial_areas(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_master_industrial_areas_sort   ON master_industrial_areas(sort_order, name);

-- ─── Companies ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS master_companies (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name                 VARCHAR(255) NOT NULL,
    industrial_area_id   UUID        REFERENCES master_industrial_areas(id) ON DELETE SET NULL,
    address              TEXT,
    is_active            BOOLEAN     NOT NULL DEFAULT true,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at           TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_master_companies_area     ON master_companies(industrial_area_id);
CREATE INDEX IF NOT EXISTS idx_master_companies_active   ON master_companies(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_master_companies_name     ON master_companies(name);

-- ─── Job Titles ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS master_job_titles (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    sort_order  INT         NOT NULL DEFAULT 0,
    is_active   BOOLEAN     NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    CONSTRAINT master_job_titles_name_unique UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS idx_master_job_titles_active ON master_job_titles(is_active) WHERE deleted_at IS NULL;

-- ─── Departments ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS master_departments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    is_active   BOOLEAN     NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    CONSTRAINT master_departments_name_unique UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS idx_master_departments_active ON master_departments(is_active) WHERE deleted_at IS NULL;

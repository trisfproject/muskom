-- Migration 052: Seed Master Data
-- Sprint 3.2-R8: Master Data Management
-- Seeds initial data from previously hardcoded values in the application.

-- ─── Industrial Areas ─────────────────────────────────────────────────────────
INSERT INTO master_industrial_areas (name, code, city, province, sort_order) VALUES
    ('Jababeka',       'JBK',  'Cikarang',  'Jawa Barat', 1),
    ('EJIP',           'EJIP', 'Cikarang',  'Jawa Barat', 2),
    ('MM2100',         'MM',   'Cikarang',  'Jawa Barat', 3),
    ('Delta Silicon',  'DS',   'Cikarang',  'Jawa Barat', 4),
    ('GIIC',           'GIIC', 'Cikarang',  'Jawa Barat', 5),
    ('Hyundai',        'HY',   'Cikarang',  'Jawa Barat', 6),
    ('Lippo Cikarang', 'LC',   'Cikarang',  'Jawa Barat', 7),
    ('Bekasi Fajar',   'BF',   'Bekasi',    'Jawa Barat', 8)
ON CONFLICT (name) DO NOTHING;

-- ─── Job Titles ───────────────────────────────────────────────────────────────
INSERT INTO master_job_titles (name, sort_order) VALUES
    ('Direktur Utama',        1),
    ('Direktur',              2),
    ('Komisaris Utama',       3),
    ('Komisaris',             4),
    ('General Manager',       5),
    ('Manager',               6),
    ('Supervisor',            7),
    ('Staff',                 8),
    ('Kepala Bagian',         9),
    ('Kepala Divisi',         10),
    ('HR Manager',            11),
    ('Finance Manager',       12),
    ('Production Manager',    13),
    ('Quality Manager',       14),
    ('Engineering Manager',   15)
ON CONFLICT (name) DO NOTHING;

-- ─── Departments ──────────────────────────────────────────────────────────────
INSERT INTO master_departments (name) VALUES
    ('Human Resources'),
    ('Finance & Accounting'),
    ('Operations'),
    ('Production'),
    ('Quality Assurance'),
    ('Engineering'),
    ('IT'),
    ('Legal'),
    ('Marketing'),
    ('Procurement'),
    ('Logistics'),
    ('Board of Directors'),
    ('General Affairs'),
    ('Research & Development'),
    ('Customer Service')
ON CONFLICT (name) DO NOTHING;

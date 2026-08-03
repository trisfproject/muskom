-- Up
ALTER TABLE candidates DROP COLUMN IF EXISTS birth_place;
ALTER TABLE candidates DROP COLUMN IF EXISTS birth_date;
ALTER TABLE candidates DROP COLUMN IF EXISTS occupation;
ALTER TABLE candidates DROP COLUMN IF EXISTS organization;
ALTER TABLE candidates DROP COLUMN IF EXISTS address;

ALTER TABLE candidates ADD COLUMN company_name VARCHAR(255);
ALTER TABLE candidates ADD COLUMN industrial_area VARCHAR(255);
ALTER TABLE candidates ADD COLUMN job_title VARCHAR(255);
ALTER TABLE candidates ADD COLUMN department VARCHAR(255);

-- Down
ALTER TABLE candidates ADD COLUMN birth_place VARCHAR(100);
ALTER TABLE candidates ADD COLUMN birth_date DATE;
ALTER TABLE candidates ADD COLUMN occupation VARCHAR(255);
ALTER TABLE candidates ADD COLUMN organization VARCHAR(255);
ALTER TABLE candidates ADD COLUMN address TEXT;

ALTER TABLE candidates DROP COLUMN IF EXISTS company_name;
ALTER TABLE candidates DROP COLUMN IF EXISTS industrial_area;
ALTER TABLE candidates DROP COLUMN IF EXISTS job_title;
ALTER TABLE candidates DROP COLUMN IF EXISTS department;

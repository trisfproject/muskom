-- Migration to update participants schema for Sprint 3.2

ALTER TABLE participants
ADD COLUMN nickname VARCHAR(255),
ADD COLUMN gender VARCHAR(50),
ADD COLUMN company_name VARCHAR(255),
ADD COLUMN industrial_area VARCHAR(255),
ADD COLUMN job_title VARCHAR(255),
ADD COLUMN department VARCHAR(255);

ALTER TABLE participants
DROP COLUMN organization,
DROP COLUMN position,
DROP COLUMN membership_number,
DROP COLUMN province,
DROP COLUMN city;

-- Enable pgcrypto extension to provide cryptographic functions.
-- This is required to generate UUID v4 natively using the gen_random_uuid() function,
-- which is used as the default value for primary keys across all tables in the MUSKOM database.
-- Using IF NOT EXISTS ensures this migration is idempotent and safe to execute multiple times.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- MUSKOM RC2 Default Administrator Seeder
-- ==============================================================================

-- Create the default admin user using pgcrypto for password hashing
-- Password is 'Admin123!'

INSERT INTO users (id, name, email, password_hash, role, status)
VALUES (
    gen_random_uuid(),
    'System Administrator',
    'admin@muskom.local',
    crypt('Admin123!', gen_salt('bf')),
    'ADMIN',
    'ACTIVE'
)
ON CONFLICT (email) DO NOTHING;

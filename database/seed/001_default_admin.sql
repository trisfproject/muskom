-- ==============================================================================
-- MUSKOM RC2 Default Administrator Seeder
-- ==============================================================================

-- Create the default admin user using pgcrypto for password hashing
-- Password is 'Admin123!'

DO $$
DECLARE
    v_person_id uuid;
    v_role_id uuid;
BEGIN
    -- Get ADMIN role ID
    SELECT id INTO v_role_id FROM roles WHERE code = 'ADMIN';

    -- Create Person
    INSERT INTO persons (id, full_name, email)
    VALUES (gen_random_uuid(), 'System Administrator', 'admin@muskom.local')
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO v_person_id FROM persons WHERE email = 'admin@muskom.local';

    -- Create User
    INSERT INTO users (id, person_id, role_id, username, password_hash, is_active)
    VALUES (
        gen_random_uuid(),
        v_person_id,
        v_role_id,
        'admin@muskom.local',
        crypt('Admin123!', gen_salt('bf')),
        true
    )
    ON CONFLICT (username) DO NOTHING;
END $$;

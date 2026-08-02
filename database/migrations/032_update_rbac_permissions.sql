-- 032_update_rbac_permissions.sql
-- Seed granular permissions

INSERT INTO permissions (id, code, module, description) VALUES
    (gen_random_uuid(), 'website.read', 'website', 'Can read website configurations'),
    (gen_random_uuid(), 'website.write', 'website', 'Can manage website configurations'),
    (gen_random_uuid(), 'timeline.read', 'timeline', 'Can read timeline events'),
    (gen_random_uuid(), 'timeline.write', 'timeline', 'Can manage timeline events'),
    (gen_random_uuid(), 'announcement.read', 'announcement', 'Can read announcements'),
    (gen_random_uuid(), 'announcement.write', 'announcement', 'Can manage announcements'),
    (gen_random_uuid(), 'registration.read', 'registration', 'Can read registrations'),
    (gen_random_uuid(), 'registration.verify', 'registration', 'Can verify registrations'),
    (gen_random_uuid(), 'candidate.read', 'candidate', 'Can read candidates'),
    (gen_random_uuid(), 'candidate.verify', 'candidate', 'Can verify candidates'),
    (gen_random_uuid(), 'attendance.manage', 'attendance', 'Can manage attendance records'),
    (gen_random_uuid(), 'voting.manage', 'voting', 'Can manage voting events'),
    (gen_random_uuid(), 'system.manage', 'system', 'Can manage system configurations and users')
ON CONFLICT (code) DO NOTHING;

-- Map Permissions to Roles
DO $$
DECLARE
    r_super_admin UUID;
    r_admin UUID;
    r_committee UUID;
    r_verifier UUID;
    r_operator UUID;
    r_viewer UUID;
BEGIN
    SELECT id INTO r_super_admin FROM roles WHERE code = 'SUPER_ADMIN';
    SELECT id INTO r_admin FROM roles WHERE code = 'ADMIN';
    SELECT id INTO r_committee FROM roles WHERE code = 'COMMITTEE';
    SELECT id INTO r_verifier FROM roles WHERE code = 'VERIFIER';
    SELECT id INTO r_operator FROM roles WHERE code = 'OPERATOR';
    SELECT id INTO r_viewer FROM roles WHERE code = 'VIEWER';

    -- SUPER_ADMIN gets everything
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_super_admin, id FROM permissions
    ON CONFLICT DO NOTHING;

    -- ADMIN gets everything except system manage
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_admin, id FROM permissions WHERE code != 'system.manage'
    ON CONFLICT DO NOTHING;

    -- COMMITTEE gets specific management things
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_committee, id FROM permissions WHERE code IN (
        'website.read', 'website.write', 'timeline.read', 'timeline.write', 'announcement.read', 'announcement.write'
    )
    ON CONFLICT DO NOTHING;

    -- VERIFIER gets approval rights
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_verifier, id FROM permissions WHERE code IN (
        'registration.read', 'registration.verify', 'candidate.read', 'candidate.verify'
    )
    ON CONFLICT DO NOTHING;

    -- OPERATOR gets frontline tasks
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_operator, id FROM permissions WHERE code IN (
        'registration.read', 'candidate.read', 'attendance.manage', 'voting.manage'
    )
    ON CONFLICT DO NOTHING;

    -- VIEWER gets read-only
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_viewer, id FROM permissions WHERE code IN (
        'website.read', 'timeline.read', 'announcement.read', 'registration.read', 'candidate.read'
    )
    ON CONFLICT DO NOTHING;
END $$;

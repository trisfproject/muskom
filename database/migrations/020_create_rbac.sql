CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_permissions_code UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Seed Permissions
INSERT INTO permissions (id, code, module, description) VALUES
    (gen_random_uuid(), 'attendance.checkin', 'attendance', 'Can check in participants'),
    (gen_random_uuid(), 'attendance.undo', 'attendance', 'Can undo a check in'),
    (gen_random_uuid(), 'attendance.view', 'attendance', 'Can view attendance records'),
    (gen_random_uuid(), 'voting.start', 'voting', 'Can start a voting session'),
    (gen_random_uuid(), 'voting.stop', 'voting', 'Can stop a voting session'),
    (gen_random_uuid(), 'voting.cast', 'voting', 'Can cast a vote on behalf of a participant (operator mode)'),
    (gen_random_uuid(), 'voting.view', 'voting', 'Can view voting stats and results'),
    (gen_random_uuid(), 'participant.approve', 'registration', 'Can approve participants'),
    (gen_random_uuid(), 'candidate.approve', 'candidate', 'Can approve candidates'),
    (gen_random_uuid(), 'audit.view', 'audit', 'Can view global audit logs'),
    (gen_random_uuid(), 'report.export', 'reporting', 'Can export reports'),
    (gen_random_uuid(), 'notification.send', 'notification', 'Can send notifications')
ON CONFLICT (code) DO NOTHING;

-- Map Permissions to Roles
-- 1. Get Role IDs
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

    -- Note: If roles don't exist yet (they should via 001_create_roles), this will just silently do nothing for that role.
    -- SUPER_ADMIN gets everything
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_super_admin, id FROM permissions
    ON CONFLICT DO NOTHING;

    -- ADMIN gets everything except audit view maybe, but let's give them everything for now
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_admin, id FROM permissions
    ON CONFLICT DO NOTHING;

    -- COMMITTEE gets specific management things
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_committee, id FROM permissions WHERE code IN (
        'attendance.view', 'attendance.undo', 'voting.start', 'voting.stop', 'voting.view', 'audit.view', 'report.export', 'notification.send'
    )
    ON CONFLICT DO NOTHING;

    -- VERIFIER gets approval rights
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_verifier, id FROM permissions WHERE code IN (
        'participant.approve', 'candidate.approve'
    )
    ON CONFLICT DO NOTHING;

    -- OPERATOR gets frontline tasks
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_operator, id FROM permissions WHERE code IN (
        'attendance.checkin', 'attendance.view', 'voting.cast'
    )
    ON CONFLICT DO NOTHING;

    -- VIEWER gets read-only
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_viewer, id FROM permissions WHERE code IN (
        'attendance.view', 'voting.view'
    )
    ON CONFLICT DO NOTHING;
END $$;

-- Seed: voting.reopen permission (Super Admin only)
-- This is an idempotent data insert for the controlled session reopen feature.
-- No DDL changes. Run once before deployment.

INSERT INTO permissions (id, code, module, description)
VALUES (gen_random_uuid(), 'voting.reopen', 'voting', 'Can reopen a closed voting session')
ON CONFLICT (code) DO NOTHING;

-- Assign to Super Admin role only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Super Admin' AND p.code = 'voting.reopen'
ON CONFLICT DO NOTHING;

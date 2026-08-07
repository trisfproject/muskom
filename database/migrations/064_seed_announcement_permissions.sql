INSERT INTO permissions (id, code, module, description) VALUES
    (gen_random_uuid(), 'announcement.view', 'announcement', 'View announcements admin interface'),
    (gen_random_uuid(), 'announcement.create', 'announcement', 'Create and edit announcements'),
    (gen_random_uuid(), 'announcement.publish', 'announcement', 'Publish or archive announcements'),
    (gen_random_uuid(), 'announcement.delete', 'announcement', 'Delete announcements'),
    (gen_random_uuid(), 'broadcast.send', 'announcement', 'Send broadcasts')
ON CONFLICT (code) DO NOTHING;

-- Grant to SUPER_ADMIN role (assuming SUPER_ADMIN is always there)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'SUPER_ADMIN' 
  AND p.code IN ('announcement.view', 'announcement.create', 'announcement.publish', 'announcement.delete', 'broadcast.send')
ON CONFLICT DO NOTHING;

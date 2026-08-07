-- Create in_app_notifications table
CREATE TABLE IF NOT EXISTS in_app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- INFO, SUCCESS, WARNING, ERROR, SYSTEM
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, CRITICAL
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying user notifications efficiently
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_id ON in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_is_read ON in_app_notifications(is_read);

-- Insert new permissions for notification management
INSERT INTO permissions (id, code, module, description)
VALUES 
    (gen_random_uuid(), 'notification.view', 'notification', 'Allow user to view in-app notifications'),
    (gen_random_uuid(), 'notification.manage', 'notification', 'Allow user to manage in-app notifications')
ON CONFLICT (code) DO NOTHING;

-- Map permissions to roles
DO $$
DECLARE
    super_admin_id UUID;
    admin_id UUID;
    perm_view UUID;
    perm_manage UUID;
BEGIN
    SELECT id INTO super_admin_id FROM roles WHERE code = 'SUPER_ADMIN';
    SELECT id INTO admin_id FROM roles WHERE code = 'ADMIN';

    SELECT id INTO perm_view FROM permissions WHERE code = 'notification.view';
    SELECT id INTO perm_manage FROM permissions WHERE code = 'notification.manage';

    -- Super Admin
    IF super_admin_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id) VALUES (super_admin_id, perm_view) ON CONFLICT DO NOTHING;
        INSERT INTO role_permissions (role_id, permission_id) VALUES (super_admin_id, perm_manage) ON CONFLICT DO NOTHING;
    END IF;

    -- Admin
    IF admin_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id) VALUES (admin_id, perm_view) ON CONFLICT DO NOTHING;
        INSERT INTO role_permissions (role_id, permission_id) VALUES (admin_id, perm_manage) ON CONFLICT DO NOTHING;
    END IF;
END $$;

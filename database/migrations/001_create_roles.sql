CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_roles_code UNIQUE (code)
);

INSERT INTO roles (code, name, description) VALUES
    ('SUPER_ADMIN', 'Super Admin', 'Full system access'),
    ('ADMIN', 'Admin', 'Administrative access'),
    ('COMMITTEE', 'Committee', 'Event management access'),
    ('VERIFIER', 'Verifier', 'Participant and Candidate verification'),
    ('OPERATOR', 'Operator', 'Frontline operations access'),
    ('VIEWER', 'Viewer', 'Read-only access')
ON CONFLICT (code) DO NOTHING;

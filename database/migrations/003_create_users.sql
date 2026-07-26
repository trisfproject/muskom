CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL,
    role_id UUID NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    
    -- Foreign key constraints with ON DELETE RESTRICT policy
    CONSTRAINT fk_users_persons FOREIGN KEY (person_id) REFERENCES persons (id) ON DELETE RESTRICT,
    CONSTRAINT fk_users_roles FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
);

-- Indexes for foreign keys and frequently queried columns
CREATE INDEX IF NOT EXISTS idx_users_person_id ON users (person_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users (role_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);

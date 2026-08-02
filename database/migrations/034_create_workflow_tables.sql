CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS workflow_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g., 'DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'APPROVED'
    type VARCHAR(50) NOT NULL DEFAULT 'INTERMEDIATE', -- 'INITIAL', 'INTERMEDIATE', 'FINAL'
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_workflow_states_workflow FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    from_state_id UUID NOT NULL,
    to_state_id UUID NOT NULL,
    required_permission VARCHAR(100),
    required_role VARCHAR(100),
    automatic_action VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_workflow_transitions_workflow FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE CASCADE,
    CONSTRAINT fk_workflow_transitions_from_state FOREIGN KEY (from_state_id) REFERENCES workflow_states (id) ON DELETE CASCADE,
    CONSTRAINT fk_workflow_transitions_to_state FOREIGN KEY (to_state_id) REFERENCES workflow_states (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'registration', 'candidate', 'announcement'
    entity_id UUID NOT NULL,
    current_state_id UUID NOT NULL,
    assigned_to_user_id UUID,
    assigned_to_role_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_workflow_instances_workflow FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE CASCADE,
    CONSTRAINT fk_workflow_instances_current_state FOREIGN KEY (current_state_id) REFERENCES workflow_states (id) ON DELETE RESTRICT,
    CONSTRAINT fk_workflow_instances_assigned_user FOREIGN KEY (assigned_to_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_workflow_instances_assigned_role FOREIGN KEY (assigned_to_role_id) REFERENCES roles (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS workflow_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID NOT NULL,
    from_state_id UUID,
    to_state_id UUID NOT NULL,
    actor_id UUID, -- user who triggered it, NULL if automatic
    reason TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_workflow_history_instance FOREIGN KEY (instance_id) REFERENCES workflow_instances (id) ON DELETE CASCADE,
    CONSTRAINT fk_workflow_history_from_state FOREIGN KEY (from_state_id) REFERENCES workflow_states (id) ON DELETE SET NULL,
    CONSTRAINT fk_workflow_history_to_state FOREIGN KEY (to_state_id) REFERENCES workflow_states (id) ON DELETE SET NULL,
    CONSTRAINT fk_workflow_history_actor FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_workflow_states_workflow_id ON workflow_states (workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_workflow_id ON workflow_transitions (workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_entity ON workflow_instances (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_history_instance_id ON workflow_history (instance_id);

-- Optional: Initial Seed for Registration Workflow to prove it works
INSERT INTO workflows (id, name, description) VALUES
    ('00000000-0000-4000-8000-000000000001', 'Registration Approval', 'Workflow for approving participant registrations')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workflow_states (id, workflow_id, name, type) VALUES
    ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'SUBMITTED', 'INITIAL'),
    ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'PENDING_REVIEW', 'INTERMEDIATE'),
    ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'APPROVED', 'FINAL'),
    ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'REJECTED', 'FINAL')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, required_permission) VALUES
    ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', NULL), -- Automatic transition maybe?
    ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', 'registration.approve'),
    ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000004', 'registration.reject');

package workflow

import "time"

type Workflow struct {
	ID          string     `db:"id"`
	Name        string     `db:"name"`
	Description *string    `db:"description"`
	CreatedAt   time.Time  `db:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at"`
	DeletedAt   *time.Time `db:"deleted_at"`
}

type WorkflowState struct {
	ID          string    `db:"id"`
	WorkflowID  string    `db:"workflow_id"`
	Name        string    `db:"name"`
	Type        string    `db:"type"`
	Description *string   `db:"description"`
	CreatedAt   time.Time `db:"created_at"`
}

type WorkflowTransition struct {
	ID                 string    `db:"id"`
	WorkflowID         string    `db:"workflow_id"`
	FromStateID        string    `db:"from_state_id"`
	ToStateID          string    `db:"to_state_id"`
	RequiredPermission *string   `db:"required_permission"`
	RequiredRole       *string   `db:"required_role"`
	AutomaticAction    *string   `db:"automatic_action"`
	CreatedAt          time.Time `db:"created_at"`
}

type WorkflowInstance struct {
	ID               string     `db:"id"`
	WorkflowID       string     `db:"workflow_id"`
	EntityType       string     `db:"entity_type"`
	EntityID         string     `db:"entity_id"`
	CurrentStateID   string     `db:"current_state_id"`
	AssignedToUserID *string    `db:"assigned_to_user_id"`
	AssignedToRoleID *string    `db:"assigned_to_role_id"`
	CreatedAt        time.Time  `db:"created_at"`
	UpdatedAt        time.Time  `db:"updated_at"`
	DeletedAt        *time.Time `db:"deleted_at"`
}

type WorkflowHistory struct {
	ID          string    `db:"id"`
	InstanceID  string    `db:"instance_id"`
	FromStateID *string   `db:"from_state_id"`
	ToStateID   string    `db:"to_state_id"`
	ActorID     *string   `db:"actor_id"`
	Reason      *string   `db:"reason"`
	IPAddress   *string   `db:"ip_address"`
	CreatedAt   time.Time `db:"created_at"`
}

package workflow

import "time"

type TransitionRequest struct {
	InstanceID string  `json:"instance_id" validate:"required"`
	ToStateID  string  `json:"to_state_id" validate:"required"`
	Reason     *string `json:"reason" validate:"omitempty"`
}

type WorkflowStateDTO struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Type        string  `json:"type"`
	Description *string `json:"description"`
}

type WorkflowInstanceDTO struct {
	ID               string           `json:"id"`
	WorkflowID       string           `json:"workflow_id"`
	EntityType       string           `json:"entity_type"`
	EntityID         string           `json:"entity_id"`
	CurrentState     WorkflowStateDTO `json:"current_state"`
	AssignedToUserID *string          `json:"assigned_to_user_id"`
	AssignedToRoleID *string          `json:"assigned_to_role_id"`
	UpdatedAt        time.Time        `json:"updated_at"`
}

type WorkflowHistoryDTO struct {
	ID        string    `json:"id"`
	FromState string    `json:"from_state"`
	ToState   string    `json:"to_state"`
	ActorID   *string   `json:"actor_id"`
	Reason    *string   `json:"reason"`
	CreatedAt time.Time `json:"created_at"`
}

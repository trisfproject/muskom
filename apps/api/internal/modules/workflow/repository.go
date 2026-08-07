package workflow

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
)

var (
	ErrWorkflowNotFound     = errors.New("workflow not found")
	ErrStateNotFound        = errors.New("state not found")
	ErrTransitionNotAllowed = errors.New("transition not allowed")
)

type Repository interface {
	GetWorkflowByID(ctx context.Context, id string) (*Workflow, error)
	GetWorkflowByName(ctx context.Context, name string) (*Workflow, error)
	GetInitialState(ctx context.Context, workflowID string) (*WorkflowState, error)
	GetState(ctx context.Context, stateID string) (*WorkflowState, error)
	GetTransition(ctx context.Context, fromStateID, toStateID string) (*WorkflowTransition, error)
	CreateInstance(ctx context.Context, instance *WorkflowInstance) error
	GetInstance(ctx context.Context, instanceID string) (*WorkflowInstance, error)
	GetInstanceByEntity(ctx context.Context, entityType, entityID string) (*WorkflowInstance, error)
	UpdateInstanceAndRecordHistory(ctx context.Context, instance *WorkflowInstance, history *WorkflowHistory) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetWorkflowByID(ctx context.Context, id string) (*Workflow, error) {
	var w Workflow
	err := r.db.GetContext(ctx, &w, "SELECT id, name, description, created_at, updated_at, deleted_at FROM workflows WHERE id = $1 AND deleted_at IS NULL", id)
	if err == sql.ErrNoRows {
		return nil, ErrWorkflowNotFound
	}
	return &w, err
}

func (r *repository) GetWorkflowByName(ctx context.Context, name string) (*Workflow, error) {
	var w Workflow
	err := r.db.GetContext(ctx, &w, "SELECT id, name, description, created_at, updated_at, deleted_at FROM workflows WHERE name = $1 AND deleted_at IS NULL", name)
	if err == sql.ErrNoRows {
		return nil, ErrWorkflowNotFound
	}
	return &w, err
}

func (r *repository) GetInitialState(ctx context.Context, workflowID string) (*WorkflowState, error) {
	var s WorkflowState
	err := r.db.GetContext(ctx, &s, "SELECT id, workflow_id, name, type, description, created_at FROM workflow_states WHERE workflow_id = $1 AND type = 'INITIAL' LIMIT 1", workflowID)
	if err == sql.ErrNoRows {
		return nil, ErrStateNotFound
	}
	return &s, err
}

func (r *repository) GetState(ctx context.Context, stateID string) (*WorkflowState, error) {
	var s WorkflowState
	err := r.db.GetContext(ctx, &s, "SELECT id, workflow_id, name, type, description, created_at FROM workflow_states WHERE id = $1", stateID)
	if err == sql.ErrNoRows {
		return nil, ErrStateNotFound
	}
	return &s, err
}

func (r *repository) GetTransition(ctx context.Context, fromStateID, toStateID string) (*WorkflowTransition, error) {
	var t WorkflowTransition
	err := r.db.GetContext(ctx, &t, "SELECT id, workflow_id, from_state_id, to_state_id, required_permission, required_role, automatic_action, created_at FROM workflow_transitions WHERE from_state_id = $1 AND to_state_id = $2", fromStateID, toStateID)
	if err == sql.ErrNoRows {
		return nil, ErrTransitionNotAllowed
	}
	return &t, err
}

func (r *repository) CreateInstance(ctx context.Context, instance *WorkflowInstance) error {
	query := `
		INSERT INTO workflow_instances (workflow_id, entity_type, entity_id, current_state_id, assigned_to_user_id, assigned_to_role_id)
		VALUES (:workflow_id, :entity_type, :entity_id, :current_state_id, :assigned_to_user_id, :assigned_to_role_id)
		RETURNING id, created_at, updated_at
	`
	rows, err := r.db.NamedQueryContext(ctx, query, instance)
	if err != nil {
		return err
	}
	defer rows.Close()
	if rows.Next() {
		return rows.StructScan(instance)
	}
	return errors.New("failed to retrieve created instance id")
}

func (r *repository) GetInstance(ctx context.Context, instanceID string) (*WorkflowInstance, error) {
	var i WorkflowInstance
	err := r.db.GetContext(ctx, &i, "SELECT id, workflow_id, entity_type, entity_id, current_state_id, assigned_to_user_id, assigned_to_role_id, created_at, updated_at, deleted_at FROM workflow_instances WHERE id = $1 AND deleted_at IS NULL", instanceID)
	return &i, err
}

func (r *repository) GetInstanceByEntity(ctx context.Context, entityType, entityID string) (*WorkflowInstance, error) {
	var i WorkflowInstance
	err := r.db.GetContext(ctx, &i, "SELECT id, workflow_id, entity_type, entity_id, current_state_id, assigned_to_user_id, assigned_to_role_id, created_at, updated_at, deleted_at FROM workflow_instances WHERE entity_type = $1 AND entity_id = $2 AND deleted_at IS NULL", entityType, entityID)
	return &i, err
}

func (r *repository) UpdateInstanceAndRecordHistory(ctx context.Context, instance *WorkflowInstance, history *WorkflowHistory) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Update instance
	updateQuery := `
		UPDATE workflow_instances 
		SET current_state_id = :current_state_id, assigned_to_user_id = :assigned_to_user_id, assigned_to_role_id = :assigned_to_role_id, updated_at = NOW() 
		WHERE id = :id
	`
	_, err = tx.NamedExecContext(ctx, updateQuery, instance)
	if err != nil {
		return err
	}

	// Insert history
	historyQuery := `
		INSERT INTO workflow_history (instance_id, from_state_id, to_state_id, actor_id, reason, ip_address)
		VALUES (:instance_id, :from_state_id, :to_state_id, :actor_id, :reason, :ip_address)
	`
	_, err = tx.NamedExecContext(ctx, historyQuery, history)
	if err != nil {
		return err
	}

	return tx.Commit()
}

package workflow

import (
	"context"
	"errors"

	"github.com/trisfproject/muskom/apps/api/internal/modules/rbac"
	"go.uber.org/zap"
)

var (
	ErrUnauthorized = errors.New("unauthorized to perform this transition")
)

type Service interface {
	StartWorkflow(ctx context.Context, workflowName, entityType, entityID string) (*WorkflowInstance, error)
	TransitionState(ctx context.Context, instanceID, toStateID, actorID, actorRole string, reason *string) (*WorkflowInstance, error)
	GetInstance(ctx context.Context, instanceID string) (*WorkflowInstanceDTO, error)
	GetInstanceByEntity(ctx context.Context, entityType, entityID string) (*WorkflowInstanceDTO, error)
}

type service struct {
	repo    Repository
	authSvc rbac.AuthorizationService
	log     *zap.Logger
}

func NewService(repo Repository, authSvc rbac.AuthorizationService, log *zap.Logger) Service {
	return &service{repo: repo, authSvc: authSvc, log: log}
}

func (s *service) StartWorkflow(ctx context.Context, workflowName, entityType, entityID string) (*WorkflowInstance, error) {
	wf, err := s.repo.GetWorkflowByName(ctx, workflowName)
	if err != nil {
		return nil, err
	}

	initialState, err := s.repo.GetInitialState(ctx, wf.ID)
	if err != nil {
		return nil, err
	}

	instance := &WorkflowInstance{
		WorkflowID:     wf.ID,
		EntityType:     entityType,
		EntityID:       entityID,
		CurrentStateID: initialState.ID,
	}

	err = s.repo.CreateInstance(ctx, instance)
	if err != nil {
		return nil, err
	}

	// Create initial history entry
	history := &WorkflowHistory{
		InstanceID:  instance.ID,
		FromStateID: nil,
		ToStateID:   initialState.ID,
		ActorID:     nil, // System triggered
	}

	err = s.repo.UpdateInstanceAndRecordHistory(ctx, instance, history)
	return instance, err
}

func (s *service) TransitionState(ctx context.Context, instanceID, toStateID, actorID, actorRole string, reason *string) (*WorkflowInstance, error) {
	instance, err := s.repo.GetInstance(ctx, instanceID)
	if err != nil {
		return nil, err
	}

	// Fetch transition rules
	transition, err := s.repo.GetTransition(ctx, instance.CurrentStateID, toStateID)
	if err != nil {
		s.log.Warn("Invalid transition attempted", zap.String("instance", instanceID), zap.String("toState", toStateID))
		return nil, err
	}

	// Validate Permission
	if transition.RequiredPermission != nil && *transition.RequiredPermission != "" {
		if !s.authSvc.HasPermission(actorRole, *transition.RequiredPermission) {
			s.log.Warn("Unauthorized transition attempt (Permission)", zap.String("actor", actorID), zap.String("reqPerm", *transition.RequiredPermission))
			return nil, ErrUnauthorized
		}
	}

	// Validate Role
	if transition.RequiredRole != nil && *transition.RequiredRole != "" {
		if actorRole != *transition.RequiredRole {
			s.log.Warn("Unauthorized transition attempt (Role)", zap.String("actor", actorID), zap.String("reqRole", *transition.RequiredRole))
			return nil, ErrUnauthorized
		}
	}

	fromStateID := instance.CurrentStateID
	instance.CurrentStateID = toStateID

	history := &WorkflowHistory{
		InstanceID:  instance.ID,
		FromStateID: &fromStateID,
		ToStateID:   toStateID,
		ActorID:     &actorID,
		Reason:      reason,
	}

	err = s.repo.UpdateInstanceAndRecordHistory(ctx, instance, history)
	if err != nil {
		return nil, err
	}

	// TODO: Trigger EventBus for automatic_action if present (e.g. notify_committee, generate_certificate)

	return instance, nil
}

func (s *service) GetInstance(ctx context.Context, instanceID string) (*WorkflowInstanceDTO, error) {
	instance, err := s.repo.GetInstance(ctx, instanceID)
	if err != nil {
		return nil, err
	}
	return s.mapInstanceToDTO(ctx, instance)
}

func (s *service) GetInstanceByEntity(ctx context.Context, entityType, entityID string) (*WorkflowInstanceDTO, error) {
	instance, err := s.repo.GetInstanceByEntity(ctx, entityType, entityID)
	if err != nil {
		return nil, err
	}
	return s.mapInstanceToDTO(ctx, instance)
}

func (s *service) mapInstanceToDTO(ctx context.Context, instance *WorkflowInstance) (*WorkflowInstanceDTO, error) {
	state, err := s.repo.GetState(ctx, instance.CurrentStateID)
	if err != nil {
		return nil, err
	}

	dto := &WorkflowInstanceDTO{
		ID:               instance.ID,
		WorkflowID:       instance.WorkflowID,
		EntityType:       instance.EntityType,
		EntityID:         instance.EntityID,
		AssignedToUserID: instance.AssignedToUserID,
		AssignedToRoleID: instance.AssignedToRoleID,
		UpdatedAt:        instance.UpdatedAt,
		CurrentState: WorkflowStateDTO{
			ID:          state.ID,
			Name:        state.Name,
			Type:        state.Type,
			Description: state.Description,
		},
	}
	return dto, nil
}

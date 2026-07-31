package audit

import (
	"context"
	"errors"
)

type service struct {
	repo AuditRepository
}

func NewService(repo AuditRepository) AuditService {
	return &service{repo: repo}
}

// In RC2, we only allow access if operator is authenticated. Real authorization checks (e.g. Super Admin)
// would typically be done via RBAC middleware, so we assume `operatorID` implies authorization passed,
// but we keep it in the interface for future fine-grained audit rules if necessary.

func (s *service) Search(ctx context.Context, filter AuditFilter, operatorID string) ([]AuditEntry, int, error) {
	if operatorID == "" {
		return nil, 0, errors.New("unauthorized: missing operator identity")
	}
	return s.repo.Search(ctx, filter)
}

func (s *service) GetByID(ctx context.Context, id string, operatorID string) (*AuditEntry, error) {
	if operatorID == "" {
		return nil, errors.New("unauthorized: missing operator identity")
	}
	return s.repo.GetByID(ctx, id)
}

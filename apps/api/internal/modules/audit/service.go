package audit

import (
	"context"
	"errors"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type service struct {
	repo AuditRepository
	log  *zap.Logger
}

func NewService(repo AuditRepository, log *zap.Logger) AuditService {
	return &service{repo: repo, log: log}
}

func (s *service) LogActivityAsync(ctx context.Context, entry AuditEntry) {
	// Execute in a background goroutine so it doesn't block
	go func(auditEntry AuditEntry) {
		bgCtx := context.Background()
		err := s.repo.Insert(bgCtx, auditEntry)
		if err != nil {
			if s.log != nil {
				s.log.Error("Failed to write audit log", zap.Error(err), zap.String("module", string(auditEntry.Module)), zap.String("action", string(auditEntry.Action)))
			}
		}
	}(entry)
}

func (s *service) LogActivityTx(ctx context.Context, tx *sqlx.Tx, entry AuditEntry) error {
	err := s.repo.InsertTx(ctx, tx, entry)
	if err != nil {
		if s.log != nil {
			s.log.Error("Failed to write audit log in transaction", zap.Error(err), zap.String("module", string(entry.Module)), zap.String("action", string(entry.Action)))
		}
		return err
	}
	return nil
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

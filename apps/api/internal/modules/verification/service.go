package verification

import (
	"context"

	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

type Service interface {
	ListVerifications(ctx context.Context, filter VerificationListRequest) ([]VerificationItemResponse, int, error)
	GetSummary(ctx context.Context) (*VerificationSummaryResponse, error)
}

type service struct {
	repo      Repository
	log       *zap.Logger
	validator *validator.Validator
}

func NewService(repo Repository, log *zap.Logger, val *validator.Validator) Service {
	return &service{
		repo:      repo,
		log:       log,
		validator: val,
	}
}

type ValidationError struct {
	Details []response.ErrorDetail
}

func (e *ValidationError) Error() string {
	if len(e.Details) > 0 {
		return "validation failed: " + e.Details[0].Message
	}
	return "validation failed"
}

func (s *service) ListVerifications(ctx context.Context, filter VerificationListRequest) ([]VerificationItemResponse, int, error) {
	if errs := s.validator.ValidateStruct(&filter); len(errs) > 0 {
		return nil, 0, &ValidationError{Details: errs}
	}
	return s.repo.GetVerifications(ctx, filter)
}

func (s *service) GetSummary(ctx context.Context) (*VerificationSummaryResponse, error) {
	return s.repo.GetVerificationSummary(ctx)
}

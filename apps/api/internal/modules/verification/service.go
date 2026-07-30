package verification

import (
	"context"
	"errors"

	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

type Service interface {
	ListVerifications(ctx context.Context, filter VerificationListRequest) ([]VerificationItemResponse, int, error)
	GetSummary(ctx context.Context) (*VerificationSummaryResponse, error)
	GetParticipantVerification(ctx context.Context, id string) (*ParticipantDetailResponse, error)
	VerifyParticipant(ctx context.Context, id string, req *VerifyParticipantRequest, verifierID string) error
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

func (s *service) GetParticipantVerification(ctx context.Context, id string) (*ParticipantDetailResponse, error) {
	return s.repo.GetParticipantDetail(ctx, id)
}

func (s *service) VerifyParticipant(ctx context.Context, id string, req *VerifyParticipantRequest, verifierID string) error {
	if errs := s.validator.ValidateStruct(req); len(errs) > 0 {
		return &ValidationError{Details: errs}
	}

	detail, err := s.repo.GetParticipantDetail(ctx, id)
	if err != nil {
		return err
	}

	if detail.Status != "PENDING" {
		return errors.New("cannot verify participant: invalid state transition, status is not PENDING")
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if err := s.repo.UpdateParticipantStatus(ctx, tx, id, req.Status, verifierID, req.RejectionReason); err != nil {
		return err
	}

	metadata := ""
	if req.Status == "REJECTED" && req.RejectionReason != nil {
		metadata = *req.RejectionReason
	}

	if err := s.repo.LogAudit(ctx, tx, "verification", "VERIFY_PARTICIPANT", "registrations", id, metadata); err != nil {
		return err
	}

	return tx.Commit()
}

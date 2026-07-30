package attendance

import (
	"context"
	"errors"

	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

type Service interface {
	CheckIn(ctx context.Context, req *CheckInRequest, operatorID string) (*CheckInResponse, error)
	GetAttendance(ctx context.Context, registrationID string) (*AttendanceDetailResponse, error)
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

func (s *service) CheckIn(ctx context.Context, req *CheckInRequest, operatorID string) (*CheckInResponse, error) {
	if errs := s.validator.ValidateStruct(req); len(errs) > 0 {
		return nil, &ValidationError{Details: errs}
	}

	status, err := s.repo.GetParticipantStatus(ctx, req.RegistrationID)
	if err != nil {
		return nil, errors.New("participant not found")
	}

	if status != "APPROVED" {
		return nil, errors.New("cannot check-in: participant is not APPROVED")
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	inserted, err := s.repo.CreateAttendance(ctx, tx, req.RegistrationID, operatorID)
	if err != nil {
		return nil, err
	}

	if inserted {
		if err := s.repo.LogAudit(ctx, tx, "attendance", "CHECK_IN_PARTICIPANT", "attendance", req.RegistrationID, "Participant checked in successfully"); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &CheckInResponse{
		Success: true,
		IsNew:   inserted,
	}, nil
}

func (s *service) GetAttendance(ctx context.Context, registrationID string) (*AttendanceDetailResponse, error) {
	return s.repo.GetAttendanceDetail(ctx, registrationID)
}

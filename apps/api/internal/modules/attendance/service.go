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
	ListAttendances(ctx context.Context, filter AttendanceListRequest) ([]AttendanceItemResponse, int, error)
	GetAttendanceByID(ctx context.Context, id string) (*AttendanceDetailResponse, error)
	CorrectAttendance(ctx context.Context, id string, req *CorrectAttendanceRequest, operatorID string) error
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

func (s *service) ListAttendances(ctx context.Context, filter AttendanceListRequest) ([]AttendanceItemResponse, int, error) {
	if errs := s.validator.ValidateStruct(&filter); len(errs) > 0 {
		return nil, 0, &ValidationError{Details: errs}
	}
	return s.repo.ListAttendances(ctx, filter)
}

func (s *service) GetAttendanceByID(ctx context.Context, id string) (*AttendanceDetailResponse, error) {
	return s.repo.GetAttendanceByID(ctx, id)
}

func (s *service) CorrectAttendance(ctx context.Context, id string, req *CorrectAttendanceRequest, operatorID string) error {
	if errs := s.validator.ValidateStruct(req); len(errs) > 0 {
		return &ValidationError{Details: errs}
	}

	// Always reject with a schema limitation error, but log it first
	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Log the attempt
	metadata := "Attempted attendance correction with notes: " + req.Notes
	_ = s.repo.LogAudit(ctx, tx, "attendance", "CORRECT_ATTENDANCE_REJECTED", "attendance", id, metadata)
	_ = tx.Commit()

	return errors.New("attendance correction is not supported by the current database schema")
}

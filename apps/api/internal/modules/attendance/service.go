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
	UndoCheckIn(ctx context.Context, checkInID string, operatorID string, req *UndoCheckInRequest) error
	GetAttendance(ctx context.Context, registrationID string) (*AttendanceDetailResponse, error)
	Search(ctx context.Context, filter AttendanceListRequest) ([]AttendanceItemResponse, int, error)
	GetSummary(ctx context.Context, eventID string) (*AttendanceSummary, error)
	GetAttendanceByID(ctx context.Context, id string) (*AttendanceDetailResponse, error)
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

func (s *service) Search(ctx context.Context, filter AttendanceListRequest) ([]AttendanceItemResponse, int, error) {
	if errs := s.validator.ValidateStruct(&filter); len(errs) > 0 {
		return nil, 0, &ValidationError{Details: errs}
	}
	return s.repo.ListAttendances(ctx, filter)
}

func (s *service) GetSummary(ctx context.Context, eventID string) (*AttendanceSummary, error) {
	if eventID == "" {
		return nil, errors.New("event ID is required")
	}
	return s.repo.GetSummaryByEvent(ctx, eventID)
}

func (s *service) GetAttendanceByID(ctx context.Context, id string) (*AttendanceDetailResponse, error) {
	return s.repo.GetAttendanceByID(ctx, id)
}

func (s *service) UndoCheckIn(ctx context.Context, checkInID string, operatorID string, req *UndoCheckInRequest) error {
	if errs := s.validator.ValidateStruct(req); len(errs) > 0 {
		return &ValidationError{Details: errs}
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if err := s.repo.UndoCheckIn(ctx, tx, checkInID, operatorID, req.Notes); err != nil {
		return err
	}

	metadata := "Check-in undone with reason: " + req.Notes
	if err := s.repo.LogAudit(ctx, tx, "attendance", "UNDO_CHECK_IN", "attendance", checkInID, metadata); err != nil {
		return err
	}

	return tx.Commit()
}

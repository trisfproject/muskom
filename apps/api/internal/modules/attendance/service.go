package attendance

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

type Service interface {
	CheckIn(ctx context.Context, req *CheckInRequest, operatorID string) (*CheckInResponse, error)
	UndoCheckIn(ctx context.Context, checkInID string, operatorID string, req *UndoCheckInRequest) error
	BulkUndoCheckIn(ctx context.Context, ids []string, operatorID string, reason string) (int, error)
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
	if req.ParticipantID == "" && req.RegistrationNumber != "" {
		id, err := s.repo.GetParticipantIDByRegNumber(ctx, req.RegistrationNumber)
		if err != nil {
			return nil, errors.New("participant not found")
		}
		req.ParticipantID = id
	}

	if req.ParticipantID == "" {
		return nil, errors.New("participant ID or registration number is required")
	}

	if errs := s.validator.ValidateStruct(req); len(errs) > 0 {
		return nil, &ValidationError{Details: errs}
	}

	status, err := s.repo.GetParticipantStatus(ctx, req.ParticipantID)
	if err != nil {
		return nil, errors.New("participant not found")
	}

	// Normalise for comparison — DB stores mixed-case variants ('Verified', 'APPROVED', etc.)
	uStatus := strings.ToUpper(strings.TrimSpace(status))
	if uStatus != "APPROVED" && uStatus != "VERIFIED" {
		return nil, fmt.Errorf("cannot check-in: participant status is %s", status)
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	inserted, err := s.repo.CreateAttendance(ctx, tx, req.ParticipantID, operatorID)
	if err != nil {
		return nil, err
	}

	if inserted {
		// Pass operatorID explicitly so LogAudit can record actor correctly
		if err := s.repo.LogAudit(ctx, tx, "attendance", "CHECK_IN_PARTICIPANT", "attendance", req.ParticipantID, operatorID, "Participant checked in successfully via QR/Manual"); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	detail, err := s.repo.GetAttendanceDetail(ctx, req.ParticipantID)
	if err != nil {
		return nil, err
	}

	return &CheckInResponse{
		Success:            true,
		IsNew:              inserted,
		ParticipantName:    detail.FullName,
		RegistrationNumber: detail.RegistrationNumber,
		CheckedInAt:        &detail.CheckedInAt,
	}, nil
}

func (s *service) GetAttendance(ctx context.Context, participantID string) (*AttendanceDetailResponse, error) {
	return s.repo.GetAttendanceDetail(ctx, participantID)
}

func (s *service) Search(ctx context.Context, filter AttendanceListRequest) ([]AttendanceItemResponse, int, error) {
	if errs := s.validator.ValidateStruct(&filter); len(errs) > 0 {
		return nil, 0, &ValidationError{Details: errs}
	}
	return s.repo.ListAttendances(ctx, filter)
}

func (s *service) GetSummary(ctx context.Context, eventID string) (*AttendanceSummary, error) {
	return s.repo.GetSummaryByEvent(ctx, eventID)
}

func (s *service) GetAttendanceByID(ctx context.Context, id string) (*AttendanceDetailResponse, error) {
	return s.repo.GetAttendanceByID(ctx, id)
}

func (s *service) UndoCheckIn(ctx context.Context, checkInID string, operatorID string, req *UndoCheckInRequest) error {
	notes := req.Notes
	if notes == "" {
		notes = "Undone by operator"
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if err := s.repo.UndoCheckIn(ctx, tx, checkInID, operatorID, notes); err != nil {
		return err
	}

	metadata := "Check-in undone with reason: " + notes
	if err := s.repo.LogAudit(ctx, tx, "attendance", "UNDO_CHECK_IN", "attendance", checkInID, operatorID, metadata); err != nil {
		return err
	}

	return tx.Commit()
}

func (s *service) BulkUndoCheckIn(ctx context.Context, ids []string, operatorID string, reason string) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	affected, err := s.repo.BulkUndo(ctx, tx, ids, operatorID, reason)
	if err != nil {
		return 0, err
	}

	if affected > 0 {
		metadata := "Bulk check-in undone with reason: " + reason
		_ = s.repo.LogAudit(ctx, tx, "attendance", "BULK_UNDO_CHECK_IN", "attendance", operatorID, operatorID, metadata)
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return affected, nil
}

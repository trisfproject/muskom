package registration

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"

	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

var (
	ErrEventNotFound        = errors.New("no active musyawarah event found")
	ErrEventNotOpen         = errors.New("musyawarah event is not open for registration")
	ErrRegistrationClosed   = errors.New("registration phase is currently closed")
	ErrQuotaExceeded        = errors.New("participant quota has been exceeded")
	ErrAlreadyRegistered    = errors.New("email is already registered for this event")
	ErrPhoneRegistered      = errors.New("phone number is already registered for this event")
	ErrRegistrationNotFound = errors.New("registration not found")
)

// ValidationError wraps field validation errors to return to handler
type ValidationError struct {
	Details []response.ErrorDetail
}

func (e *ValidationError) Error() string {
	return "validation failed"
}

type Service interface {
	RegisterParticipant(ctx context.Context, req *PublicRegistrationRequest) (*PublicRegistrationResponse, error)
	CheckRegistrationStatus(ctx context.Context, registrationCode string) (*RegistrationStatusResponse, error)
}

type service struct {
	repo      Repository
	log       *zap.Logger
	validator *validator.Validator
}

func NewService(repo Repository, log *zap.Logger, val *validator.Validator) Service {
	return &service{repo: repo, log: log, validator: val}
}

func (s *service) RegisterParticipant(ctx context.Context, req *PublicRegistrationRequest) (*PublicRegistrationResponse, error) {
	// 0. Input Format Validation
	if errs := s.validator.ValidateStruct(req); len(errs) > 0 {
		return nil, &ValidationError{Details: errs}
	}

	// 1. Check Active Event
	evt, err := s.repo.GetActiveEventContext(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrEventNotFound
		}
		return nil, err
	}

	if evt.Status != "DRAFT" && evt.Status != "ONGOING" {
		return nil, ErrEventNotOpen
	}

	// 2. Check Timeline Phase
	isActive, err := s.repo.IsPhaseActive(ctx, evt.EventID, "REGISTRATION")
	if err != nil {
		return nil, err
	}
	if !isActive {
		return nil, ErrRegistrationClosed
	}

	// 3. Check Quota
	if evt.RegistrationLimit != nil {
		count, err := s.repo.CountRegistrations(ctx, evt.EventID)
		if err != nil {
			return nil, err
		}
		if count >= *evt.RegistrationLimit {
			return nil, ErrQuotaExceeded
		}
	}

	// 4. Check Existing Registration (Email)
	exists, err := s.repo.CheckExistingRegistration(ctx, evt.EventID, req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrAlreadyRegistered
	}

	// 5. Check Existing Registration (Phone)
	if req.Phone != nil && *req.Phone != "" {
		phoneExists, err := s.repo.CheckExistingPhone(ctx, evt.EventID, *req.Phone)
		if err != nil {
			return nil, err
		}
		if phoneExists {
			return nil, ErrPhoneRegistered
		}
	}

	// 6. Database Transaction
	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	person := &Person{
		FullName: req.FullName,
		Email:    req.Email,
		Phone:    req.Phone,
		Company:  req.Company,
		JobTitle: req.JobTitle,
	}

	if err := s.repo.FindOrCreatePerson(ctx, tx, person); err != nil {
		s.log.Error("Failed to find or create person", zap.Error(err))
		return nil, err
	}

	status := "PENDING"
	if evt.RegistrationApprovalMode == "AUTOMATIC" {
		status = "APPROVED"
	}

	source := "PUBLIC_WEB"
	reg := &Registration{
		EventID:             evt.EventID,
		PersonID:            person.ID,
		ParticipantCategory: &req.ParticipantCategory,
		Source:              &source,
		Status:              status,
	}

	if err := s.repo.CreateRegistration(ctx, tx, reg); err != nil {
		s.log.Error("Failed to create registration", zap.Error(err))
		return nil, err
	}

	// 6. Audit Log
	meta, _ := json.Marshal(map[string]interface{}{
		"email":                req.Email,
		"participant_category": req.ParticipantCategory,
	})
	if err := s.repo.LogAudit(ctx, tx, "REGISTRATION", "PUBLIC_REGISTER", "registrations", reg.ID, string(meta)); err != nil {
		s.log.Error("Failed to write audit log", zap.Error(err))
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &PublicRegistrationResponse{
		RegistrationCode: reg.ID,
		Status:           reg.Status,
	}, nil
}

func (s *service) CheckRegistrationStatus(ctx context.Context, registrationCode string) (*RegistrationStatusResponse, error) {
	status, err := s.repo.GetRegistrationStatus(ctx, registrationCode)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRegistrationNotFound
		}
		return nil, err
	}

	return &RegistrationStatusResponse{
		Status: status,
	}, nil
}

// TODO: MKS-040-003 Implement File Validation Hook
// func (s *service) ValidateRegistrationFiles(ctx context.Context, files []multipart.FileHeader) error {
// 	// Implementation for validating documents/files will be here
// 	return nil
// }

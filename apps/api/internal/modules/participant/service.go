package participant

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/platform/mailer"
)

var (
	ErrDuplicateEmail      = errors.New("email already registered")
	ErrQuotaReached        = errors.New("registration quota reached")
	ErrRegistrationNotOpen = errors.New("registration is not open yet")
	ErrRegistrationClosed  = errors.New("registration has closed")
)

type Service interface {
	Create(ctx context.Context, req CreateParticipantRequest) (*Participant, error)
	GetByID(ctx context.Context, id string) (*Participant, error)
	GetAll(ctx context.Context) ([]Participant, error)
	Update(ctx context.Context, id string, req UpdateParticipantRequest) (*Participant, error)
	UpdateStatus(ctx context.Context, id string, req UpdateStatusRequest) (*Participant, error)
	Delete(ctx context.Context, id string) error
	PublicRegister(ctx context.Context, req PublicRegisterParticipantRequest) (*PublicRegisterParticipantResponse, error)
	GetStats(ctx context.Context) (*ParticipantStats, error)
}

type service struct {
	repo         Repository
	auditService audit.AuditService
	mailer       mailer.Mailer
}

func NewService(repo Repository, auditService audit.AuditService, m mailer.Mailer) Service {
	return &service{
		repo:         repo,
		auditService: auditService,
		mailer:       m,
	}
}

func (s *service) Create(ctx context.Context, req CreateParticipantRequest) (*Participant, error) {
	p := &Participant{
		MusyawarahID:       req.MusyawarahID,
		RegistrationNumber: req.RegistrationNumber,
		FullName:           req.FullName,
		Nickname:           req.Nickname,

		Email:          req.Email,
		Phone:          req.Phone,
		CompanyName:    req.CompanyName,
		IndustrialArea: req.IndustrialArea,
		JobTitle:       req.JobTitle,
		Department:     req.Department,
		Status:         req.Status,
	}

	err := s.repo.Create(ctx, p)
	if err != nil {
		return nil, err
	}

	// Fetch newly created record
	p, err = s.repo.GetByID(ctx, p.ID)
	if err != nil {
		return nil, err
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleParticipant,
		Entity:   "participants",
		EntityID: p.ID,
		Action:   "CREATE",
		NewValue: p,
	})

	return p, nil
}

func (s *service) GetByID(ctx context.Context, id string) (*Participant, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *service) GetAll(ctx context.Context) ([]Participant, error) {
	return s.repo.FindAll(ctx)
}

func (s *service) Update(ctx context.Context, id string, req UpdateParticipantRequest) (*Participant, error) {
	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	oldVal := *p

	p.RegistrationNumber = req.RegistrationNumber
	p.FullName = req.FullName
	p.Nickname = req.Nickname

	p.Email = req.Email
	p.Phone = req.Phone
	p.CompanyName = req.CompanyName
	p.IndustrialArea = req.IndustrialArea
	p.JobTitle = req.JobTitle
	p.Department = req.Department

	err = s.repo.Update(ctx, p)
	if err != nil {
		return nil, err
	}

	p, _ = s.repo.GetByID(ctx, id)

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:        audit.ModuleParticipant,
		Entity:        "participants",
		EntityID:      p.ID,
		Action:        "UPDATE",
		PreviousValue: oldVal,
		NewValue:      p,
	})

	return p, nil
}

func (s *service) UpdateStatus(ctx context.Context, id string, req UpdateStatusRequest) (*Participant, error) {
	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	oldVal := *p

	err = s.repo.UpdateStatus(ctx, id, req.Status)
	if err != nil {
		return nil, err
	}

	p, _ = s.repo.GetByID(ctx, id)

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:        audit.ModuleParticipant,
		Entity:        "participants",
		EntityID:      p.ID,
		Action:        "UPDATE_STATUS",
		Reason:        req.Reason,
		PreviousValue: oldVal,
		NewValue:      p,
	})

	go func() {
		if req.Status == "Verified" {
			err := s.mailer.SendVerification(p.Email, p.FullName, p.MusyawarahID)
			if err != nil {
				_ = err
			}
		} else if req.Status == "Rejected" {
			var rsn string
			if req.Reason != nil {
				rsn = *req.Reason
			}
			err := s.mailer.SendRejection(p.Email, p.FullName, p.MusyawarahID, rsn)
			if err != nil {
				_ = err
			}
		}
	}()

	return p, nil
}

func (s *service) Delete(ctx context.Context, id string) error {
	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	err = s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:        audit.ModuleParticipant,
		Entity:        "participants",
		EntityID:      id,
		Action:        "DELETE",
		PreviousValue: p,
	})

	return nil
}

func (s *service) PublicRegister(ctx context.Context, req PublicRegisterParticipantRequest) (*PublicRegisterParticipantResponse, error) {
	// Check Registration Dates
	openDate, closeDate, err := s.repo.GetMusyawarahRegistrationDates(ctx, req.MusyawarahID)
	if err == nil {
		now := time.Now()
		if openDate != nil && now.Before(*openDate) {
			return nil, ErrRegistrationNotOpen
		}
		if closeDate != nil && now.After(*closeDate) {
			return nil, ErrRegistrationClosed
		}
	}

	// Check for duplicate email
	var findErr error
	_, findErr = s.repo.FindByEmail(ctx, req.Email)
	if findErr == nil {
		return nil, ErrDuplicateEmail
	} else if findErr != ErrNotFound {
		return nil, findErr
	}

	// Check Registration Limit
	limit, err := s.repo.GetMusyawarahRegistrationLimit(ctx, req.MusyawarahID)
	if err != nil {
		return nil, err
	}
	if limit != nil && *limit > 0 {
		count, err := s.repo.CountActiveByMusyawarah(ctx, req.MusyawarahID)
		if err != nil {
			return nil, err
		}
		if count >= *limit {
			return nil, ErrQuotaReached
		}
	}

	// Generate unique registration number
	regNum := fmt.Sprintf("PAR-%s-%s", strings.ToUpper(req.MusyawarahID[:4]), strings.ToUpper(uuid.New().String()[:8]))

	p := &Participant{
		MusyawarahID:       req.MusyawarahID,
		RegistrationNumber: regNum,
		FullName:           req.FullName,
		Nickname:           req.Nickname,

		Email:          req.Email,
		Phone:          req.Phone,
		CompanyName:    req.CompanyName,
		IndustrialArea: req.IndustrialArea,
		JobTitle:       req.JobTitle,
		Department:     req.Department,
		Status:         "Pending",
	}

	err = s.repo.Create(ctx, p)
	if err != nil {
		return nil, err
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleParticipant,
		Entity:   "participants",
		EntityID: p.ID,
		Action:   "PUBLIC_REGISTER",
		NewValue: p,
	})

	go func() {
		err := s.mailer.SendRegistrationConfirmation(
			req.Email,
			req.FullName,
			regNum,
			req.MusyawarahID,
			req.CompanyName,
			time.Now().Format("02 Jan 2006 15:04:05"),
			"Pending Verifikasi",
		)
		if err != nil {
			_ = err
		}
	}()

	return &PublicRegisterParticipantResponse{
		RegistrationNumber: regNum,
		QRToken:            regNum,
	}, nil
}

func (s *service) GetStats(ctx context.Context) (*ParticipantStats, error) {
	return s.repo.GetStats(ctx)
}

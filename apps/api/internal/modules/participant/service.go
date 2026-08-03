package participant

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
)

var (
	ErrDuplicateEmail            = errors.New("email already registered")
)

type Service interface {
	Create(ctx context.Context, req CreateParticipantRequest) (*Participant, error)
	GetByID(ctx context.Context, id string) (*Participant, error)
	GetAll(ctx context.Context) ([]Participant, error)
	Update(ctx context.Context, id string, req UpdateParticipantRequest) (*Participant, error)
	UpdateStatus(ctx context.Context, id string, req UpdateStatusRequest) (*Participant, error)
	Delete(ctx context.Context, id string) error
	PublicRegister(ctx context.Context, req PublicRegisterParticipantRequest) (*PublicRegisterParticipantResponse, error)
}

type service struct {
	repo         Repository
	auditService audit.AuditService
}

func NewService(repo Repository, auditService audit.AuditService) Service {
	return &service{
		repo:         repo,
		auditService: auditService,
	}
}

func (s *service) Create(ctx context.Context, req CreateParticipantRequest) (*Participant, error) {
	p := &Participant{
		MusyawarahID:       req.MusyawarahID,
		RegistrationNumber: req.RegistrationNumber,
		FullName:           req.FullName,
		Nickname:           req.Nickname,
		Gender:             req.Gender,
		Email:              req.Email,
		Phone:              req.Phone,
		CompanyName:        req.CompanyName,
		IndustrialArea:     req.IndustrialArea,
		JobTitle:           req.JobTitle,
		Department:         req.Department,
		Status:             req.Status,
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
	p.Gender = req.Gender
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
		PreviousValue: oldVal,
		NewValue:      p,
	})

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
	// Check for duplicate email
	_, err := s.repo.FindByEmail(ctx, req.Email)
	if err == nil {
		return nil, ErrDuplicateEmail
	} else if err != ErrNotFound {
		return nil, err
	}

	// Generate unique registration number
	regNum := fmt.Sprintf("PAR-%s-%s", strings.ToUpper(req.MusyawarahID[:4]), strings.ToUpper(uuid.New().String()[:8]))

	p := &Participant{
		MusyawarahID:       req.MusyawarahID,
		RegistrationNumber: regNum,
		FullName:           req.FullName,
		Nickname:           req.Nickname,
		Gender:             req.Gender,
		Email:              req.Email,
		Phone:              req.Phone,
		CompanyName:        req.CompanyName,
		IndustrialArea:     req.IndustrialArea,
		JobTitle:           req.JobTitle,
		Department:         req.Department,
		Status:             "Pending",
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

	return &PublicRegisterParticipantResponse{
		RegistrationNumber: regNum,
		QRToken:            regNum, // Simple QR token using registration number
	}, nil
}

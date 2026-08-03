package candidate

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
)

type Service interface {
	Create(ctx context.Context, req CreateCandidateRequest) (*CandidateResponse, error)
	GetByID(ctx context.Context, id string) (*CandidateResponse, error)
	GetAll(ctx context.Context) ([]CandidateResponse, error)
	Update(ctx context.Context, id string, req UpdateCandidateRequest) (*CandidateResponse, error)
	Patch(ctx context.Context, id string, req PatchCandidateRequest) (*CandidateResponse, error)
	Delete(ctx context.Context, id string) error
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

func (s *service) Create(ctx context.Context, req CreateCandidateRequest) (*CandidateResponse, error) {
	// Generate unique registration number
	regNum := fmt.Sprintf("CAN-%s-%s", strings.ToUpper(req.MusyawarahID[:4]), strings.ToUpper(uuid.New().String()[:8]))

	c := &Candidate{
		MusyawarahID:       req.MusyawarahID,
		RegistrationNumber: regNum,
		FullName:           req.FullName,
		Nickname:           req.Nickname,
		Email:              req.Email,
		Phone:              req.Phone,
		Gender:             req.Gender,
		BirthPlace:         req.BirthPlace,
		Occupation:         req.Occupation,
		Organization:       req.Organization,
		Address:            req.Address,
		Biography:          req.Biography,
		Motivation:         req.Motivation,
		Vision:             req.Vision,
		Mission:            req.Mission,
		Status:             "Draft",
	}

	if req.BirthDate != nil {
		bd, err := time.Parse("2006-01-02", *req.BirthDate)
		if err == nil {
			c.BirthDate = &bd
		}
	}

	err := s.repo.Create(ctx, c)
	if err != nil {
		return nil, err
	}

	// Fetch newly created record to get all fields including ID and timestamps
	c, err = s.repo.GetByID(ctx, c.ID)
	if err != nil {
		return nil, err
	}

	// Audit Log
	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleCandidate,
		Entity:   "candidates",
		EntityID: c.ID,
		Action:   "CREATE",
		NewValue: c,
	})

	res := mapToResponse(c)
	return &res, nil
}

func (s *service) GetByID(ctx context.Context, id string) (*CandidateResponse, error) {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	res := mapToResponse(c)
	return &res, nil
}

func (s *service) GetAll(ctx context.Context) ([]CandidateResponse, error) {
	candidates, err := s.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	var res []CandidateResponse
	for _, c := range candidates {
		res = append(res, mapToResponse(&c))
	}
	return res, nil
}

func (s *service) Update(ctx context.Context, id string, req UpdateCandidateRequest) (*CandidateResponse, error) {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	
	oldVal := *c

	c.FullName = req.FullName
	c.Nickname = req.Nickname
	c.Email = req.Email
	c.Phone = req.Phone
	c.Gender = req.Gender
	c.BirthPlace = req.BirthPlace
	c.Occupation = req.Occupation
	c.Organization = req.Organization
	c.Address = req.Address
	c.Biography = req.Biography
	c.Motivation = req.Motivation
	c.Vision = req.Vision
	c.Mission = req.Mission
	c.ProfilePhoto = req.ProfilePhoto

	if req.BirthDate != nil {
		bd, err := time.Parse("2006-01-02", *req.BirthDate)
		if err == nil {
			c.BirthDate = &bd
		}
	} else {
		c.BirthDate = nil
	}

	if req.Status != nil {
		c.Status = *req.Status
	}

	err = s.repo.Update(ctx, c)
	if err != nil {
		return nil, err
	}

	c, _ = s.repo.GetByID(ctx, id)

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:        audit.ModuleCandidate,
		Entity:        "candidates",
		EntityID:      c.ID,
		Action:        "UPDATE",
		PreviousValue: oldVal,
		NewValue:      c,
	})

	res := mapToResponse(c)
	return &res, nil
}

func (s *service) Patch(ctx context.Context, id string, req PatchCandidateRequest) (*CandidateResponse, error) {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	oldVal := *c

	if req.FullName != nil {
		c.FullName = *req.FullName
	}
	if req.Nickname != nil {
		c.Nickname = req.Nickname
	}
	if req.Email != nil {
		c.Email = *req.Email
	}
	if req.Phone != nil {
		c.Phone = *req.Phone
	}
	if req.Gender != nil {
		c.Gender = *req.Gender
	}
	if req.BirthPlace != nil {
		c.BirthPlace = req.BirthPlace
	}
	if req.BirthDate != nil {
		bd, err := time.Parse("2006-01-02", *req.BirthDate)
		if err == nil {
			c.BirthDate = &bd
		}
	}
	if req.Occupation != nil {
		c.Occupation = req.Occupation
	}
	if req.Organization != nil {
		c.Organization = req.Organization
	}
	if req.Address != nil {
		c.Address = req.Address
	}
	if req.Biography != nil {
		c.Biography = req.Biography
	}
	if req.Motivation != nil {
		c.Motivation = req.Motivation
	}
	if req.Vision != nil {
		c.Vision = req.Vision
	}
	if req.Mission != nil {
		c.Mission = req.Mission
	}
	if req.ProfilePhoto != nil {
		c.ProfilePhoto = req.ProfilePhoto
	}
	if req.Status != nil {
		c.Status = *req.Status
	}

	err = s.repo.Update(ctx, c)
	if err != nil {
		return nil, err
	}

	c, _ = s.repo.GetByID(ctx, id)

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:        audit.ModuleCandidate,
		Entity:        "candidates",
		EntityID:      c.ID,
		Action:        "UPDATE",
		PreviousValue: oldVal,
		NewValue:      c,
	})

	res := mapToResponse(c)
	return &res, nil
}

func (s *service) Delete(ctx context.Context, id string) error {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	err = s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:        audit.ModuleCandidate,
		Entity:        "candidates",
		EntityID:      id,
		Action:        "DELETE",
		PreviousValue: c,
	})

	return nil
}

func mapToResponse(c *Candidate) CandidateResponse {
	var bdStr *string
	if c.BirthDate != nil {
		str := c.BirthDate.Format("2006-01-02")
		bdStr = &str
	}
	return CandidateResponse{
		ID:                 c.ID,
		MusyawarahID:       c.MusyawarahID,
		RegistrationNumber: c.RegistrationNumber,
		FullName:           c.FullName,
		Nickname:           c.Nickname,
		Email:              c.Email,
		Phone:              c.Phone,
		Gender:             c.Gender,
		BirthPlace:         c.BirthPlace,
		BirthDate:          bdStr,
		Occupation:         c.Occupation,
		Organization:       c.Organization,
		Address:            c.Address,
		Biography:          c.Biography,
		Motivation:         c.Motivation,
		Vision:             c.Vision,
		Mission:            c.Mission,
		ProfilePhoto:       c.ProfilePhoto,
		Status:             c.Status,
		CreatedAt:          c.CreatedAt,
		UpdatedAt:          c.UpdatedAt,
	}
}

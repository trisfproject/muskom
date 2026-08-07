package participant

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/internal/modules/website"
	"github.com/trisfproject/muskom/apps/api/platform/config"
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
	BulkDelete(ctx context.Context, ids []string) error
	BulkUpdateStatus(ctx context.Context, ids []string, status string) error
	PublicRegister(ctx context.Context, req PublicRegisterParticipantRequest) (*PublicRegisterParticipantResponse, error)
	GetStats(ctx context.Context) (*ParticipantStats, error)
	VerifyEmail(ctx context.Context, token string) error
	ResendVerification(ctx context.Context, email string) error
}

type service struct {
	repo         Repository
	resolver     website.PhaseResolver
	auditService audit.AuditService
	mailer       mailer.Mailer
	rdb          *redis.Client
	cfg          *config.Config
}

func NewService(repo Repository, resolver website.PhaseResolver, auditService audit.AuditService, m mailer.Mailer, rdb *redis.Client, cfg *config.Config) Service {
	return &service{
		repo:         repo,
		resolver:     resolver,
		auditService: auditService,
		mailer:       m,
		rdb:          rdb,
		cfg:          cfg,
	}
}

func (s *service) Create(ctx context.Context, req CreateParticipantRequest) (*Participant, error) {
	p := &Participant{

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
			err := s.mailer.SendVerification(p.Email, p.FullName, "")
			if err != nil {
				_ = err
			}
		} else if req.Status == "Rejected" {
			var rsn string
			if req.Reason != nil {
				rsn = *req.Reason
			}
			err := s.mailer.SendRejection(p.Email, p.FullName, "", rsn)
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
	// Check Registration Dates via PhaseResolver
	isOpen, err := s.resolver.IsParticipantRegistrationOpen(ctx)
	if err != nil {
		return nil, err
	}
	if !isOpen {
		return nil, ErrRegistrationClosed
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
	limit, err := s.repo.GetRegistrationLimit(ctx)
	if err != nil {
		return nil, err
	}
	if limit != nil && *limit > 0 {
		count, err := s.repo.CountActive(ctx)
		if err != nil {
			return nil, err
		}
		if count >= *limit {
			return nil, ErrQuotaReached
		}
	}

	// Generate unique registration number
	regNum := fmt.Sprintf("PAR-%s-%s", strings.ToUpper(uuid.New().String()[:4]), strings.ToUpper(uuid.New().String()[:8]))

	p := &Participant{

		RegistrationNumber: regNum,
		FullName:           req.FullName,
		Nickname:           req.Nickname,

		Email:          req.Email,
		Phone:          req.Phone,
		CompanyName:    req.CompanyName,
		IndustrialArea: req.IndustrialArea,
		JobTitle:       req.JobTitle,
		Department:     req.Department,
		Status:         "Unverified",
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
		if s.cfg != nil {
			token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
				"sub": p.ID,
				"exp": time.Now().Add(24 * time.Hour).Unix(),
			})
			tokenString, _ := token.SignedString([]byte(s.cfg.JWTSecret))

			// Determine Base URL (can be from request origin, but we'll use a relative path logic on frontend)
			// Actually we need the absolute frontend URL for the email link.
			// The frontend usually runs on the same domain or we can just use a relative /verify-email?token=
			// Let's use an environment variable or construct from localhost if not available.
			// Since we don't have a FRONTEND_URL in config, we'll use a relative path format assuming it's same origin,
			// or default to localhost:3000
			verificationURL := fmt.Sprintf("http://localhost:3000/verify-email?token=%s", tokenString)

			err := s.mailer.SendEmailVerificationLink(req.Email, req.FullName, verificationURL)
			if err != nil {
				_ = err
			}
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

func (s *service) VerifyEmail(ctx context.Context, tokenString string) error {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(s.cfg.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		return errors.New("invalid or expired token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return errors.New("invalid token claims")
	}

	participantID, ok := claims["sub"].(string)
	if !ok {
		return errors.New("invalid participant ID in token")
	}

	p, err := s.repo.GetByID(ctx, participantID)
	if err != nil {
		return err
	}

	if p.Status != "Unverified" {
		// Already verified or processed
		return nil
	}

	return s.repo.UpdateStatus(ctx, p.ID, "Pending")
}

func (s *service) ResendVerification(ctx context.Context, email string) error {
	p, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		if err == ErrNotFound {
			// Don't leak if email exists or not
			return nil
		}
		return err
	}

	if p.Status != "Unverified" {
		return nil
	}

	if s.rdb != nil {
		cooldownKey := fmt.Sprintf("resend_verification:%s", p.ID)
		exists, _ := s.rdb.Exists(ctx, cooldownKey).Result()
		if exists > 0 {
			return errors.New("please wait before requesting another verification email")
		}
		s.rdb.Set(ctx, cooldownKey, "1", 1*time.Minute)
	}

	if s.cfg != nil {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub": p.ID,
			"exp": time.Now().Add(24 * time.Hour).Unix(),
		})
		tokenString, _ := token.SignedString([]byte(s.cfg.JWTSecret))
		verificationURL := fmt.Sprintf("http://localhost:3000/verify-email?token=%s", tokenString)

		go func() {
			_ = s.mailer.SendEmailVerificationLink(p.Email, p.FullName, verificationURL)
		}()
	}

	return nil
}

func (s *service) BulkDelete(ctx context.Context, ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	err := s.repo.BulkDelete(ctx, ids)
	if err != nil {
		return err
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleParticipant,
		Entity:   "participants",
		EntityID: "bulk",
		Action:   "BULK_DELETE",
		Metadata: map[string]interface{}{"participant_ids": ids},
	})

	return nil
}

func (s *service) BulkUpdateStatus(ctx context.Context, ids []string, status string) error {
	if len(ids) == 0 {
		return nil
	}
	err := s.repo.BulkUpdateStatus(ctx, ids, status)
	if err != nil {
		return err
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleParticipant,
		Entity:   "participants",
		EntityID: "bulk",
		Action:   "BULK_UPDATE_STATUS",
		Metadata: map[string]interface{}{"participant_ids": ids, "status": status},
	})

	return nil
}

package participant

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/internal/modules/notification"
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
	LookupPublic(ctx context.Context, query string) (*PublicLookupResponse, error)
	GetByID(ctx context.Context, id string) (*Participant, error)
	GetAll(ctx context.Context) ([]Participant, error)
	Update(ctx context.Context, id string, req UpdateParticipantRequest) (*Participant, error)
	UpdateStatus(ctx context.Context, id string, req UpdateStatusRequest) (*Participant, error)
	Delete(ctx context.Context, id string) error
	BulkDelete(ctx context.Context, ids []string) error
	BulkUpdateStatus(ctx context.Context, ids []string, status string) error
	PublicRegister(ctx context.Context, req PublicRegisterParticipantRequest) (*PublicRegisterParticipantResponse, error)
	GetStats(ctx context.Context) (*ParticipantStats, error)
}

type service struct {
	repo         Repository
	resolver     website.PhaseResolver
	auditService audit.AuditService
	mailer       mailer.Mailer
	notifSvc     notification.Service
	rdb          *redis.Client
	cfg          *config.Config
}

func NewService(repo Repository, resolver website.PhaseResolver, auditService audit.AuditService, m mailer.Mailer, rdb *redis.Client, cfg *config.Config, notifSvc notification.Service) Service {
	return &service{
		repo:         repo,
		resolver:     resolver,
		auditService: auditService,
		mailer:       m,
		notifSvc:     notifSvc,
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
	if req.Status == "Verified" || req.Status == "Approved" {
		var finalP *Participant
		
		err := s.repo.ExecuteTx(ctx, func(tx *sqlx.Tx) error {
			p, err := s.repo.GetByIDTx(ctx, tx, id)
			if err != nil {
				return err
			}
			oldVal := *p

			if p.Status == "Verified" || p.Status == "Approved" {
				finalP = p
				return nil // Already approved
			}

			// Generate official registration number
			max, err := s.repo.GetMaxOfficialRegistrationNumberTx(ctx, tx)
			if err != nil {
				return err
			}
			newRegNum := fmt.Sprintf("REG-%06d", max+1)

			err = s.repo.UpdateStatusAndNumberTx(ctx, tx, id, req.Status, newRegNum)
			if err != nil {
				return err
			}
			
			p.Status = req.Status
			p.RegistrationNumber = newRegNum
			finalP = p

			// 5. Queue Approval Email in Tx
			payload := map[string]interface{}{
				"full_name":              p.FullName,
				"registration_number":    p.RegistrationNumber,
				"event_name":             "MUSKOM 2026",
				"qr_code":                fmt.Sprintf("%s/api/v1/public/qr/%s.png", s.cfg.AppBaseURL, p.RegistrationNumber),
				"participant_lookup_url": fmt.Sprintf("%s/peserta", s.cfg.AppBaseURL),
				"event_date":             "Tanggal Acara",
				"venue":                  "Lokasi Acara",
			}
			if s.notifSvc != nil {
				err = s.notifSvc.QueueNotificationTx(ctx, tx, notification.ChannelEmail, "participant_registration_approved", p.Email, payload)
				if err != nil {
					return err
				}
				// Optionally queue in-app (not critical to fail transaction but we'll do it for consistency)
				_ = s.notifSvc.QueueNotificationTx(ctx, tx, notification.ChannelInApp, "participant_registration_approved", "system", map[string]interface{}{
					"title":   "Participant Approved",
					"message": p.FullName + " registration has been approved.",
					"type":    "success",
				})
			}

			// 6. Audit Log in Tx
			err = s.auditService.LogActivityTx(ctx, tx, audit.AuditEntry{
				Module:        audit.ModuleParticipant,
				Entity:        "participants",
				EntityID:      p.ID,
				Action:        "UPDATE_STATUS",
				Reason:        req.Reason,
				PreviousValue: oldVal,
				NewValue:      p,
			})
			if err != nil {
				return err
			}

			return nil
		})

		if err != nil {
			return nil, err
		}
		return finalP, nil
	}

	// For non-approved statuses (e.g. Rejected), we don't need a strict transaction 
	// for registration number generation since they don't get one. 
	// We'll keep it simple and just do the update.
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
		if req.Status == "Rejected" {
			var rsn string
			if req.Reason != nil {
				rsn = *req.Reason
			}
			payload := map[string]interface{}{
				"full_name":        p.FullName,
				"event_name":       "MUSKOM 2026",
				"rejection_reason": rsn,
			}
			if s.notifSvc != nil {
				_ = s.notifSvc.QueueNotification(context.Background(), notification.ChannelEmail, "participant_registration_rejected", p.Email, payload)
				_ = s.notifSvc.QueueNotification(context.Background(), notification.ChannelInApp, "participant_registration_rejected", "system", map[string]interface{}{
					"title":   "Participant Rejected",
					"message": p.FullName + " registration has been rejected.",
					"type":    "warning",
				})
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

	// Check Registration Capacity
	limit, mode, err := s.repo.GetCapacitySettings(ctx)
	if err != nil {
		return nil, err
	}

	isWaitingList := false
	if limit > 0 {
		verifiedCount, err := s.repo.CountVerified(ctx)
		if err != nil {
			return nil, err
		}
		if verifiedCount >= limit {
			switch strings.ToUpper(strings.TrimSpace(mode)) {
			case "CLOSE":
				return nil, ErrQuotaReached
			case "WAITING_LIST":
				isWaitingList = true
			case "ALLOW":
				// Allow registration normally
			default:
				return nil, ErrQuotaReached
			}
		}
	}

	regNum := ""
	initialStatus := "Pending"
	qrToken := ""

	if isWaitingList {
		initialStatus = "Waiting List"
		// No registration number and no QR code
		regNum = ""
		qrToken = ""
	} else {
		// Generate unique temporary registration number
		regNum = fmt.Sprintf("PENDING-%s", strings.ToUpper(uuid.New().String()[:8]))
		qrToken = regNum
	}

	p := &Participant{
		RegistrationNumber: regNum,
		FullName:           req.FullName,
		Nickname:           req.Nickname,
		Email:              req.Email,
		Phone:              req.Phone,
		CompanyName:        req.CompanyName,
		IndustrialArea:     req.IndustrialArea,
		JobTitle:           req.JobTitle,
		Department:         req.Department,
		Status:             initialStatus,
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
		payload := map[string]interface{}{
			"full_name":  p.FullName,
			"event_name": "MUSKOM 2026",
		}
		if s.notifSvc != nil {
			_ = s.notifSvc.QueueNotification(context.Background(), notification.ChannelEmail, "participant_registration_submitted", p.Email, payload)
			_ = s.notifSvc.QueueNotification(context.Background(), notification.ChannelInApp, "participant_registration_submitted", "system", map[string]interface{}{
				"title":   "New Participant Registration",
				"message": p.FullName + " has registered for MUSKOM 2026.",
				"type":    "info",
			})
		}
	}()

	return &PublicRegisterParticipantResponse{
		RegistrationNumber: regNum,
		QRToken:            qrToken,
	}, nil
}

func (s *service) GetStats(ctx context.Context) (*ParticipantStats, error) {
	return s.repo.GetStats(ctx)
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

func (s *service) LookupPublic(ctx context.Context, query string) (*PublicLookupResponse, error) {
	p, err := s.repo.LookupPublic(ctx, query)
	if err != nil {
		return nil, err
	}

	// Hide RegistrationNumber if the participant is not Verified
	regNumber := ""
	if strings.ToUpper(p.Status) == "VERIFIED" || strings.ToUpper(p.Status) == "APPROVED" {
		regNumber = p.RegistrationNumber
	}

	return &PublicLookupResponse{
		FullName:           p.FullName,
		RegistrationNumber: regNumber,
		CompanyName:        p.CompanyName,
		JobTitle:           p.JobTitle,
		Status:             p.Status,
	}, nil
}

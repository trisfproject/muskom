package verification

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"strings"

	"github.com/google/uuid"
	"github.com/trisfproject/muskom/apps/api/internal/modules/notification"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

type Service interface {
	ListVerifications(ctx context.Context, filter VerificationListRequest) ([]VerificationItemResponse, int, error)
	GetSummary(ctx context.Context) (*VerificationSummaryResponse, error)
	GetParticipantVerification(ctx context.Context, id string) (*ParticipantDetailResponse, error)
	VerifyParticipant(ctx context.Context, id string, req *VerifyParticipantRequest, verifierID string) error
	GetCandidateVerification(ctx context.Context, id string) (*CandidateDetailResponse, error)
	VerifyCandidate(ctx context.Context, id string, req *VerifyCandidateRequest, verifierID string) error
}

type service struct {
	repo      Repository
	log       *zap.Logger
	validator *validator.Validator
	notifSvc  notification.Service
	cfg       *config.Config
}

func NewService(repo Repository, log *zap.Logger, val *validator.Validator, notifSvc notification.Service, cfg *config.Config) Service {
	return &service{
		repo:      repo,
		log:       log,
		validator: val,
		notifSvc:  notifSvc,
		cfg:       cfg,
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

func (s *service) ListVerifications(ctx context.Context, filter VerificationListRequest) ([]VerificationItemResponse, int, error) {
	if errs := s.validator.ValidateStruct(&filter); len(errs) > 0 {
		return nil, 0, &ValidationError{Details: errs}
	}
	return s.repo.GetVerifications(ctx, filter)
}

func (s *service) GetSummary(ctx context.Context) (*VerificationSummaryResponse, error) {
	return s.repo.GetVerificationSummary(ctx)
}

func (s *service) GetParticipantVerification(ctx context.Context, id string) (*ParticipantDetailResponse, error) {
	return s.repo.GetParticipantDetail(ctx, id)
}

func (s *service) validateTransition(entityType, currentStatus, newStatus string) error {
	if entityType == "participant" {
		if currentStatus != "PENDING" {
			return errors.New("cannot verify participant: invalid state transition, status is not PENDING")
		}
		if newStatus != "APPROVED" && newStatus != "REJECTED" {
			return errors.New("cannot verify participant: invalid target status")
		}
		return nil
	}

	if entityType == "candidate" {
		if currentStatus == "ACCEPTED" || currentStatus == "REJECTED" {
			return errors.New("cannot verify candidate: invalid state transition, already finalized")
		}
		if currentStatus == "SUBMITTED" && newStatus != "REVIEWING" {
			return errors.New("cannot verify candidate: SUBMITTED must transition to REVIEWING first")
		}
		if currentStatus == "REVIEWING" && newStatus != "ACCEPTED" && newStatus != "REJECTED" {
			return errors.New("cannot verify candidate: REVIEWING must transition to ACCEPTED or REJECTED")
		}
		return nil
	}

	return errors.New("unknown entity type for transition validation")
}

func (s *service) VerifyParticipant(ctx context.Context, id string, req *VerifyParticipantRequest, verifierID string) error {
	if errs := s.validator.ValidateStruct(req); len(errs) > 0 {
		return &ValidationError{Details: errs}
	}

	req.Status = strings.ToUpper(req.Status)
	if req.Status == "VERIFIED" {
		req.Status = "APPROVED"
	}

	detail, err := s.repo.GetParticipantDetail(ctx, id)
	if err != nil {
		return err
	}

	if err := s.validateTransition("participant", strings.ToUpper(detail.Status), req.Status); err != nil {
		return err
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var regNumber *string
	if req.Status == "APPROVED" {
		limit, err := s.repo.GetParticipantLimitAndLockTx(ctx, tx)
		if err != nil {
			return err
		}
		if limit > 0 {
			verifiedCount, err := s.repo.CountVerifiedInTx(ctx, tx)
			if err != nil {
				return err
			}
			if verifiedCount >= limit {
				return &ValidationError{
					Details: []response.ErrorDetail{
						{
							Field:   "quota",
							Message: "Participant capacity has reached its limit",
						},
					},
				}
			}
		}

		num := fmt.Sprintf("MK-%s-%s", strings.ToUpper(uuid.New().String()[:4]), strings.ToUpper(uuid.New().String()[:8]))
		regNumber = &num
	}

	if err := s.repo.UpdateParticipantStatus(ctx, tx, id, req.Status, verifierID, req.RejectionReason, regNumber); err != nil {
		return err
	}

	metadata := ""
	if req.Status == "REJECTED" && req.RejectionReason != nil {
		b, _ := json.Marshal(map[string]string{"reason": *req.RejectionReason})
		metadata = string(b)
	}

	auditCtx := context.WithValue(ctx, "user_id", verifierID)
	if err := s.repo.LogAudit(auditCtx, tx, "verification", "VERIFY_PARTICIPANT", "registrations", id, metadata); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	// Queue notifications
	go func() {
		ctxBG := context.Background()
		if req.Status == "APPROVED" {
			rn := ""
			if regNumber != nil {
				rn = *regNumber
			}
			
			baseURL := strings.TrimRight(s.cfg.AppBaseURL, "/")
			lookupURL := fmt.Sprintf("%s/peserta?q=%s", baseURL, url.QueryEscape(rn))
			payload := map[string]interface{}{
				"full_name":              detail.FullName,
				"registration_number":    rn,
				"event_name":             "MUSKOM 2026",
				"participant_lookup_url": lookupURL,
				"lookup_url":             lookupURL,
				"participant_url":        lookupURL,
				"event_date":             "Tanggal Acara", // Placeholder
				"venue":                  "Lokasi Acara",   // Placeholder
			}
			if s.notifSvc != nil {
				_ = s.notifSvc.QueueNotification(ctxBG, notification.ChannelEmail, "participant_registration_approved", detail.Email, payload)
				// _ = s.notifSvc.QueueNotification(ctxBG, notification.ChannelInApp, "participant_registration_approved", "system", map[string]interface{}{
				// 	"title":   "Participant Approved",
				// 	"message": detail.FullName + " registration has been approved.",
				// 	"type":    "success",
				// })
			}
		} else if req.Status == "REJECTED" {
			rsn := ""
			if req.RejectionReason != nil {
				rsn = *req.RejectionReason
			}
			payload := map[string]interface{}{
				"full_name":        detail.FullName,
				"event_name":       "MUSKOM 2026",
				"rejection_reason": rsn,
			}
			if s.notifSvc != nil {
				_ = s.notifSvc.QueueNotification(ctxBG, notification.ChannelEmail, "participant_registration_rejected", detail.Email, payload)
				// _ = s.notifSvc.QueueNotification(ctxBG, notification.ChannelInApp, "participant_registration_rejected", "system", map[string]interface{}{
				// 	"title":   "Participant Rejected",
				// 	"message": detail.FullName + " registration has been rejected.",
				// 	"type":    "warning",
				// })
			}
		}
	}()

	return nil
}

func (s *service) GetCandidateVerification(ctx context.Context, id string) (*CandidateDetailResponse, error) {
	return s.repo.GetCandidateDetail(ctx, id)
}

func (s *service) VerifyCandidate(ctx context.Context, id string, req *VerifyCandidateRequest, verifierID string) error {
	if errs := s.validator.ValidateStruct(req); len(errs) > 0 {
		return &ValidationError{Details: errs}
	}

	req.Status = strings.ToUpper(req.Status)
	if req.Status == "APPROVED" || req.Status == "VERIFIED" {
		req.Status = "ACCEPTED"
	}

	detail, err := s.repo.GetCandidateDetail(ctx, id)
	if err != nil {
		return err
	}

	if err := s.validateTransition("candidate", strings.ToUpper(detail.Status), req.Status); err != nil {
		return err
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if err := s.repo.UpdateCandidateStatus(ctx, tx, id, req.Status, verifierID); err != nil {
		return err
	}

	metadata := ""
	if req.Notes != nil {
		b, _ := json.Marshal(map[string]string{"notes": *req.Notes})
		metadata = string(b)
	}

	auditCtx := context.WithValue(ctx, "user_id", verifierID)
	if err := s.repo.LogAudit(auditCtx, tx, "verification", "VERIFY_CANDIDATE", "candidate_applications", id, metadata); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	// Queue notifications
	go func() {
		ctxBG := context.Background()
		if req.Status == "ACCEPTED" {
			payload := map[string]interface{}{
				"full_name":  detail.FullName,
				"event_name": "MUSKOM 2026",
				"candidate_number": "TBD", // Candidate number comes later usually
			}
			if s.notifSvc != nil {
				_ = s.notifSvc.QueueNotification(ctxBG, notification.ChannelEmail, "candidate_registration_approved", detail.Email, payload)
				// _ = s.notifSvc.QueueNotification(ctxBG, notification.ChannelInApp, "candidate_registration_approved", "system", map[string]interface{}{
				// 	"title":   "Candidate Approved",
				// 	"message": detail.FullName + " candidate registration has been approved.",
				// 	"type":    "success",
				// })
			}
		} else if req.Status == "REJECTED" {
			rsn := ""
			if req.Notes != nil {
				rsn = *req.Notes
			}
			payload := map[string]interface{}{
				"full_name":        detail.FullName,
				"event_name":       "MUSKOM 2026",
				"rejection_reason": rsn,
			}
			if s.notifSvc != nil {
				_ = s.notifSvc.QueueNotification(ctxBG, notification.ChannelEmail, "candidate_registration_rejected", detail.Email, payload)
				// _ = s.notifSvc.QueueNotification(ctxBG, notification.ChannelInApp, "candidate_registration_rejected", "system", map[string]interface{}{
				// 	"title":   "Candidate Rejected",
				// 	"message": detail.FullName + " candidate registration has been rejected.",
				// 	"type":    "warning",
				// })
			}
		}
	}()

	return nil
}

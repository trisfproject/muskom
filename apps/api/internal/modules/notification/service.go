package notification

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

var (
	ErrTemplateNotFound     = errors.New("notification template not found")
	ErrProviderNotFound     = errors.New("notification provider not found")
	ErrNoRecipientsSelected = errors.New("no recipients selected")
)

type Service interface {
	QueueNotification(ctx context.Context, channel Channel, templateName, recipient string, payload map[string]interface{}) error
	QueueNotificationTx(ctx context.Context, tx *sqlx.Tx, channel Channel, templateName, recipient string, payload map[string]interface{}) error
	Broadcast(ctx context.Context, channel Channel, templateName string, recipients []string, payload map[string]interface{}) error

	ListJobs(ctx context.Context) ([]NotificationJob, error)
	ListHistory(ctx context.Context, page, limit int) ([]NotificationHistory, int, error)
	ListTemplates(ctx context.Context) ([]NotificationTemplate, error)
	GetTemplate(ctx context.Context, id string) (*NotificationTemplate, error)
	UpdateTemplate(ctx context.Context, id string, subject *string, body string) error
	RetryJob(ctx context.Context, id string) error
	TestSMTP(ctx context.Context, email string) error
	TestTemplate(ctx context.Context, id string, email string) error
	SeedDefaultTemplates(ctx context.Context) error

	// In-App Notification Methods
	ListInAppNotifications(ctx context.Context, userID *string, limit int, offset int) ([]InAppNotification, int, error)
	GetUnreadInAppCount(ctx context.Context, userID *string) (int, error)
	MarkInAppRead(ctx context.Context, id string) error
	MarkAllInAppRead(ctx context.Context, userID *string) error
	DeleteInAppNotification(ctx context.Context, id string) error

	PreviewMusyawarahReminder(ctx context.Context) (map[string]interface{}, error)
	ListMusyawarahReminderRecipients(ctx context.Context, search string, page, limit int) ([]ReminderRecipient, int, error)
	BlastMusyawarahReminder(ctx context.Context, operatorID string, req BlastRequest) (BlastResult, error)
	
	SaveMusyawarahDraft(ctx context.Context, operatorID string, req DraftRequest) (*BroadcastDraft, error)
	GetMusyawarahDraft(ctx context.Context) (*BroadcastDraft, error)
}

type service struct {
	repo      Repository
	providers *ProviderRegistry
	worker    *Worker
	log       *zap.Logger
}

func NewService(repo Repository, providers *ProviderRegistry, log *zap.Logger) Service {
	svc := &service{
		repo:      repo,
		providers: providers,
		log:       log,
	}
	// Initialize and start the lightweight worker
	svc.worker = NewWorker(repo, providers, log)
	go svc.worker.Start(context.Background())
	return svc
}

func (s *service) QueueNotification(ctx context.Context, channel Channel, templateName, recipient string, payload map[string]interface{}) error {
	tpl, err := s.repo.GetTemplateByName(ctx, templateName, channel)
	if err != nil {
		s.log.Error("Template not found", zap.String("name", templateName), zap.Error(err))
		return ErrTemplateNotFound
	}

	var payloadStr *string
	if payload != nil {
		b, _ := json.Marshal(payload)
		str := string(b)
		payloadStr = &str
	}

	job := &NotificationJob{
		TemplateID: tpl.ID,
		Channel:    channel,
		Recipient:  recipient,
		Payload:    payloadStr,
		Status:     StatusPending,
	}

	err = s.repo.CreateJob(ctx, job)
	if err != nil {
		s.log.Error("Failed to queue notification", zap.Error(err))
		return err
	}
	return nil
}

func (s *service) QueueNotificationTx(ctx context.Context, tx *sqlx.Tx, channel Channel, templateName, recipient string, payload map[string]interface{}) error {
	tpl, err := s.repo.GetTemplateByName(ctx, templateName, channel)
	if err != nil {
		s.log.Error("Template not found", zap.String("name", templateName), zap.Error(err))
		return ErrTemplateNotFound
	}

	var payloadStr *string
	if payload != nil {
		b, _ := json.Marshal(payload)
		str := string(b)
		payloadStr = &str
	}

	job := &NotificationJob{
		TemplateID: tpl.ID,
		Channel:    channel,
		Recipient:  recipient,
		Payload:    payloadStr,
		Status:     StatusPending,
	}

	err = s.repo.CreateJobTx(ctx, tx, job)
	if err != nil {
		s.log.Error("Failed to queue notification in transaction", zap.Error(err))
		return err
	}
	return nil
}

func (s *service) Broadcast(ctx context.Context, channel Channel, templateName string, recipients []string, payload map[string]interface{}) error {
	for _, r := range recipients {
		_ = s.QueueNotification(ctx, channel, templateName, r, payload)
	}
	return nil
}

func (s *service) ListJobs(ctx context.Context) ([]NotificationJob, error) {
	return s.repo.ListJobs(ctx, "")
}

func (s *service) ListHistory(ctx context.Context, page, limit int) ([]NotificationHistory, int, error) {
	return s.repo.ListHistory(ctx, page, limit)
}

func (s *service) ListTemplates(ctx context.Context) ([]NotificationTemplate, error) {
	return s.repo.ListTemplates(ctx)
}

func (s *service) GetTemplate(ctx context.Context, id string) (*NotificationTemplate, error) {
	return s.repo.GetTemplateByID(ctx, id)
}

func (s *service) UpdateTemplate(ctx context.Context, id string, subject *string, body string) error {
	return s.repo.UpdateTemplate(ctx, id, subject, body)
}

func (s *service) RetryJob(ctx context.Context, id string) error {
	return s.repo.RetryJob(ctx, id)
}

func (s *service) TestSMTP(ctx context.Context, email string) error {
	payload := map[string]interface{}{
		"timestamp": time.Now().Format(time.RFC1123),
	}
	return s.QueueNotification(ctx, ChannelEmail, "test_email", email, payload)
}

func (s *service) ListInAppNotifications(ctx context.Context, userID *string, limit int, offset int) ([]InAppNotification, int, error) {
	return s.repo.ListInAppNotifications(ctx, userID, limit, offset)
}

func (s *service) GetUnreadInAppCount(ctx context.Context, userID *string) (int, error) {
	return s.repo.GetUnreadInAppCount(ctx, userID)
}

func (s *service) MarkInAppRead(ctx context.Context, id string) error {
	return s.repo.MarkInAppRead(ctx, id)
}

func (s *service) MarkAllInAppRead(ctx context.Context, userID *string) error {
	return s.repo.MarkAllInAppRead(ctx, userID)
}

func (s *service) DeleteInAppNotification(ctx context.Context, id string) error {
	return s.repo.DeleteInAppNotification(ctx, id)
}

func (s *service) TestTemplate(ctx context.Context, id string, email string) error {
	tpl, err := s.repo.GetTemplateByID(ctx, id)
	if err != nil {
		return err
	}
	
	// Dummy payload for testing
	payload := map[string]interface{}{
		"full_name":              "Budi Santoso",
		"registration_number":    "PENDING-A1B2C3D4",
		"candidate_number":       "CAND-001",
		"company_name":           "PT. Maju Jaya",
		"job_title":              "Direktur",
		"event_name":             "MUSKOM",
		"event_date":             "12 Oktober 2026",
		"venue":                  "Hotel Mulia Senayan",
		"verification_url":       "https://congress.trisf.my.id/verify-email?token=123",
		"participant_lookup_url": "https://congress.trisf.my.id/peserta?q=PENDING-A1B2C3D4",
		"candidate_profile_url":  "https://congress.trisf.my.id/kandidat/CAND-001",
		"qr_code":                "https://congress.trisf.my.id/api/v1/public/qr/PENDING-A1B2C3D4.png",
	}

	return s.QueueNotification(ctx, tpl.Channel, tpl.Name, email, payload)
}

func (s *service) SeedDefaultTemplates(ctx context.Context) error {
	return SeedDefaultTemplates(ctx, s.repo, s.log)
}

// PreviewMusyawarahReminder returns a preview: eligible_count, recipients list, subject, and body.
// It uses GetEligibleReminderRecipients as the single source of truth — the same query used by Blast.
// This ensures Preview count == Blast count at all times.
func (s *service) PreviewMusyawarahReminder(ctx context.Context) (map[string]interface{}, error) {
	// Use the exact same query as Blast — one source of truth
	recipients, err := s.repo.GetEligibleReminderRecipients(ctx)
	if err != nil {
		return nil, err
	}

	tpl, err := s.repo.GetTemplateByName(ctx, "event_musyawarah_reminder", ChannelEmail)
	if err != nil {
		return nil, ErrTemplateNotFound
	}

	return map[string]interface{}{
		"eligible_count": len(recipients),
		"recipients":     recipients, // included so frontend can show the list without a second API call
		"subject":        tpl.Subject,
		"body":           tpl.Body,
	}, nil
}

// ListMusyawarahReminderRecipients returns the paginated list of eligible recipients.
// Used by the recipient list panel in the Preview modal.
func (s *service) ListMusyawarahReminderRecipients(ctx context.Context, search string, page, limit int) ([]ReminderRecipient, int, error) {
	all, err := s.repo.GetEligibleReminderRecipients(ctx)
	if err != nil {
		return nil, 0, err
	}

	// Client-side filter by search
	if search != "" {
		searchLower := strings.ToLower(search)
		filtered := make([]ReminderRecipient, 0)
		for _, r := range all {
			if strings.Contains(strings.ToLower(r.FullName), searchLower) ||
				strings.Contains(strings.ToLower(r.Email), searchLower) ||
				strings.Contains(strings.ToLower(r.RegistrationNumber), searchLower) {
				filtered = append(filtered, r)
			}
		}
		all = filtered
	}

	total := len(all)
	if limit <= 0 {
		limit = 20
	}
	if page <= 0 {
		page = 1
	}
	start := (page - 1) * limit
	if start >= total {
		return []ReminderRecipient{}, total, nil
	}
	end := start + limit
	if end > total {
		end = total
	}
	return all[start:end], total, nil
}

func (s *service) BlastMusyawarahReminder(ctx context.Context, operatorID string, req BlastRequest) (BlastResult, error) {
	result := BlastResult{Requested: len(req.RecipientIDs)}

	if len(req.RecipientIDs) == 0 {
		return result, ErrNoRecipientsSelected
	}
	if strings.TrimSpace(req.Subject) == "" || strings.TrimSpace(req.Body) == "" {
		return result, errors.New("subject and body are required")
	}

	// Server-side eligibility re-validation — never trust frontend selection alone.
	// Any participant deleted or status-changed between Preview and Send is silently dropped.
	recipients, err := s.repo.GetEligibleRecipientsByIDs(ctx, req.RecipientIDs)
	if err != nil {
		return result, err
	}
	result.Eligible = len(recipients)
	result.Skipped = result.Requested - result.Eligible

	if result.Eligible == 0 {
		return result, nil
	}

	campaignID := "event_musyawarah_komitkabe_2026_reminder"

	// Fetch base template (used for its ID; actual subject/body come from req).
	tpl, err := s.repo.GetTemplateByName(ctx, "event_musyawarah_reminder", ChannelEmail)
	if err != nil {
		s.log.Error("Template not found for blast", zap.Error(err))
		return result, ErrTemplateNotFound
	}

	for _, rec := range recipients {
		// custom_subject and custom_body in payload are read by the worker
		// to override the template's stored content — no DB mutation needed.
		payloadObj := map[string]interface{}{
			"full_name":           rec.FullName,
			"registration_number": rec.RegistrationNumber,
			"campaign_id":         campaignID,
			"custom_subject":      req.Subject,
			"custom_body":         req.Body,
		}

		b, _ := json.Marshal(payloadObj)
		str := string(b)

		job := &NotificationJob{
			TemplateID: tpl.ID,
			Channel:    ChannelEmail,
			Recipient:  rec.Email,
			Payload:    &str,
			Status:     StatusPending,
		}

		queued, err := s.repo.QueueUniqueCampaignJob(ctx, job, campaignID)
		if err != nil {
			s.log.Error("Failed to safely queue unique campaign job", zap.String("email", rec.Email), zap.Error(err))
			continue
		}
		if queued {
			result.Queued++
		} else {
			// Already sent for this campaign — idempotency holds
			result.Skipped++
		}
	}

	// Mark draft as SENT if we actually queued anything or completed the blast
	_ = s.repo.MarkDraftAsSent(ctx, campaignID)

	return result, nil
}

func (s *service) SaveMusyawarahDraft(ctx context.Context, operatorID string, req DraftRequest) (*BroadcastDraft, error) {
	campaignID := "event_musyawarah_komitkabe_2026_reminder"

	idsJSON, _ := json.Marshal(req.RecipientIDs)
	idsStr := string(idsJSON)

	draft := &BroadcastDraft{
		CampaignID:   campaignID,
		Subject:      req.Subject,
		BodyHTML:     req.BodyHTML,
		RecipientIDs: &idsStr,
		CreatedBy:    &operatorID,
		UpdatedBy:    &operatorID,
	}

	if err := s.repo.SaveDraft(ctx, draft); err != nil {
		s.log.Error("Failed to save broadcast draft", zap.Error(err))
		return nil, err
	}

	return draft, nil
}

func (s *service) GetMusyawarahDraft(ctx context.Context) (*BroadcastDraft, error) {
	campaignID := "event_musyawarah_komitkabe_2026_reminder"
	draft, err := s.repo.GetActiveDraft(ctx, campaignID)
	if err != nil {
		return nil, err
	}
	return draft, nil
}

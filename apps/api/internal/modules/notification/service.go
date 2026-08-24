package notification

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

var (
	ErrTemplateNotFound = errors.New("notification template not found")
	ErrProviderNotFound = errors.New("notification provider not found")
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
	BlastMusyawarahReminder(ctx context.Context, operatorID string) (int, error)
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

func (s *service) PreviewMusyawarahReminder(ctx context.Context) (map[string]interface{}, error) {
	count, err := s.repo.CountEligibleReminderRecipients(ctx)
	if err != nil {
		return nil, err
	}

	tpl, err := s.repo.GetTemplateByName(ctx, "event_musyawarah_reminder", ChannelEmail)
	if err != nil {
		return nil, ErrTemplateNotFound
	}

	return map[string]interface{}{
		"eligible_count": count,
		"subject":        tpl.Subject,
		"body":           tpl.Body, // It's just the raw template for preview, or rendered with dummies if needed.
	}, nil
}

func (s *service) BlastMusyawarahReminder(ctx context.Context, operatorID string) (int, error) {
	recipients, err := s.repo.GetEligibleReminderRecipients(ctx)
	if err != nil {
		return 0, err
	}

	if len(recipients) == 0 {
		return 0, nil
	}

	// We can queue them without a transaction if there are too many, or we can use the repository's DB directly for batch insert.
	// Since QueueNotification creates them one by one, for a blast, it's safer to just range and QueueNotification. 
	// The worker will pick them up.
	queuedCount := 0
	for _, rec := range recipients {
		payload := map[string]interface{}{
			"full_name":           rec.FullName,
			"registration_number": rec.RegistrationNumber,
		}
		err := s.QueueNotification(ctx, ChannelEmail, "event_musyawarah_reminder", rec.Email, payload)
		if err == nil {
			queuedCount++
		} else {
			s.log.Error("Failed to queue reminder blast for recipient", zap.String("email", rec.Email), zap.Error(err))
		}
	}

	return queuedCount, nil
}

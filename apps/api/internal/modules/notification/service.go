package notification

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"go.uber.org/zap"
)

var (
	ErrTemplateNotFound = errors.New("notification template not found")
	ErrProviderNotFound = errors.New("notification provider not found")
)

type Service interface {
	QueueNotification(ctx context.Context, channel Channel, templateName, recipient string, payload map[string]interface{}) error
	Broadcast(ctx context.Context, channel Channel, templateName string, recipients []string, payload map[string]interface{}) error

	ListJobs(ctx context.Context) ([]NotificationJob, error)
	ListHistory(ctx context.Context) ([]NotificationHistory, error)
	ListTemplates(ctx context.Context) ([]NotificationTemplate, error)
	GetTemplate(ctx context.Context, id string) (*NotificationTemplate, error)
	UpdateTemplate(ctx context.Context, id string, subject *string, body string) error
	RetryJob(ctx context.Context, id string) error
	TestSMTP(ctx context.Context, email string) error
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

func (s *service) Broadcast(ctx context.Context, channel Channel, templateName string, recipients []string, payload map[string]interface{}) error {
	for _, r := range recipients {
		_ = s.QueueNotification(ctx, channel, templateName, r, payload)
	}
	return nil
}

func (s *service) ListJobs(ctx context.Context) ([]NotificationJob, error) {
	return s.repo.ListJobs(ctx, "")
}

func (s *service) ListHistory(ctx context.Context) ([]NotificationHistory, error) {
	return s.repo.ListHistory(ctx, "")
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

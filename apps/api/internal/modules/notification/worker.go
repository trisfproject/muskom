package notification

import (
	"bytes"
	"context"
	"encoding/json"
	"html/template"
	"time"

	"go.uber.org/zap"
)

type Worker struct {
	repo      Repository
	providers *ProviderRegistry
	log       *zap.Logger
}

func NewWorker(repo Repository, providers *ProviderRegistry, log *zap.Logger) *Worker {
	return &Worker{
		repo:      repo,
		providers: providers,
		log:       log,
	}
}

func (w *Worker) Start(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			w.log.Info("Notification worker stopped")
			return
		case <-ticker.C:
			w.processPendingJobs(ctx)
		}
	}
}

func (w *Worker) processPendingJobs(ctx context.Context) {
	jobs, err := w.repo.GetPendingJobs(ctx, 10)
	if err != nil {
		return // Silently ignore for mock
	}

	for _, job := range jobs {
		w.processJob(ctx, job)
	}
}

func (w *Worker) processJob(ctx context.Context, job NotificationJob) {
	// 1. Transition to Processing
	_ = w.repo.UpdateJobStatus(ctx, job.ID, StatusProcessing, nil)

	// 2. Fetch Provider
	provider := w.providers.Get(job.Channel)
	if provider == nil {
		errMsg := "Provider not found for channel"
		_ = w.repo.UpdateJobStatus(ctx, job.ID, StatusFailed, &errMsg)
		w.logHistory(ctx, job, StatusFailed, &errMsg)
		return
	}

	// 3. Render Template
	tpl, err := w.repo.GetTemplateByID(ctx, job.TemplateID)
	if err != nil {
		errMsg := "Template not found: " + err.Error()
		_ = w.repo.UpdateJobStatus(ctx, job.ID, StatusFailed, &errMsg)
		w.logHistory(ctx, job, StatusFailed, &errMsg)
		return
	}

	var payload map[string]interface{}
	if job.Payload != nil {
		_ = json.Unmarshal([]byte(*job.Payload), &payload)
	}

	// Parse body
	parsedBody, err := template.New("body").Parse(tpl.Body)
	if err != nil {
		errMsg := "Failed to parse body template: " + err.Error()
		_ = w.repo.UpdateJobStatus(ctx, job.ID, StatusFailed, &errMsg)
		w.logHistory(ctx, job, StatusFailed, &errMsg)
		return
	}

	var bodyBuf bytes.Buffer
	if err := parsedBody.Execute(&bodyBuf, payload); err != nil {
		errMsg := "Failed to execute body template: " + err.Error()
		_ = w.repo.UpdateJobStatus(ctx, job.ID, StatusFailed, &errMsg)
		w.logHistory(ctx, job, StatusFailed, &errMsg)
		return
	}
	body := bodyBuf.String()

	// Parse subject
	var subject *string
	if tpl.Subject != nil {
		parsedSubj, err := template.New("subject").Parse(*tpl.Subject)
		if err == nil {
			var subjBuf bytes.Buffer
			if err := parsedSubj.Execute(&subjBuf, payload); err == nil {
				s := subjBuf.String()
				subject = &s
			}
		}
	}

	// 4. Send
	err = provider.Send(ctx, job.Recipient, subject, body)

	// 5. Transition to Final State
	now := time.Now()
	if err != nil {
		errMsg := err.Error()
		_ = w.repo.UpdateJobStatus(ctx, job.ID, StatusFailed, &errMsg)
		w.logHistory(ctx, job, StatusFailed, &errMsg)
	} else {
		_ = w.repo.UpdateJobStatus(ctx, job.ID, StatusSent, nil)
		w.logHistory(ctx, job, StatusSent, nil)
	}
	_ = now // In real app, we use this for sent_at
}

func (w *Worker) logHistory(ctx context.Context, job NotificationJob, status JobStatus, errMsg *string) {
	now := time.Now()
	var sentAt *time.Time
	if status == StatusSent {
		sentAt = &now
	}

	history := &NotificationHistory{
		JobID:        &job.ID,
		Channel:      job.Channel,
		Recipient:    job.Recipient,
		Status:       status,
		SentAt:       sentAt,
		ErrorMessage: errMsg,
	}
	_ = w.repo.CreateHistory(ctx, history)
}

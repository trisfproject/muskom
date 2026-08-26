package notification

import (
	"context"
	"encoding/json"
	"strings"
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
	if payload == nil {
		payload = make(map[string]interface{})
	}

	// Inject website identity dynamic branding
	if identity, err := w.repo.GetWebsiteIdentity(ctx); err == nil && identity != nil {
		if title, ok := identity["website_title"].(string); ok && title != "" {
			payload["website_title"] = title
			payload["portal_title"] = title
		}
		if comm, ok := identity["community_name"].(string); ok && comm != "" {
			payload["organization_name"] = comm
			payload["community_name"] = comm
		}
		// Event details
		if eventName, ok := identity["event_name"].(string); ok && eventName != "" {
			payload["event_name"] = eventName
		} else if title, ok := identity["website_title"].(string); ok && title != "" {
			payload["event_name"] = title // fallback
		}
		// Event details
		if eventDate, ok := identity["event_date"].(string); ok && eventDate != "" {
			payload["event_date"] = eventDate
		}
		if eventTime, ok := identity["event_time"].(string); ok && eventTime != "" {
			payload["event_time"] = eventTime
		}
		if eventLoc, ok := identity["event_location"].(string); ok && eventLoc != "" {
			payload["event_location"] = eventLoc
		}

		var baseURL string
		if b, ok := identity["website_base_url"].(string); ok && b != "" {
			baseURL = strings.TrimRight(b, "/")
		}
		if baseURL != "" {
			for _, key := range []string{"participant_url", "participant_lookup_url", "lookup_url", "candidate_profile_url", "voting_url"} {
				if val, ok := payload[key].(string); ok && strings.HasPrefix(val, "/") {
					payload[key] = baseURL + val
				}
			}
		}
	}

	// Allow per-job subject/body override stored in payload (e.g. admin-composed blast).
	// These keys are written by BlastMusyawarahReminder when the admin edits the message.
	// They do NOT modify the template in the database.
	effectiveSubjectPtr := tpl.Subject
	effectiveBody := tpl.Body
	if cs, ok := payload["custom_subject"].(string); ok && cs != "" {
		effectiveSubjectPtr = &cs
	}
	if cb, ok := payload["custom_body"].(string); ok && cb != "" {
		effectiveBody = cb
	}

	renderedSubj, body, err := RenderTemplate(effectiveSubjectPtr, effectiveBody, payload)
	if err != nil {
		errMsg := "Template rendering failed: " + err.Error()
		_ = w.repo.UpdateJobStatus(ctx, job.ID, StatusFailed, &errMsg)
		w.logHistory(ctx, job, StatusFailed, &errMsg)
		return
	}

	var subject *string
	if renderedSubj != "" {
		subject = &renderedSubj
	}

	// 4. Send
	err = provider.Send(ctx, job.Recipient, subject, body, payload)

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

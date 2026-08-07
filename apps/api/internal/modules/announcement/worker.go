package announcement

import (
	"context"
	"encoding/json"
	"time"

	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/mailer"
	"github.com/trisfproject/muskom/apps/api/platform/realtime"
)

type Worker struct {
	repo     Repository
	mailer   mailer.Mailer
	hub      *realtime.Hub
	log      *zap.Logger
}

func NewWorker(repo Repository, mailer mailer.Mailer, hub *realtime.Hub, log *zap.Logger) *Worker {
	return &Worker{
		repo:     repo,
		mailer:   mailer,
		hub:      hub,
		log:      log,
	}
}

func (w *Worker) Start(ctx context.Context) {
	w.log.Info("Starting Announcement Broadcast Worker")
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			w.log.Info("Announcement Broadcast Worker stopped")
			return
		case <-ticker.C:
			w.processPendingJobs(ctx)
		}
	}
}

func (w *Worker) processPendingJobs(ctx context.Context) {
	jobs, err := w.repo.GetPendingBroadcastJobs(ctx)
	if err != nil {
		w.log.Error("Failed to fetch pending broadcast jobs", zap.Error(err))
		return
	}

	for _, job := range jobs {
		w.processJob(ctx, &job)
	}
}

func (w *Worker) processJob(ctx context.Context, job *BroadcastJob) {
	now := time.Now()
	job.Status = "Sending"
	job.StartedAt = &now
	w.repo.UpdateBroadcastJob(ctx, job)

	// Fetch Announcement
	ann, err := w.repo.GetAnnouncementByID(ctx, job.AnnouncementID)
	if err != nil || ann == nil {
		w.failJob(ctx, job, "Failed to load announcement")
		return
	}

	var channels []string
	json.Unmarshal([]byte(job.Channels), &channels)

	success := 0
	failed := 0

	// Simulated target resolution for RC1
	// In reality, query users based on job.TargetAudience
	var targetEmails []string
	// For "Admins"
	if job.TargetAudience == AudienceAdmins {
		// Mocked for now, in a real app query users repo
		targetEmails = []string{"admin@muskom.local"} 
	} else {
		targetEmails = []string{} 
	}

	total := len(targetEmails)
	if total == 0 {
		total = 1 // Prevent div by 0 for generic broadcasts like system-wide
	}

	for _, channel := range channels {
		if channel == "Email" {
			for _, email := range targetEmails {
				// We would normally construct an email with HTML layout
				err := w.mailer.SendRaw(email, ann.Title, ann.Content)
				if err != nil {
					failed++
					w.log.Error("Broadcast email failed", zap.Error(err), zap.String("email", email))
				} else {
					success++
				}
			}
		} else if channel == "In-App" {
			// For In-App, we just broadcast via websocket
			payload := map[string]interface{}{
				"id": ann.ID,
				"title": ann.Title,
				"summary": ann.Summary,
				"category": ann.Category,
				"created_at": ann.CreatedAt,
			}
			msg, _ := json.Marshal(map[string]interface{}{
				"type": "NEW_ANNOUNCEMENT",
				"payload": payload,
			})
			w.hub.Broadcast(msg)
			success++
		}
	}

	job.Status = "Delivered"
	if failed > 0 {
		job.Status = "Failed"
		msg := "Some deliveries failed"
		job.ErrorMessage = &msg
	}

	end := time.Now()
	job.CompletedAt = &end
	job.TotalTargets = total
	job.SuccessfulDeliveries = success
	job.FailedDeliveries = failed

	w.repo.UpdateBroadcastJob(ctx, job)
	w.log.Info("Broadcast job completed", zap.String("id", job.ID))
}

func (w *Worker) failJob(ctx context.Context, job *BroadcastJob, msg string) {
	now := time.Now()
	job.Status = "Failed"
	job.ErrorMessage = &msg
	job.CompletedAt = &now
	w.repo.UpdateBroadcastJob(ctx, job)
}

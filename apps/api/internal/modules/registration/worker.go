package registration

import (
	"context"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/mailer"
)

type EmailWorker struct {
	db        *sqlx.DB
	repo      Repository
	log       *zap.Logger
	mailerSvc mailer.Mailer
	cfg       *config.Config
	stopCh    chan struct{}
}

func NewEmailWorker(db *sqlx.DB, log *zap.Logger, mailerSvc mailer.Mailer, cfg *config.Config) *EmailWorker {
	return &EmailWorker{
		db:        db,
		repo:      NewRepository(db),
		log:       log,
		mailerSvc: mailerSvc,
		cfg:       cfg,
		stopCh:    make(chan struct{}),
	}
}

func (w *EmailWorker) Start() {
	w.log.Info("Starting Registration Email Worker")
	go w.runLoop()
}

func (w *EmailWorker) Stop() {
	w.log.Info("Stopping Registration Email Worker")
	close(w.stopCh)
}

func (w *EmailWorker) runLoop() {
	ticker := time.NewTicker(10 * time.Second) // Poll every 10 seconds
	defer ticker.Stop()

	for {
		select {
		case <-w.stopCh:
			return
		case <-ticker.C:
			w.processQueue()
		}
	}
}

func (w *EmailWorker) processQueue() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	// Get up to 10 pending emails
	logs, err := w.repo.GetPendingEmails(ctx, 10)
	if err != nil {
		w.log.Error("Failed to fetch pending emails", zap.Error(err))
		return
	}

	for _, logItem := range logs {
		// Only retry failed emails if 1 minute has passed since last retry/sent_at
		if logItem.Status == "FAILED" && logItem.LastRetryAt != nil {
			if time.Since(*logItem.LastRetryAt) < 1*time.Minute {
				continue
			}
		}

		err := w.sendEmail(ctx, logItem)
		if err != nil {
			w.log.Error("Failed to send queued email", zap.Error(err), zap.String("id", logItem.ID))
			errMsg := err.Error()
			_ = w.repo.UpdateEmailLogStatus(ctx, logItem.ID, "FAILED", &errMsg)
		} else {
			_ = w.repo.UpdateEmailLogStatus(ctx, logItem.ID, "SENT", nil)
		}
	}
}

func (w *EmailWorker) sendEmail(ctx context.Context, logItem EmailLog) error {
	// Fetch registration to get name, etc
	reg, err := w.repo.GetRegistrationByID(ctx, logItem.RegistrationID)
	if err != nil {
		return fmt.Errorf("failed to get registration: %w", err)
	}

	var subject string
	var htmlContent string

	switch logItem.EmailType {
	case "REGISTRATION_RECEIVED":
		subject = "Registration Received - {{.portal_title}}"
		htmlContent = "<h2>Registration Received</h2>" +
			"<p>Hello,</p>" +
			"<p>Your registration for {{.portal_title}} has been received.</p>" +
			"<ul>" +
			"<li><strong>Submission ID:</strong> " + reg.ID + "</li>" +
			"<li><strong>Time:</strong> " + reg.CreatedAt.Format("2006-01-02 15:04:05") + "</li>" +
			"<li><strong>Status:</strong> Pending Verification</li>" +
			"</ul>" +
			"<p>Please wait for administrator approval.</p>"

	case "REGISTRATION_APPROVED":
		if reg.RegistrationNumber == nil {
			return fmt.Errorf("cannot send approval email, registration number is missing")
		}
		qrUrl := fmt.Sprintf("%s/api/v1/public/qr/%s.png", w.cfg.AppBaseURL, *reg.RegistrationNumber)
		lookupUrl := fmt.Sprintf("%s/peserta", w.cfg.AppBaseURL)
		
		subject = "Registration Approved - {{.portal_title}}"
		htmlContent = "<h2>Registration Approved</h2>" +
			"<p>Hello,</p>" +
			"<p>Your registration for {{.portal_title}} has been approved.</p>" +
			"<ul>" +
			"<li><strong>Registration Number:</strong> " + *reg.RegistrationNumber + "</li>" +
			"<li><strong>QR Code:</strong> <img src='" + qrUrl + "' alt='QR Code' /></li>" +
			"<li><strong>Participant Lookup:</strong> <a href='" + lookupUrl + "'>" + lookupUrl + "</a></li>" +
			"</ul>" +
			"<p>See you at the event!</p>"

	case "REGISTRATION_REJECTED":
		subject = "Registration Update - {{.portal_title}}"
		reason := "No reason provided."
		if reg.RejectionReason != nil {
			reason = *reg.RejectionReason
		}
		htmlContent = "<h2>Registration Update</h2>" +
			"<p>Hello,</p>" +
			"<p>We regret to inform you that your registration for {{.portal_title}} was not approved.</p>" +
			"<p><strong>Reason:</strong> " + reason + "</p>" +
			"<p>If you have any questions, please contact our secretariat.</p>"
	default:
		return fmt.Errorf("unknown email type: %s", logItem.EmailType)
	}

	return w.mailerSvc.SendRaw(logItem.RecipientEmail, subject, htmlContent)
}

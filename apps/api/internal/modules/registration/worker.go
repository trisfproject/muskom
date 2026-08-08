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
	// Verify email_logs table exists before starting worker
	var exists bool
	query := `SELECT EXISTS (
		SELECT FROM information_schema.tables 
		WHERE table_schema = 'public'
		AND table_name = 'email_logs'
	)`
	
	err := w.db.QueryRowContext(context.Background(), query).Scan(&exists)
	if err != nil {
		w.log.Error("Registration Email Worker disabled: error checking email_logs table", zap.Error(err))
		return
	}
	if !exists {
		w.log.Error("Registration Email Worker disabled: email_logs table does not exist")
		return
	}

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
		err := w.sendEmail(ctx, logItem)
		if err != nil {
			w.log.Error("Failed to send queued email", zap.Error(err), zap.String("id", logItem.ID))
			
			// Calculate next retry based on new retry count (which will be logItem.RetryCount + 1)
			newRetryCount := logItem.RetryCount + 1
			var nextRetryAt time.Time
			
			switch newRetryCount {
			case 1:
				nextRetryAt = time.Now().Add(1 * time.Minute)
			case 2:
				nextRetryAt = time.Now().Add(5 * time.Minute)
			case 3:
				nextRetryAt = time.Now().Add(15 * time.Minute)
			case 4:
				nextRetryAt = time.Now().Add(1 * time.Hour)
			default:
				nextRetryAt = time.Now().Add(6 * time.Hour)
			}
			
			_ = w.repo.UpdateEmailLogFailure(ctx, logItem.ID, err.Error(), &nextRetryAt)
			
			if newRetryCount >= logItem.MaxRetry {
				w.log.Error("Email permanently failed after max retries.", zap.String("id", logItem.ID))
			}
		} else {
			_ = w.repo.UpdateEmailLogSuccess(ctx, logItem.ID)
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
	portalTitle, _ := w.repo.GetPortalTitle(ctx)

	switch logItem.EmailType {
	case "REGISTRATION_RECEIVED":
		subject = "Registration Received - " + portalTitle
		htmlContent = "<h2>Registration Received</h2>" +
			"<p>Hello,</p>" +
			"<p>Your registration for " + portalTitle + " has been received.</p>" +
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
		
		subject = "Registration Approved - " + portalTitle
		htmlContent = "<h2>Registration Approved</h2>" +
			"<p>Hello,</p>" +
			"<p>Your registration for " + portalTitle + " has been approved.</p>" +
			"<ul>" +
			"<li><strong>Registration Number:</strong> " + *reg.RegistrationNumber + "</li>" +
			"<li><strong>QR Code:</strong> <img src='" + qrUrl + "' alt='QR Code' /></li>" +
			"<li><strong>Participant Lookup:</strong> <a href='" + lookupUrl + "'>" + lookupUrl + "</a></li>" +
			"</ul>" +
			"<p>See you at the event!</p>"

	case "REGISTRATION_REJECTED":
		subject = "Registration Update - " + portalTitle
		reason := "No reason provided."
		if reg.RejectionReason != nil {
			reason = *reg.RejectionReason
		}
		htmlContent = "<h2>Registration Update</h2>" +
			"<p>Hello,</p>" +
			"<p>We regret to inform you that your registration for " + portalTitle + " was not approved.</p>" +
			"<p><strong>Reason:</strong> " + reason + "</p>" +
			"<p>If you have any questions, please contact our secretariat.</p>"
	default:
		return fmt.Errorf("unknown email type: %s", logItem.EmailType)
	}

	return w.mailerSvc.SendRaw(logItem.RecipientEmail, subject, htmlContent)
}

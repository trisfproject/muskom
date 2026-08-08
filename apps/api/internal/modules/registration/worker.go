package registration

import (
	"context"
	"fmt"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/internal/modules/notification"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/mailer"
)

type EmailWorker struct {
	db        *sqlx.DB
	repo      Repository
	notifRepo notification.Repository
	log       *zap.Logger
	mailerSvc mailer.Mailer
	cfg       *config.Config
	stopCh    chan struct{}
	mu        sync.Mutex
}

func NewEmailWorker(db *sqlx.DB, log *zap.Logger, mailerSvc mailer.Mailer, cfg *config.Config, notifRepo ...notification.Repository) *EmailWorker {
	var nr notification.Repository
	if len(notifRepo) > 0 && notifRepo[0] != nil {
		nr = notifRepo[0]
	} else {
		nr = notification.NewRepository(db)
	}

	return &EmailWorker{
		db:        db,
		repo:      NewRepository(db),
		notifRepo: nr,
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
	if !w.mu.TryLock() {
		return
	}
	defer w.mu.Unlock()

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
			maxRetry := logItem.MaxRetry
			if maxRetry <= 0 {
				maxRetry = 5
			}
			
			var nextRetryAt *time.Time
			if newRetryCount < maxRetry {
				var t time.Time
				switch newRetryCount {
				case 1:
					t = time.Now().Add(1 * time.Minute)
				case 2:
					t = time.Now().Add(5 * time.Minute)
				case 3:
					t = time.Now().Add(15 * time.Minute)
				case 4:
					t = time.Now().Add(1 * time.Hour)
				default:
					t = time.Now().Add(6 * time.Hour)
				}
				nextRetryAt = &t
			}
			
			_ = w.repo.UpdateEmailLogFailure(ctx, logItem.ID, err.Error(), nextRetryAt)
			
			if newRetryCount >= maxRetry {
				w.log.Error("Email permanently failed after max retries.", zap.String("id", logItem.ID), zap.Int("retry_count", newRetryCount), zap.Int("max_retry", maxRetry))
			}
		} else {
			_ = w.repo.UpdateEmailLogSuccess(ctx, logItem.ID)
		}
	}
}

// resolvePublicBaseURL returns the public-facing website base URL.
// Priority: (1) system_configurations.website_identity.website_base_url,
//
//	(2) config.AppBaseURL,
//	(3) empty string (caller must handle).
func (w *EmailWorker) resolvePublicBaseURL(ctx context.Context) string {
	// Try DB first (allows admin to configure without redeploying)
	if dbURL, err := w.repo.GetPublicBaseURL(ctx); err == nil && dbURL != "" {
		return dbURL
	}
	// Fall back to env config
	if w.cfg != nil && w.cfg.AppBaseURL != "" {
		return strings.TrimRight(w.cfg.AppBaseURL, "/")
	}
	return ""
}

func (w *EmailWorker) sendEmail(ctx context.Context, logItem EmailLog) error {
	// 1. Fetch registration detail with person info
	regAdmin, err := w.repo.GetRegistrationAdminByID(ctx, logItem.RegistrationID)
	if err != nil {
		return fmt.Errorf("failed to get registration detail: %w", err)
	}

	// 2. Fetch Website Identity branding for Portal Title
	portalTitle, err := w.repo.GetPortalTitle(ctx)
	if err != nil || portalTitle == "" {
		portalTitle = "Musyawarah"
	}

	// 3. Map EmailType to Notification Template Name
	var templateName string
	switch logItem.EmailType {
	case "REGISTRATION_RECEIVED":
		templateName = "participant_registration_submitted"
	case "REGISTRATION_APPROVED":
		templateName = "participant_registration_approved"
	case "REGISTRATION_REJECTED":
		templateName = "participant_registration_rejected"
	default:
		return fmt.Errorf("unknown email type: %s", logItem.EmailType)
	}

	// 4. Fetch template from database
	tpl, err := w.notifRepo.GetTemplateByName(ctx, templateName, notification.ChannelEmail)
	if err != nil {
		return fmt.Errorf("failed to get email template %s: %w", templateName, err)
	}
	if tpl == nil {
		return fmt.Errorf("email template %s not found", templateName)
	}

	// 5. Resolve public base URL (DB config → env config)
	regNum := regAdmin.RegistrationNumber
	if logItem.EmailType == "REGISTRATION_APPROVED" && regNum == "" {
		return fmt.Errorf("cannot send approved email: registration number is empty for registration %s", logItem.RegistrationID)
	}

	baseURL := w.resolvePublicBaseURL(ctx)

	if baseURL == "" {
		baseURL = "https://muskom.komitkabe.com" // Safety fallback per requirement
	}
	
	// 6. Build participant lookup URL (always absolute)
	lookupQuery := regNum
	if lookupQuery == "" {
		lookupQuery = regAdmin.Email
	}

	var lookupURL string
	if lookupQuery != "" {
		lookupURL = fmt.Sprintf("%s/peserta?q=%s", baseURL, url.QueryEscape(lookupQuery))
	} else {
		lookupURL = fmt.Sprintf("%s/peserta", baseURL)
	}

	// 7. Construct payload
	rejectionReason := regAdmin.SpecialNotes
	if rejectionReason == "" {
		rejectionReason = "Persyaratan belum terpenuhi"
	}

	payload := map[string]interface{}{
		"portal_title":            portalTitle,
		"event_name":              portalTitle,
		"community_name":          portalTitle,
		"full_name":               regAdmin.ParticipantName,
		"participant_name":        regAdmin.ParticipantName,
		"name":                    regAdmin.ParticipantName,
		"registration_number":     regNum,
		"reg_number":              regNum,
		"participant_lookup_url":  lookupURL,
		"lookup_url":              lookupURL,
		"participant_url":         lookupURL, // Alias as per user request
		"qr_code":                 "",
		"qr_code_url":             "",
		"rejection_reason":        rejectionReason,
		"reason":                  rejectionReason,
		"company":                 regAdmin.Company,
		"company_name":            regAdmin.Company,
		"job_title":               regAdmin.JobTitle,
		"phone":                   regAdmin.Phone,
		"email":                   regAdmin.Email,
		"event_date":              "",
		"event_time":              "",
		"event_location":          "",
		"venue":                   "",
	}

	if identity, err := w.notifRepo.GetWebsiteIdentity(ctx); err == nil && identity != nil {
		if title, ok := identity["website_title"].(string); ok && title != "" {
			payload["website_title"] = title
			payload["portal_title"] = title
			payload["event_name"] = title
		}
		if comm, ok := identity["community_name"].(string); ok && comm != "" {
			payload["organization_name"] = comm
			payload["community_name"] = comm
		}
		if eventName, ok := identity["event_name"].(string); ok && eventName != "" {
			payload["event_name"] = eventName
			payload["website_title"] = eventName
		}
		if eventDate, ok := identity["event_date"].(string); ok && eventDate != "" {
			payload["event_date"] = eventDate
		}
		if eventTime, ok := identity["event_time"].(string); ok && eventTime != "" {
			payload["event_time"] = eventTime
		}
		if eventLoc, ok := identity["event_location"].(string); ok && eventLoc != "" {
			payload["event_location"] = eventLoc
			payload["venue"] = eventLoc
		}
	}

	// 8. Render template using shared renderer
	subject, bodyHTML, err := notification.RenderTemplate(tpl.Subject, tpl.Body, payload)
	if err != nil {
		return fmt.Errorf("failed to render email template: %w", err)
	}

	if subject == "" {
		subject = "Pemberitahuan Pendaftaran - " + portalTitle
	}

	// 9. Send email (no attachments — QR removed for RC1)
	return w.mailerSvc.SendRawWithAttachments(logItem.RecipientEmail, subject, bodyHTML, nil)
}


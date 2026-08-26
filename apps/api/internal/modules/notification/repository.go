package notification

import (
	"context"
	"encoding/json"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetTemplateByName(ctx context.Context, name string, channel Channel) (*NotificationTemplate, error)
	GetTemplateByID(ctx context.Context, id string) (*NotificationTemplate, error)
	CreateTemplate(ctx context.Context, tpl *NotificationTemplate) error
	CreateJob(ctx context.Context, job *NotificationJob) error
	CreateJobTx(ctx context.Context, tx *sqlx.Tx, job *NotificationJob) error
	GetPendingJobs(ctx context.Context, limit int) ([]NotificationJob, error)
	UpdateJobStatus(ctx context.Context, id string, status JobStatus, errMsg *string) error
	CreateHistory(ctx context.Context, history *NotificationHistory) error
	ListJobs(ctx context.Context, eventID string) ([]NotificationJob, error)
	ListHistory(ctx context.Context, page, limit int) ([]NotificationHistory, int, error)
	ListTemplates(ctx context.Context) ([]NotificationTemplate, error)
	UpdateTemplate(ctx context.Context, id string, subject *string, body string) error
	RetryJob(ctx context.Context, id string) error

	// In-App Notification Methods
	CreateInAppNotification(ctx context.Context, notif *InAppNotification) error
	ListInAppNotifications(ctx context.Context, userID *string, limit int, offset int) ([]InAppNotification, int, error)
	GetUnreadInAppCount(ctx context.Context, userID *string) (int, error)
	MarkInAppRead(ctx context.Context, id string) error
	MarkAllInAppRead(ctx context.Context, userID *string) error
	DeleteInAppNotification(ctx context.Context, id string) error
	GetWebsiteIdentity(ctx context.Context) (map[string]interface{}, error)
	GetEligibleReminderRecipients(ctx context.Context) ([]ReminderRecipient, error)
	GetEligibleRecipientsByIDs(ctx context.Context, ids []string) ([]ReminderRecipient, error)
	QueueUniqueCampaignJob(ctx context.Context, job *NotificationJob, campaignID string) (bool, error)
	
	// Draft Methods
	SaveDraft(ctx context.Context, draft *BroadcastDraft) error
	GetActiveDraft(ctx context.Context, campaignID string) (*BroadcastDraft, error)
	MarkDraftAsSent(ctx context.Context, campaignID string) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ... existing methods ...

func (r *repository) SaveDraft(ctx context.Context, draft *BroadcastDraft) error {
	query := `
		INSERT INTO broadcast_drafts (campaign_id, subject, body_html, recipient_ids, status, created_by, updated_by)
		VALUES ($1, $2, $3, $4, 'DRAFT', $5, $6)
		ON CONFLICT (campaign_id) WHERE status = 'DRAFT'
		DO UPDATE SET 
			subject = EXCLUDED.subject, 
			body_html = EXCLUDED.body_html, 
			recipient_ids = EXCLUDED.recipient_ids,
			updated_by = EXCLUDED.updated_by,
			updated_at = CURRENT_TIMESTAMP
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query,
		draft.CampaignID, draft.Subject, draft.BodyHTML, draft.RecipientIDs, draft.CreatedBy, draft.UpdatedBy,
	).Scan(&draft.ID, &draft.CreatedAt, &draft.UpdatedAt)
}

func (r *repository) GetActiveDraft(ctx context.Context, campaignID string) (*BroadcastDraft, error) {
	var draft BroadcastDraft
	query := `SELECT * FROM broadcast_drafts WHERE campaign_id = $1 AND status = 'DRAFT'`
	err := r.db.GetContext(ctx, &draft, query, campaignID)
	return &draft, err
}

func (r *repository) MarkDraftAsSent(ctx context.Context, campaignID string) error {
	query := `UPDATE broadcast_drafts SET status = 'SENT', updated_at = CURRENT_TIMESTAMP WHERE campaign_id = $1 AND status = 'DRAFT'`
	_, err := r.db.ExecContext(ctx, query, campaignID)
	return err
}

// ... existing code ...
func (r *repository) GetTemplateByName(ctx context.Context, name string, channel Channel) (*NotificationTemplate, error) {
	var tpl NotificationTemplate
	// For architecture, returning the latest global or event-specific template
	query := `SELECT * FROM notification_templates WHERE name = $1 AND channel = $2 ORDER BY created_at DESC LIMIT 1`
	err := r.db.GetContext(ctx, &tpl, query, name, channel)
	return &tpl, err
}

func (r *repository) GetTemplateByID(ctx context.Context, id string) (*NotificationTemplate, error) {
	var tpl NotificationTemplate
	query := `SELECT * FROM notification_templates WHERE id = $1`
	err := r.db.GetContext(ctx, &tpl, query, id)
	return &tpl, err
}

func (r *repository) CreateTemplate(ctx context.Context, tpl *NotificationTemplate) error {
	query := `
		INSERT INTO notification_templates (name, channel, subject, body)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query, tpl.Name, tpl.Channel, tpl.Subject, tpl.Body).
		Scan(&tpl.ID, &tpl.CreatedAt)
}

func (r *repository) CreateJob(ctx context.Context, job *NotificationJob) error {
	query := `
		INSERT INTO notification_jobs ( template_id, channel, recipient, payload, status)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query,
		job.TemplateID, job.Channel, job.Recipient, job.Payload, job.Status,
	).Scan(&job.ID, &job.CreatedAt, &job.UpdatedAt)
}

func (r *repository) CreateJobTx(ctx context.Context, tx *sqlx.Tx, job *NotificationJob) error {
	query := `
		INSERT INTO notification_jobs ( template_id, channel, recipient, payload, status)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	return tx.QueryRowContext(ctx, query,
		job.TemplateID, job.Channel, job.Recipient, job.Payload, job.Status,
	).Scan(&job.ID, &job.CreatedAt, &job.UpdatedAt)
}

func (r *repository) GetPendingJobs(ctx context.Context, limit int) ([]NotificationJob, error) {
	var jobs []NotificationJob
	query := `SELECT * FROM notification_jobs WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT $1`
	err := r.db.SelectContext(ctx, &jobs, query, limit)
	return jobs, err
}

func (r *repository) UpdateJobStatus(ctx context.Context, id string, status JobStatus, errMsg *string) error {
	query := `UPDATE notification_jobs SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3`
	_, err := r.db.ExecContext(ctx, query, status, errMsg, id)
	return err
}

func (r *repository) CreateHistory(ctx context.Context, history *NotificationHistory) error {
	query := `
		INSERT INTO notification_history (job_id, channel, recipient, status, sent_at, error_message)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	return r.db.QueryRowContext(ctx, query,
		history.JobID, history.Channel, history.Recipient, history.Status, history.SentAt, history.ErrorMessage,
	).Scan(&history.ID)
}

func (r *repository) ListJobs(ctx context.Context, _ string) ([]NotificationJob, error) {
	var jobs []NotificationJob
	query := `SELECT * FROM notification_jobs ORDER BY created_at DESC LIMIT 50`
	err := r.db.SelectContext(ctx, &jobs, query)
	return jobs, err
}

func (r *repository) ListHistory(ctx context.Context, page, limit int) ([]NotificationHistory, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	var total int
	countQuery := `
		SELECT COUNT(1) FROM (
			SELECT id FROM email_logs
			UNION ALL
			SELECT id FROM notification_history
		) as combined_logs
	`
	if err := r.db.GetContext(ctx, &total, countQuery); err != nil {
		return nil, 0, err
	}

	var history []NotificationHistory
	query := `
		SELECT * FROM (
			SELECT 
				id, 
				NULL::uuid as job_id, 
				'EMAIL' as channel, 
				recipient_email as recipient, 
				status, 
				COALESCE(sent_at, updated_at) as sent_at, 
				last_error as error_message,
				email_type as template
			FROM email_logs
			UNION ALL
			SELECT 
				nh.id, 
				nh.job_id, 
				nh.channel, 
				nh.recipient, 
				nh.status, 
				nh.sent_at, 
				nh.error_message,
				COALESCE(nt.name, '') as template
			FROM notification_history nh
			LEFT JOIN notification_jobs nj ON nh.job_id = nj.id
			LEFT JOIN notification_templates nt ON nj.template_id = nt.id
		) as combined_logs
		ORDER BY sent_at DESC NULLS LAST, id DESC
		LIMIT $1 OFFSET $2
	`
	err := r.db.SelectContext(ctx, &history, query, limit, offset)
	if history == nil {
		history = []NotificationHistory{}
	}
	return history, total, err
}

func (r *repository) ListTemplates(ctx context.Context) ([]NotificationTemplate, error) {
	var tpls []NotificationTemplate
	query := `SELECT * FROM notification_templates ORDER BY created_at DESC`
	err := r.db.SelectContext(ctx, &tpls, query)
	return tpls, err
}

func (r *repository) UpdateTemplate(ctx context.Context, id string, subject *string, body string) error {
	query := `UPDATE notification_templates SET subject = $1, body = $2, updated_at = NOW() WHERE id = $3`
	_, err := r.db.ExecContext(ctx, query, subject, body, id)
	return err
}

func (r *repository) RetryJob(ctx context.Context, id string) error {
	query := `UPDATE notification_jobs SET status = 'PENDING', error_message = NULL, updated_at = NOW() WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *repository) CreateInAppNotification(ctx context.Context, notif *InAppNotification) error {
	query := `
		INSERT INTO in_app_notifications (user_id, type, priority, title, message, action_url)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, is_read, created_at
	`
	return r.db.QueryRowContext(ctx, query,
		notif.UserID, notif.Type, notif.Priority, notif.Title, notif.Message, notif.ActionURL,
	).Scan(&notif.ID, &notif.IsRead, &notif.CreatedAt)
}

func (r *repository) ListInAppNotifications(ctx context.Context, userID *string, limit int, offset int) ([]InAppNotification, int, error) {
	var notifs []InAppNotification
	var total int

	countQuery := `SELECT COUNT(*) FROM in_app_notifications WHERE user_id = $1 OR user_id IS NULL`
	if err := r.db.GetContext(ctx, &total, countQuery, userID); err != nil {
		return nil, 0, err
	}

	query := `
		SELECT * FROM in_app_notifications 
		WHERE user_id = $1 OR user_id IS NULL
		ORDER BY created_at DESC 
		LIMIT $2 OFFSET $3
	`
	err := r.db.SelectContext(ctx, &notifs, query, userID, limit, offset)
	return notifs, total, err
}

func (r *repository) GetUnreadInAppCount(ctx context.Context, userID *string) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM in_app_notifications WHERE (user_id = $1 OR user_id IS NULL) AND is_read = FALSE`
	err := r.db.GetContext(ctx, &count, query, userID)
	return count, err
}

func (r *repository) MarkInAppRead(ctx context.Context, id string) error {
	query := `UPDATE in_app_notifications SET is_read = TRUE, read_at = NOW() WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *repository) MarkAllInAppRead(ctx context.Context, userID *string) error {
	query := `UPDATE in_app_notifications SET is_read = TRUE, read_at = NOW() WHERE (user_id = $1 OR user_id IS NULL) AND is_read = FALSE`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}

func (r *repository) DeleteInAppNotification(ctx context.Context, id string) error {
	query := `DELETE FROM in_app_notifications WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *repository) GetWebsiteIdentity(ctx context.Context) (map[string]interface{}, error) {
	query := `SELECT group_name, settings FROM system_configurations WHERE group_name IN ('website_identity', 'event')`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	combined := make(map[string]interface{})
	for rows.Next() {
		var groupName, settingsStr string
		if err := rows.Scan(&groupName, &settingsStr); err != nil {
			continue
		}
		var settings map[string]interface{}
		if err := json.Unmarshal([]byte(settingsStr), &settings); err == nil {
			for k, v := range settings {
				combined[k] = v
			}
		}
	}
	return combined, nil
}

func (r *repository) GetEligibleReminderRecipients(ctx context.Context) ([]ReminderRecipient, error) {
	query := `
		SELECT 
			r.id, 
			p.email, 
			p.full_name, 
			COALESCE(r.registration_number, '') AS registration_number, 
			r.status
		FROM registrations r
		JOIN persons p ON r.person_id = p.id
		WHERE UPPER(TRIM(r.status)) IN ('APPROVED', 'VERIFIED')
		  AND p.email IS NOT NULL
		  AND TRIM(p.email) != ''
		ORDER BY r.registration_number ASC
	`
	var recipients []ReminderRecipient
	err := r.db.SelectContext(ctx, &recipients, query)
	return recipients, err
}

func (r *repository) GetEligibleRecipientsByIDs(ctx context.Context, ids []string) ([]ReminderRecipient, error) {
	if len(ids) == 0 {
		return []ReminderRecipient{}, nil
	}
	query, args, err := sqlx.In(`
		SELECT 
			r.id, 
			p.email, 
			p.full_name, 
			COALESCE(r.registration_number, '') AS registration_number, 
			r.status
		FROM registrations r
		JOIN persons p ON r.person_id = p.id
		WHERE r.id IN (?)
		  AND UPPER(TRIM(r.status)) IN ('APPROVED', 'VERIFIED')
		  AND p.email IS NOT NULL
		  AND TRIM(p.email) != ''
		ORDER BY r.registration_number ASC
	`, ids)
	if err != nil {
		return nil, err
	}
	query = r.db.Rebind(query)
	var recipients []ReminderRecipient
	err = r.db.SelectContext(ctx, &recipients, query, args...)
	return recipients, err
}

// CountEligibleReminderRecipients is kept for any internal use but not in the Repository interface.

func (r *repository) QueueUniqueCampaignJob(ctx context.Context, job *NotificationJob, campaignID string) (bool, error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return false, err
	}
	defer tx.Rollback()

	// Advisory lock based on campaign + recipient
	// Using Postgres pg_advisory_xact_lock with a hash. It will automatically release on commit/rollback.
	// We use the builtin hashtext function in Postgres to avoid importing hash libraries in Go and converting to int64 safely.
	_, err = tx.ExecContext(ctx, "SELECT pg_advisory_xact_lock(hashtext($1))", campaignID+":"+job.Recipient)
	if err != nil {
		return false, err
	}

	// Check idempotency again within the lock
	var exists bool
	checkQuery := `
		SELECT EXISTS (
			SELECT 1 FROM notification_jobs
			WHERE recipient = $1
			  AND payload::jsonb ->> 'campaign_id' = $2
			  AND status != 'FAILED'
		)
	`
	err = tx.GetContext(ctx, &exists, checkQuery, job.Recipient, campaignID)
	if err != nil {
		return false, err
	}
	if exists {
		return false, nil // Already exists, safely skip
	}

	// Insert the job, letting the database generate id, created_at, updated_at
	insertQuery := `
		INSERT INTO notification_jobs (
			template_id, channel, recipient, payload, status, retry_count
		) VALUES (
			$1, $2, $3, $4, $5, $6
		) RETURNING id, created_at, updated_at
	`
	err = tx.QueryRowContext(ctx, insertQuery,
		job.TemplateID, job.Channel, job.Recipient, job.Payload, job.Status, job.RetryCount,
	).Scan(&job.ID, &job.CreatedAt, &job.UpdatedAt)
	if err != nil {
		return false, err
	}

	err = tx.Commit()
	return true, err
}


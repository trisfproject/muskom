package notification

import (
	"context"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetTemplateByName(ctx context.Context, name string, channel Channel) (*NotificationTemplate, error)
	GetTemplateByID(ctx context.Context, id string) (*NotificationTemplate, error)
	CreateJob(ctx context.Context, job *NotificationJob) error
	GetPendingJobs(ctx context.Context, limit int) ([]NotificationJob, error)
	UpdateJobStatus(ctx context.Context, id string, status JobStatus, errMsg *string) error
	CreateHistory(ctx context.Context, history *NotificationHistory) error
	ListJobs(ctx context.Context, eventID string) ([]NotificationJob, error)
	ListHistory(ctx context.Context, eventID string) ([]NotificationHistory, error)
	ListTemplates(ctx context.Context) ([]NotificationTemplate, error)
	UpdateTemplate(ctx context.Context, id string, subject *string, body string) error
	RetryJob(ctx context.Context, id string) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

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

func (r *repository) ListHistory(ctx context.Context, _ string) ([]NotificationHistory, error) {
	var history []NotificationHistory
	query := `SELECT * FROM notification_history ORDER BY sent_at DESC NULLS LAST LIMIT 50`
	err := r.db.SelectContext(ctx, &history, query)
	return history, err
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

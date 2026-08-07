package announcement

import (
	"context"
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type Repository interface {
	CreateAnnouncement(ctx context.Context, ann *Announcement) error
	GetAnnouncementByID(ctx context.Context, id string) (*Announcement, error)
	GetAnnouncementBySlug(ctx context.Context, slug string) (*Announcement, error)
	UpdateAnnouncement(ctx context.Context, ann *Announcement) error
	DeleteAnnouncement(ctx context.Context, id string) error
	ListAnnouncements(ctx context.Context, publicOnly bool) ([]Announcement, error)
	
	CreateBroadcastJob(ctx context.Context, job *BroadcastJob) error
	UpdateBroadcastJob(ctx context.Context, job *BroadcastJob) error
	GetBroadcastJob(ctx context.Context, id string) (*BroadcastJob, error)
	ListBroadcastJobs(ctx context.Context, limit int, offset int) ([]BroadcastJob, error)
	
	GetPendingBroadcastJobs(ctx context.Context) ([]BroadcastJob, error)
}

type repository struct {
	db  *sqlx.DB
	log *zap.Logger
}

func NewRepository(db *sqlx.DB, log *zap.Logger) Repository {
	return &repository{
		db:  db,
		log: log,
	}
}

func (r *repository) CreateAnnouncement(ctx context.Context, ann *Announcement) error {
	query := `
		INSERT INTO announcements (
			id, title, slug, summary, content, thumbnail_url, category, priority, status, 
			attachments, pinned, publish_date, expire_date, created_by, updated_by, created_at, updated_at
		) VALUES (
			:id, :title, :slug, :summary, :content, :thumbnail_url, :category, :priority, :status, 
			:attachments, :pinned, :publish_date, :expire_date, :created_by, :updated_by, :created_at, :updated_at
		)
	`
	_, err := r.db.NamedExecContext(ctx, query, ann)
	return err
}

func (r *repository) GetAnnouncementByID(ctx context.Context, id string) (*Announcement, error) {
	query := `SELECT * FROM announcements WHERE id = $1`
	var ann Announcement
	err := r.db.GetContext(ctx, &ann, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &ann, err
}

func (r *repository) GetAnnouncementBySlug(ctx context.Context, slug string) (*Announcement, error) {
	query := `SELECT * FROM announcements WHERE slug = $1`
	var ann Announcement
	err := r.db.GetContext(ctx, &ann, query, slug)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &ann, err
}

func (r *repository) UpdateAnnouncement(ctx context.Context, ann *Announcement) error {
	query := `
		UPDATE announcements SET
			title = :title, slug = :slug, summary = :summary, content = :content, 
			thumbnail_url = :thumbnail_url, category = :category, priority = :priority, 
			status = :status, attachments = :attachments, pinned = :pinned, 
			publish_date = :publish_date, expire_date = :expire_date, updated_by = :updated_by, 
			updated_at = :updated_at
		WHERE id = :id
	`
	_, err := r.db.NamedExecContext(ctx, query, ann)
	return err
}

func (r *repository) DeleteAnnouncement(ctx context.Context, id string) error {
	query := `DELETE FROM announcements WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *repository) ListAnnouncements(ctx context.Context, publicOnly bool) ([]Announcement, error) {
	query := `SELECT * FROM announcements`
	if publicOnly {
		query += ` WHERE status = 'Published' AND (publish_date IS NULL OR publish_date <= $1) AND (expire_date IS NULL OR expire_date >= $1)`
	}
	query += ` ORDER BY pinned DESC, created_at DESC`
	
	var anns []Announcement
	var err error
	if publicOnly {
		err = r.db.SelectContext(ctx, &anns, query, time.Now())
	} else {
		err = r.db.SelectContext(ctx, &anns, query)
	}
	
	if err != nil {
		return nil, err
	}
	if anns == nil {
		anns = []Announcement{}
	}
	return anns, nil
}

func (r *repository) CreateBroadcastJob(ctx context.Context, job *BroadcastJob) error {
	query := `
		INSERT INTO broadcast_jobs (
			id, announcement_id, target_audience, channels, status, total_targets, 
			successful_deliveries, failed_deliveries, error_message, started_at, 
			completed_at, created_by, created_at, updated_at
		) VALUES (
			:id, :announcement_id, :target_audience, :channels, :status, :total_targets, 
			:successful_deliveries, :failed_deliveries, :error_message, :started_at, 
			:completed_at, :created_by, :created_at, :updated_at
		)
	`
	_, err := r.db.NamedExecContext(ctx, query, job)
	return err
}

func (r *repository) UpdateBroadcastJob(ctx context.Context, job *BroadcastJob) error {
	query := `
		UPDATE broadcast_jobs SET
			status = :status, total_targets = :total_targets, successful_deliveries = :successful_deliveries, 
			failed_deliveries = :failed_deliveries, error_message = :error_message, 
			started_at = :started_at, completed_at = :completed_at, updated_at = :updated_at
		WHERE id = :id
	`
	_, err := r.db.NamedExecContext(ctx, query, job)
	return err
}

func (r *repository) GetBroadcastJob(ctx context.Context, id string) (*BroadcastJob, error) {
	query := `SELECT * FROM broadcast_jobs WHERE id = $1`
	var job BroadcastJob
	err := r.db.GetContext(ctx, &job, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &job, err
}

func (r *repository) ListBroadcastJobs(ctx context.Context, limit int, offset int) ([]BroadcastJob, error) {
	query := `SELECT * FROM broadcast_jobs ORDER BY created_at DESC LIMIT $1 OFFSET $2`
	var jobs []BroadcastJob
	err := r.db.SelectContext(ctx, &jobs, query, limit, offset)
	if err != nil {
		return nil, err
	}
	if jobs == nil {
		jobs = []BroadcastJob{}
	}
	return jobs, nil
}

func (r *repository) GetPendingBroadcastJobs(ctx context.Context) ([]BroadcastJob, error) {
	// Only fetch Queued jobs where the associated announcement is Published and (if scheduled) past its publish_date.
	query := `
		SELECT b.* 
		FROM broadcast_jobs b
		JOIN announcements a ON b.announcement_id = a.id
		WHERE b.status = 'Queued' 
		  AND a.status = 'Published'
		  AND (a.publish_date IS NULL OR a.publish_date <= $1)
	`
	var jobs []BroadcastJob
	err := r.db.SelectContext(ctx, &jobs, query, time.Now())
	if err != nil {
		return nil, err
	}
	if jobs == nil {
		jobs = []BroadcastJob{}
	}
	return jobs, nil
}

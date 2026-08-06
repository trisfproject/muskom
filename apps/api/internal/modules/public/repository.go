package public

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetActiveEvent(ctx context.Context) (*PublicEvent, error)
	GetSettings(ctx context.Context, eventID string) (*PublicSettings, error)
	GetTimelines(ctx context.Context, eventID string) ([]PublicTimeline, error)
	GetAnnouncements(ctx context.Context, eventID string) ([]PublicAnnouncement, error)
	GetCandidates(ctx context.Context) ([]PublicCandidate, error)
	GetParticipantCount(ctx context.Context, eventID string) (int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetActiveEvent(ctx context.Context) (*PublicEvent, error) {
	query := `
		SELECT id, name, theme, location, event_date, status 
		FROM events 
		WHERE is_default_active = true AND deleted_at IS NULL 
		LIMIT 1
	`
	var e PublicEvent
	err := r.db.GetContext(ctx, &e, query)
	return &e, err
}

func (r *repository) GetSettings(ctx context.Context, eventID string) (*PublicSettings, error) {
	query := `
		SELECT 
			registration_limit, registration_approval_mode, show_candidate_list, show_timeline, show_announcements
		FROM event_settings 
		WHERE event_id = $1
	`
	var s PublicSettings
	err := r.db.GetContext(ctx, &s, query, eventID)
	if err == sql.ErrNoRows {
		return &PublicSettings{}, nil
	}
	return &s, err
}

func (r *repository) GetTimelines(ctx context.Context, eventID string) ([]PublicTimeline, error) {
	query := `
		SELECT id, title, description, start_date, end_date, sort_order, public_visibility
		FROM timelines 
		WHERE public_visibility = true
		ORDER BY sort_order ASC
	`
	var t []PublicTimeline
	err := r.db.SelectContext(ctx, &t, query, eventID)
	if t == nil {
		t = []PublicTimeline{}
	}
	return t, err
}

func (r *repository) GetAnnouncements(ctx context.Context, eventID string) ([]PublicAnnouncement, error) {
	query := `
		SELECT id, title, content, published_at, created_at
		FROM announcements 
		WHERE deleted_at IS NULL AND published_at IS NOT NULL
		ORDER BY published_at DESC 
		LIMIT 3
	`
	var a []PublicAnnouncement
	err := r.db.SelectContext(ctx, &a, query, eventID)
	if a == nil {
		a = []PublicAnnouncement{}
	}
	return a, err
}

func (r *repository) GetCandidates(ctx context.Context) ([]PublicCandidate, error) {
	// Only fetch published candidates to show them publicly
	query := `
		SELECT 
			id, 
			candidate_number as sequence_number, 
			full_name as name, 
			job_title as title, 
			vision, 
			profile_photo as photo_path 
		FROM candidates 
		WHERE publication_status = 'Published' AND deleted_at IS NULL
		ORDER BY display_order ASC, created_at ASC
	`
	var c []PublicCandidate
	err := r.db.SelectContext(ctx, &c, query)
	if c == nil {
		c = []PublicCandidate{}
	}
	return c, err
}

func (r *repository) GetParticipantCount(ctx context.Context, eventID string) (int, error) {
	query := `SELECT COUNT(*) FROM participants WHERE deleted_at IS NULL AND status != 'Rejected'`
	var count int
	err := r.db.GetContext(ctx, &count, query, eventID)
	if err != nil {
		return 0, err
	}
	return count, nil
}

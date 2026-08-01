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
		WHERE deleted_at IS NULL 
		ORDER BY created_at ASC 
		LIMIT 1
	`
	var e PublicEvent
	err := r.db.GetContext(ctx, &e, query)
	return &e, err
}

func (r *repository) GetSettings(ctx context.Context, eventID string) (*PublicSettings, error) {
	query := `
		SELECT 
			registration_approval_mode, show_candidate_list, show_timeline, show_announcements
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
		WHERE event_id = $1 AND public_visibility = true
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
		WHERE event_id = $1 AND deleted_at IS NULL AND published_at IS NOT NULL
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
	// Only fetch approved candidates if we want to show them publicly
	query := `
		SELECT id, sequence_number, name, title, vision, photo_path 
		FROM candidates 
		WHERE status = 'APPROVED' AND deleted_at IS NULL
		ORDER BY sequence_number ASC
	`
	var c []PublicCandidate
	err := r.db.SelectContext(ctx, &c, query)
	if c == nil {
		c = []PublicCandidate{}
	}
	return c, err
}

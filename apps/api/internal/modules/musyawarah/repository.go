package musyawarah

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	// Multi-event CRUD
	ListEvents(ctx context.Context) ([]MusyawarahEvent, error)
	GetEventByID(ctx context.Context, id string) (*MusyawarahEvent, error)
	GetEventBySlug(ctx context.Context, slug string) (*MusyawarahEvent, error)
	CreateEvent(ctx context.Context, e *MusyawarahEvent) (*MusyawarahEvent, error)
	DeactivateAll(ctx context.Context, tx *sqlx.Tx) error
	SetActive(ctx context.Context, tx *sqlx.Tx, id string) error
	ArchiveEvent(ctx context.Context, id string) error
	SoftDeleteEvent(ctx context.Context, id string, deletedBy string) error

	// Existing (active event)
	GetActiveEvent(ctx context.Context) (*MusyawarahEvent, error)
	GetSettings(ctx context.Context, eventID string) (*MusyawarahSettings, error)
	GetPhases(ctx context.Context, eventID string) ([]MusyawarahPhase, error)
	UpdateEvent(ctx context.Context, tx *sqlx.Tx, e *MusyawarahEvent) error
	UpdateSettings(ctx context.Context, tx *sqlx.Tx, eventID string, s *MusyawarahSettings) error
	UpdateMedia(ctx context.Context, eventID string, mediaType string, path *string) error
	UpsertPhase(ctx context.Context, tx *sqlx.Tx, eventID string, p *MusyawarahPhase) error
	BeginTx(ctx context.Context) (*sqlx.Tx, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) BeginTx(ctx context.Context) (*sqlx.Tx, error) {
	return r.db.BeginTxx(ctx, nil)
}

// --- Multi-event CRUD ---

func (r *repository) ListEvents(ctx context.Context) ([]MusyawarahEvent, error) {
	query := `
		SELECT id, name, slug, theme, description, location, address, google_maps_url,
		       period_start, period_end, event_date, registration_open, registration_close,
		       candidate_registration_open, candidate_registration_close, banner_path, logo_path, cover_path, status,
		       is_default_active, created_by, updated_by, created_at, updated_at
		FROM events
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
	`
	var events []MusyawarahEvent
	err := r.db.SelectContext(ctx, &events, query)
	return events, err
}

func (r *repository) GetEventByID(ctx context.Context, id string) (*MusyawarahEvent, error) {
	query := `
		SELECT id, name, slug, theme, description, location, address, google_maps_url,
		       period_start, period_end, event_date, registration_open, registration_close,
		       candidate_registration_open, candidate_registration_close, banner_path, logo_path, cover_path, status,
		       is_default_active, created_by, updated_by, created_at, updated_at
		FROM events
		WHERE id = $1 AND deleted_at IS NULL
	`
	var event MusyawarahEvent
	err := r.db.GetContext(ctx, &event, query, id)
	return &event, err
}

func (r *repository) GetEventBySlug(ctx context.Context, slug string) (*MusyawarahEvent, error) {
	query := `
		SELECT id, name, slug, theme, description, location, address, google_maps_url,
		       period_start, period_end, event_date, registration_open, registration_close,
		       candidate_registration_open, candidate_registration_close, banner_path, logo_path, cover_path, status,
		       is_default_active, created_by, updated_by, created_at, updated_at
		FROM events
		WHERE slug = $1 AND deleted_at IS NULL
	`
	var event MusyawarahEvent
	err := r.db.GetContext(ctx, &event, query, slug)
	return &event, err
}

func (r *repository) CreateEvent(ctx context.Context, e *MusyawarahEvent) (*MusyawarahEvent, error) {
	query := `
		INSERT INTO events (
			name, slug, theme, description, location, address, google_maps_url, status,
			period_start, period_end, event_date, registration_open, registration_close,
			candidate_registration_open, candidate_registration_close,
			is_default_active, settings, created_by, updated_by, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, 'DRAFT',
			$8, $9, $10, $11, $12,
			$13, $14,
			false, '{}'::jsonb, $15, $15, NOW(), NOW()
		)
		RETURNING id, name, slug, theme, description, location, address, google_maps_url,
		          period_start, period_end, event_date, registration_open, registration_close,
		          candidate_registration_open, candidate_registration_close, banner_path, logo_path, cover_path, status,
		          is_default_active, created_by, updated_by, created_at, updated_at
	`
	var created MusyawarahEvent
	err := r.db.QueryRowxContext(ctx, query,
		e.Name, e.Slug, e.Theme, e.Description, e.Location, e.Address, e.GoogleMapsURL,
		e.PeriodStart, e.PeriodEnd, e.EventDate, e.RegistrationOpen, e.RegistrationClose,
		e.CandidateRegistrationOpen, e.CandidateRegistrationClose,
		e.CreatedBy,
	).StructScan(&created)
	return &created, err
}

func (r *repository) SoftDeleteEvent(ctx context.Context, id string, deletedBy string) error {
	query := `UPDATE events SET deleted_at = NOW(), updated_by = $1, is_default_active = false WHERE id = $2 AND deleted_at IS NULL`
	_, err := r.db.ExecContext(ctx, query, deletedBy, id)
	return err
}

func (r *repository) DeactivateAll(ctx context.Context, tx *sqlx.Tx) error {
	query := `UPDATE events SET is_default_active = false, updated_at = NOW() WHERE is_default_active = true`
	_, err := tx.ExecContext(ctx, query)
	return err
}

func (r *repository) SetActive(ctx context.Context, tx *sqlx.Tx, id string) error {
	query := `UPDATE events SET is_default_active = true, updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	_, err := tx.ExecContext(ctx, query, id)
	return err
}

func (r *repository) ArchiveEvent(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE events SET status = 'ARCHIVED', is_default_active = false, updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL`, id)
	return err
}

// --- Existing (active event) ---

func (r *repository) GetActiveEvent(ctx context.Context) (*MusyawarahEvent, error) {
	query := `
		SELECT id, name, slug, theme, description, location, address, google_maps_url,
		       period_start, period_end, event_date, registration_open, registration_close,
		       candidate_registration_open, candidate_registration_close, banner_path, logo_path, cover_path, status,
		       is_default_active, created_by, updated_by, created_at, updated_at
		FROM events 
		WHERE is_default_active = true AND deleted_at IS NULL
		LIMIT 1
	`
	var event MusyawarahEvent
	err := r.db.GetContext(ctx, &event, query)
	return &event, err
}

func (r *repository) GetSettings(ctx context.Context, eventID string) (*MusyawarahSettings, error) {
	query := `
		SELECT 
			registration_limit, registration_approval_mode, candidate_approval_mode,
			enable_attendance, attendance_qr_expiration, attendance_radius,
			enable_voting, allow_revote, show_live_result, publish_final_result,
			allow_candidate_registration, show_candidate_list, show_timeline, 
			show_statistics, show_announcements
		FROM event_settings 
		WHERE event_id = $1
	`
	var s MusyawarahSettings
	err := r.db.GetContext(ctx, &s, query, eventID)
	if err == sql.ErrNoRows {
		return &MusyawarahSettings{}, nil
	}
	return &s, err
}

func (r *repository) GetPhases(ctx context.Context, eventID string) ([]MusyawarahPhase, error) {
	query := `SELECT phase, start_at, end_at FROM event_phases WHERE event_id = $1`
	var p []MusyawarahPhase
	err := r.db.SelectContext(ctx, &p, query, eventID)
	return p, err
}

func (r *repository) UpdateEvent(ctx context.Context, tx *sqlx.Tx, event *MusyawarahEvent) error {
	query := `
		UPDATE events SET 
			name = $1, slug = $2, theme = $3, description = $4, location = $5, address = $6, google_maps_url = $7,
			banner_path = $8, logo_path = $9, status = $10, updated_at = NOW(), updated_by = $11,
			period_start = $12, period_end = $13, event_date = $14,
			registration_open = $15, registration_close = $16,
			candidate_registration_open = $17, candidate_registration_close = $18
		WHERE id = $19 AND deleted_at IS NULL
	`
	_, err := tx.ExecContext(ctx, query,
		event.Name, event.Slug, event.Theme, event.Description, event.Location, event.Address, event.GoogleMapsURL,
		event.BannerPath, event.LogoPath, event.Status, event.UpdatedBy,
		event.PeriodStart, event.PeriodEnd, event.EventDate,
		event.RegistrationOpen, event.RegistrationClose,
		event.CandidateRegistrationOpen, event.CandidateRegistrationClose,
		event.ID,
	)
	return err
}

func (r *repository) UpdateSettings(ctx context.Context, tx *sqlx.Tx, eventID string, s *MusyawarahSettings) error {
	query := `
		INSERT INTO event_settings (
			event_id, registration_limit, registration_approval_mode, candidate_approval_mode,
			enable_attendance, attendance_qr_expiration, attendance_radius,
			enable_voting, allow_revote, show_live_result, publish_final_result,
			allow_candidate_registration, show_candidate_list, show_timeline,
			show_statistics, show_announcements, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()
		)
		ON CONFLICT (event_id) DO UPDATE SET
			registration_limit = EXCLUDED.registration_limit,
			registration_approval_mode = EXCLUDED.registration_approval_mode,
			candidate_approval_mode = EXCLUDED.candidate_approval_mode,
			enable_attendance = EXCLUDED.enable_attendance,
			attendance_qr_expiration = EXCLUDED.attendance_qr_expiration,
			attendance_radius = EXCLUDED.attendance_radius,
			enable_voting = EXCLUDED.enable_voting,
			allow_revote = EXCLUDED.allow_revote,
			show_live_result = EXCLUDED.show_live_result,
			publish_final_result = EXCLUDED.publish_final_result,
			allow_candidate_registration = EXCLUDED.allow_candidate_registration,
			show_candidate_list = EXCLUDED.show_candidate_list,
			show_timeline = EXCLUDED.show_timeline,
			show_statistics = EXCLUDED.show_statistics,
			show_announcements = EXCLUDED.show_announcements,
			updated_at = NOW()
	`
	_, err := tx.ExecContext(ctx, query,
		eventID, s.RegistrationLimit, s.RegistrationApprovalMode, s.CandidateApprovalMode,
		s.EnableAttendance, s.AttendanceQRExpiration, s.AttendanceRadius,
		s.EnableVoting, s.AllowRevote, s.ShowLiveResult, s.PublishFinalResult,
		s.AllowCandidateRegistration, s.ShowCandidateList, s.ShowTimeline,
		s.ShowStatistics, s.ShowAnnouncements,
	)
	return err
}

func (r *repository) UpdateMedia(ctx context.Context, eventID string, mediaType string, path *string) error {
	var column string
	switch mediaType {
	case "logo":
		column = "logo_path"
	case "banner":
		column = "banner_path"
	case "cover":
		column = "cover_path"
	default:
		return sql.ErrConnDone
	}

	query := `UPDATE events SET ` + column + ` = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL`
	_, err := r.db.ExecContext(ctx, query, path, eventID)
	return err
}

func (r *repository) UpsertPhase(ctx context.Context, tx *sqlx.Tx, eventID string, p *MusyawarahPhase) error {
	query := `
		INSERT INTO event_phases (event_id, phase, start_at, end_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (event_id, phase) DO UPDATE SET
			start_at = EXCLUDED.start_at,
			end_at = EXCLUDED.end_at,
			updated_at = NOW()
	`
	_, err := tx.ExecContext(ctx, query, eventID, p.Phase, p.StartAt, p.EndAt)
	return err
}

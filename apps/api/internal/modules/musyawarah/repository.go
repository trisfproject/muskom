package musyawarah

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
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

func (r *repository) GetActiveEvent(ctx context.Context) (*MusyawarahEvent, error) {
	query := `
		SELECT id, name, slug, theme, tagline, description, location, banner_path, logo_path, cover_path, status,
		       year, start_date, end_date, timezone, venue, address, google_maps_url, city, province, meeting_type
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
	// If not found, return empty settings to handle cases where settings aren't seeded yet
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
			name = $1, slug = $2, theme = $3, tagline = $4, description = $5, location = $6, banner_path = $7, logo_path = $8, status = $9, updated_at = NOW(),
			year = $10, start_date = $11, end_date = $12, timezone = $13, venue = $14, address = $15, google_maps_url = $16, city = $17, province = $18, meeting_type = $19
		WHERE id = $20 AND deleted_at IS NULL
	`
	_, err := tx.ExecContext(ctx, query,
		event.Name, event.Slug, event.Theme, event.Tagline, event.Description, event.Location, event.BannerPath, event.LogoPath, event.Status,
		event.Year, event.StartDate, event.EndDate, event.Timezone, event.Venue, event.Address, event.GoogleMapsURL, event.City, event.Province, event.MeetingType,
		event.ID,
	)
	return err
}

func (r *repository) UpdateMedia(ctx context.Context, eventID string, mediaType string, path *string) error {
	var query string
	switch mediaType {
	case "logo":
		query = "UPDATE events SET logo_path = $1, updated_at = NOW() WHERE id = $2"
	case "banner":
		query = "UPDATE events SET banner_path = $1, updated_at = NOW() WHERE id = $2"
	case "cover":
		query = "UPDATE events SET cover_path = $1, updated_at = NOW() WHERE id = $2"
	default:
		return sql.ErrNoRows // Or custom error
	}
	_, err := r.db.ExecContext(ctx, query, path, eventID)
	return err
}

func (r *repository) UpdateSettings(ctx context.Context, tx *sqlx.Tx, eventID string, s *MusyawarahSettings) error {
	query := `
		INSERT INTO event_settings (
			event_id, registration_limit, registration_approval_mode, candidate_approval_mode,
			enable_attendance, attendance_qr_expiration, attendance_radius,
			enable_voting, allow_revote, show_live_result, publish_final_result,
			allow_candidate_registration, show_candidate_list, show_timeline, 
			show_statistics, show_announcements, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
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

func (r *repository) UpsertPhase(ctx context.Context, tx *sqlx.Tx, eventID string, p *MusyawarahPhase) error {
	query := `
		INSERT INTO event_phases (event_id, phase, start_at, end_at, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, false, NOW(), NOW())
		ON CONFLICT (event_id, phase) DO UPDATE SET 
			start_at = EXCLUDED.start_at,
			end_at = EXCLUDED.end_at,
			updated_at = NOW()
	`
	_, err := tx.ExecContext(ctx, query, eventID, p.Phase, p.StartAt, p.EndAt)
	return err
}

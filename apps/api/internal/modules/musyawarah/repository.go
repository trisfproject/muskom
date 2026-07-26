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
		SELECT id, name, theme, location, banner_path, logo_path, status 
		FROM events 
		WHERE deleted_at IS NULL 
		ORDER BY created_at ASC 
		LIMIT 1
	`
	var e MusyawarahEvent
	err := r.db.GetContext(ctx, &e, query)
	return &e, err
}

func (r *repository) GetSettings(ctx context.Context, eventID string) (*MusyawarahSettings, error) {
	query := `
		SELECT registration_limit, show_live_result, allow_candidate_registration 
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

func (r *repository) UpdateEvent(ctx context.Context, tx *sqlx.Tx, e *MusyawarahEvent) error {
	query := `
		UPDATE events 
		SET name = $1, theme = $2, location = $3, banner_path = $4, logo_path = $5, status = $6, updated_at = NOW()
		WHERE id = $7
	`
	_, err := tx.ExecContext(ctx, query, e.Name, e.Theme, e.Location, e.BannerPath, e.LogoPath, e.Status, e.ID)
	return err
}

func (r *repository) UpdateSettings(ctx context.Context, tx *sqlx.Tx, eventID string, s *MusyawarahSettings) error {
	query := `
		INSERT INTO event_settings (event_id, registration_limit, show_live_result, allow_candidate_registration, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		ON CONFLICT (event_id) DO UPDATE SET 
			registration_limit = EXCLUDED.registration_limit,
			show_live_result = EXCLUDED.show_live_result,
			allow_candidate_registration = EXCLUDED.allow_candidate_registration,
			updated_at = NOW()
	`
	_, err := tx.ExecContext(ctx, query, eventID, s.RegistrationLimit, s.ShowLiveResult, s.AllowCandidateRegistration)
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

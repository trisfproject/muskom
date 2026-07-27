package registration

import (
	"context"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetActiveEventContext(ctx context.Context) (*MusyawarahActiveContext, error)
	IsPhaseActive(ctx context.Context, eventID string, phaseName string) (bool, error)
	CountRegistrations(ctx context.Context, eventID string) (int, error)
	CheckExistingRegistration(ctx context.Context, eventID string, email string) (bool, error)
	BeginTx(ctx context.Context) (*sqlx.Tx, error)
	FindOrCreatePerson(ctx context.Context, tx *sqlx.Tx, p *Person) error
	CreateRegistration(ctx context.Context, tx *sqlx.Tx, r *Registration) error
	LogAudit(ctx context.Context, tx *sqlx.Tx, module, action, entity, entityID string, metadata string) error
	GetRegistrationStatus(ctx context.Context, registrationID string) (string, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetActiveEventContext(ctx context.Context) (*MusyawarahActiveContext, error) {
	query := `
		SELECT e.id, e.status, s.registration_limit, s.registration_approval_mode
		FROM events e
		LEFT JOIN event_settings s ON e.id = s.event_id
		WHERE e.deleted_at IS NULL
		ORDER BY e.created_at ASC
		LIMIT 1
	`
	var ctxData MusyawarahActiveContext
	err := r.db.GetContext(ctx, &ctxData, query)
	return &ctxData, err
}

func (r *repository) IsPhaseActive(ctx context.Context, eventID string, phaseName string) (bool, error) {
	query := `
		SELECT COUNT(1) 
		FROM event_phases 
		WHERE event_id = $1 AND phase = $2 AND NOW() BETWEEN start_at AND end_at
	`
	var count int
	err := r.db.GetContext(ctx, &count, query, eventID, phaseName)
	return count > 0, err
}

func (r *repository) CountRegistrations(ctx context.Context, eventID string) (int, error) {
	query := `
		SELECT COUNT(1) 
		FROM registrations 
		WHERE event_id = $1 AND status != 'REJECTED'
	`
	var count int
	err := r.db.GetContext(ctx, &count, query, eventID)
	return count, err
}

func (r *repository) CheckExistingRegistration(ctx context.Context, eventID string, email string) (bool, error) {
	query := `
		SELECT COUNT(1) 
		FROM registrations r
		JOIN persons p ON r.person_id = p.id
		WHERE r.event_id = $1 AND p.email = $2
	`
	var count int
	err := r.db.GetContext(ctx, &count, query, eventID, email)
	return count > 0, err
}

func (r *repository) BeginTx(ctx context.Context) (*sqlx.Tx, error) {
	return r.db.BeginTxx(ctx, nil)
}

func (r *repository) FindOrCreatePerson(ctx context.Context, tx *sqlx.Tx, p *Person) error {
	query := `
		INSERT INTO persons (full_name, email, phone, company, job_title, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		ON CONFLICT (email) DO UPDATE SET
			full_name = EXCLUDED.full_name,
			phone = COALESCE(EXCLUDED.phone, persons.phone),
			company = COALESCE(EXCLUDED.company, persons.company),
			job_title = COALESCE(EXCLUDED.job_title, persons.job_title),
			updated_at = NOW()
		RETURNING id
	`
	return tx.QueryRowContext(ctx, query, p.FullName, p.Email, p.Phone, p.Company, p.JobTitle).Scan(&p.ID)
}

func (r *repository) CreateRegistration(ctx context.Context, tx *sqlx.Tx, reg *Registration) error {
	query := `
		INSERT INTO registrations (event_id, person_id, participant_category, source, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, status
	`
	return tx.QueryRowContext(ctx, query, reg.EventID, reg.PersonID, reg.ParticipantCategory, reg.Source, reg.Status).Scan(&reg.ID, &reg.Status)
}

func (r *repository) LogAudit(ctx context.Context, tx *sqlx.Tx, module, action, entity, entityID string, metadata string) error {
	query := `
		INSERT INTO audit_logs (module, action, entity, entity_id, metadata, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
	`
	_, err := tx.ExecContext(ctx, query, module, action, entity, entityID, metadata)
	return err
}

func (r *repository) GetRegistrationStatus(ctx context.Context, registrationID string) (string, error) {
	query := `SELECT status FROM registrations WHERE id = $1`
	var status string
	err := r.db.GetContext(ctx, &status, query, registrationID)
	return status, err
}

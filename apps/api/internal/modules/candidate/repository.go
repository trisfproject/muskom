package candidate

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
)

var (
	ErrCandidateApplicationNotFound = errors.New("candidate application not found")
	ErrRegistrationNotFound         = errors.New("registration not found")
	ErrDuplicateApplication         = errors.New("candidate application already exists for this registration")
)

type Repository interface {
	CreateCandidateApplication(ctx context.Context, app *CandidateApplication) (string, error)
	GetCandidateApplicationByID(ctx context.Context, id string) (*CandidateApplication, error)
	CheckExistingApplication(ctx context.Context, registrationID string) (bool, error)
	GetEventActivePhase(ctx context.Context, eventID, phaseName string) (bool, error)
	GetRegistrationDetails(ctx context.Context, registrationID string) (*RegistrationDetails, error)
	UpdateDocumentPaths(ctx context.Context, tx *sqlx.Tx, applicationID string, photoPath, docPath *string) error
	BeginTx(ctx context.Context) (*sqlx.Tx, error)
	LogAudit(ctx context.Context, tx *sqlx.Tx, action, module, tableName, recordID, metadata string) error
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

func (r *repository) LogAudit(ctx context.Context, tx *sqlx.Tx, action, module, tableName, recordID, metadata string) error {
	query := `
		INSERT INTO audit_logs (id, action, module, table_name, record_id, metadata, created_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
	`
	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, action, module, tableName, recordID, metadata)
	} else {
		_, err = r.db.ExecContext(ctx, query, action, module, tableName, recordID, metadata)
	}
	return err
}

func (r *repository) CreateCandidateApplication(ctx context.Context, app *CandidateApplication) (string, error) {
	query := `
		INSERT INTO candidate_applications (registration_id, vision, mission, work_program, status)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`
	var id string
	err := r.db.QueryRowContext(ctx, query, app.RegistrationID, app.Vision, app.Mission, app.WorkProgram, app.Status).Scan(&id)
	return id, err
}

func (r *repository) GetCandidateApplicationByID(ctx context.Context, id string) (*CandidateApplication, error) {
	query := `
		SELECT 
			id, registration_id, vision, mission, work_program, photo_path, document_path,
			status, reviewed_by, reviewed_at, created_at, updated_at
		FROM candidate_applications
		WHERE id = $1
	`
	var app CandidateApplication
	err := r.db.GetContext(ctx, &app, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrCandidateApplicationNotFound
		}
		return nil, err
	}
	return &app, nil
}

func (r *repository) CheckExistingApplication(ctx context.Context, registrationID string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM candidate_applications WHERE registration_id = $1)`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, registrationID).Scan(&exists)
	return exists, err
}

type RegistrationDetails struct {
	EventID            string `db:"event_id"`
	EventStatus        string `db:"event_status"`
	RegistrationStatus string `db:"registration_status"`
}

func (r *repository) GetRegistrationDetails(ctx context.Context, registrationID string) (*RegistrationDetails, error) {
	query := `
		SELECT r.event_id, e.status as event_status, r.status as registration_status
		FROM registrations r
		JOIN events e ON r.event_id = e.id
		WHERE r.id = $1
	`
	var details RegistrationDetails
	err := r.db.GetContext(ctx, &details, query, registrationID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRegistrationNotFound
		}
		return nil, err
	}
	return &details, nil
}

func (r *repository) UpdateDocumentPaths(ctx context.Context, tx *sqlx.Tx, applicationID string, photoPath, docPath *string) error {
	query := `
		UPDATE candidate_applications
		SET photo_path = COALESCE($1, photo_path),
		    document_path = COALESCE($2, document_path),
		    updated_at = NOW()
		WHERE id = $3
	`
	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, photoPath, docPath, applicationID)
	} else {
		_, err = r.db.ExecContext(ctx, query, photoPath, docPath, applicationID)
	}
	return err
}

func (r *repository) GetEventActivePhase(ctx context.Context, eventID, phaseName string) (bool, error) {
	query := `
		SELECT is_active 
		FROM event_phases 
		WHERE event_id = $1 AND phase = $2 AND NOW() BETWEEN start_at AND end_at
	`
	var isActive bool
	err := r.db.QueryRowContext(ctx, query, eventID, phaseName).Scan(&isActive)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}
	return isActive, nil
}

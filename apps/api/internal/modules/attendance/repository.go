package attendance

import (
	"context"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetParticipantStatus(ctx context.Context, registrationID string) (string, error)
	GetAttendanceDetail(ctx context.Context, registrationID string) (*AttendanceDetailResponse, error)
	BeginTx(ctx context.Context) (*sqlx.Tx, error)
	CreateAttendance(ctx context.Context, tx *sqlx.Tx, registrationID string, operatorID string) (bool, error)
	LogAudit(ctx context.Context, tx *sqlx.Tx, module, action, entity, entityID string, metadata string) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetParticipantStatus(ctx context.Context, registrationID string) (string, error) {
	query := `SELECT status FROM registrations WHERE id = $1`
	var status string
	err := r.db.GetContext(ctx, &status, query, registrationID)
	return status, err
}

func (r *repository) GetAttendanceDetail(ctx context.Context, registrationID string) (*AttendanceDetailResponse, error) {
	query := `
		SELECT 
			a.id, a.registration_id, a.checked_in_at, a.checked_in_by, a.created_at, a.updated_at,
			p.full_name, p.email, p.phone, p.institution
		FROM attendance a
		JOIN registrations reg ON a.registration_id = reg.id
		JOIN persons p ON reg.person_id = p.id
		WHERE a.registration_id = $1
	`
	var detail AttendanceDetailResponse
	if err := r.db.GetContext(ctx, &detail, query, registrationID); err != nil {
		return nil, err
	}
	return &detail, nil
}

func (r *repository) BeginTx(ctx context.Context) (*sqlx.Tx, error) {
	return r.db.BeginTxx(ctx, nil)
}

func (r *repository) CreateAttendance(ctx context.Context, tx *sqlx.Tx, registrationID string, operatorID string) (bool, error) {
	query := `
		INSERT INTO attendance (registration_id, checked_in_by)
		VALUES ($1, $2)
		ON CONFLICT (registration_id) DO NOTHING
	`
	executor := r.db.ExecContext
	if tx != nil {
		executor = tx.ExecContext
	}

	res, err := executor(ctx, query, registrationID, operatorID)
	if err != nil {
		return false, err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return rows > 0, nil
}

func (r *repository) LogAudit(ctx context.Context, tx *sqlx.Tx, module, action, entity, entityID string, metadata string) error {
	query := `
		INSERT INTO audit_logs (module, action, entity, entity_id, user_id, metadata)
		VALUES ($1, $2, $3, $4, $5, NULLIF($6, ''))
	`
	userID := ctx.Value("user_id")
	if userID == nil {
		userID = ""
	}

	executor := r.db.ExecContext
	if tx != nil {
		executor = tx.ExecContext
	}

	_, err := executor(ctx, query, module, action, entity, entityID, userID, metadata)
	return err
}

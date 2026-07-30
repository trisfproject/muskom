package attendance

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetParticipantStatus(ctx context.Context, registrationID string) (string, error)
	GetAttendanceDetail(ctx context.Context, registrationID string) (*AttendanceDetailResponse, error)
	BeginTx(ctx context.Context) (*sqlx.Tx, error)
	CreateAttendance(ctx context.Context, tx *sqlx.Tx, registrationID string, operatorID string) (bool, error)
	LogAudit(ctx context.Context, tx *sqlx.Tx, module, action, entity, entityID string, metadata string) error
	ListAttendances(ctx context.Context, filter AttendanceListRequest) ([]AttendanceItemResponse, int, error)
	GetAttendanceByID(ctx context.Context, attendanceID string) (*AttendanceDetailResponse, error)
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

func (r *repository) ListAttendances(ctx context.Context, filter AttendanceListRequest) ([]AttendanceItemResponse, int, error) {
	page := filter.Page
	if page < 1 {
		page = 1
	}
	limit := filter.Limit
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argIdx := 1

	if filter.AttendanceStatus != "" {
		if filter.AttendanceStatus == "PRESENT" {
			whereClause += fmt.Sprintf(" AND a.id IS NOT NULL")
		} else if filter.AttendanceStatus == "ABSENT" {
			whereClause += fmt.Sprintf(" AND a.id IS NULL")
		}
	}

	if filter.ParticipantID != "" {
		whereClause += fmt.Sprintf(" AND p.id = $%d", argIdx)
		args = append(args, filter.ParticipantID)
		argIdx++
	}

	if filter.ParticipantName != "" {
		whereClause += fmt.Sprintf(" AND p.full_name ILIKE $%d", argIdx)
		args = append(args, "%"+filter.ParticipantName+"%")
		argIdx++
	}

	if filter.VerificationStatus != "" {
		whereClause += fmt.Sprintf(" AND r.status = $%d", argIdx)
		args = append(args, filter.VerificationStatus)
		argIdx++
	}

	if filter.CheckInDate != "" {
		whereClause += fmt.Sprintf(" AND DATE(a.checked_in_at) = $%d", argIdx)
		args = append(args, filter.CheckInDate)
		argIdx++
	}

	sortCol := "r.created_at"
	if filter.SortBy == "checked_in_at" {
		sortCol = "a.checked_in_at"
	} else if filter.SortBy == "participant_name" {
		sortCol = "p.full_name"
	}

	sortDir := "DESC"
	if filter.SortDirection == "asc" || filter.SortDirection == "ASC" {
		sortDir = "ASC"
	}

	countQuery := fmt.Sprintf(`
		SELECT COUNT(1)
		FROM registrations r
		JOIN persons p ON r.person_id = p.id
		LEFT JOIN attendance a ON r.id = a.registration_id
		%s
	`, whereClause)

	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`
		SELECT 
			r.id as registration_id,
			p.full_name as participant_name,
			p.institution,
			r.status as verification_status,
			CASE WHEN a.id IS NOT NULL THEN 'PRESENT' ELSE 'ABSENT' END as attendance_status,
			a.checked_in_at
		FROM registrations r
		JOIN persons p ON r.person_id = p.id
		LEFT JOIN attendance a ON r.id = a.registration_id
		%s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, sortCol, sortDir, argIdx, argIdx+1)

	args = append(args, limit, offset)

	var items []AttendanceItemResponse
	if err := r.db.SelectContext(ctx, &items, query, args...); err != nil {
		return nil, 0, err
	}
	if items == nil {
		items = []AttendanceItemResponse{}
	}
	return items, total, nil
}

func (r *repository) GetAttendanceByID(ctx context.Context, attendanceID string) (*AttendanceDetailResponse, error) {
	query := `
		SELECT 
			a.id, a.registration_id, a.checked_in_at, a.checked_in_by, a.created_at, a.updated_at,
			p.full_name, p.email, p.phone, p.institution
		FROM attendance a
		JOIN registrations reg ON a.registration_id = reg.id
		JOIN persons p ON reg.person_id = p.id
		WHERE a.id = $1
	`
	var detail AttendanceDetailResponse
	if err := r.db.GetContext(ctx, &detail, query, attendanceID); err != nil {
		return nil, err
	}
	return &detail, nil
}

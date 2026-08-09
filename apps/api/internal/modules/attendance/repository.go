package attendance

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetParticipantStatus(ctx context.Context, participantID string) (string, error)
	GetAttendanceDetail(ctx context.Context, participantID string) (*AttendanceDetailResponse, error)
	BeginTx(ctx context.Context) (*sqlx.Tx, error)
	CreateAttendance(ctx context.Context, tx *sqlx.Tx, participantID string, operatorID string) (bool, error)
	UndoCheckIn(ctx context.Context, tx *sqlx.Tx, checkInID string, operatorID string, reason string) error
	BulkUndo(ctx context.Context, tx *sqlx.Tx, ids []string, operatorID string, reason string) (int, error)
	GetSummaryByEvent(ctx context.Context, eventID string) (*AttendanceSummary, error)
	LogAudit(ctx context.Context, tx *sqlx.Tx, module, action, entity, entityID, operatorID string, metadata string) error
	ListAttendances(ctx context.Context, filter AttendanceListRequest) ([]AttendanceItemResponse, int, error)
	GetAttendanceByID(ctx context.Context, attendanceID string) (*AttendanceDetailResponse, error)
	GetParticipantIDByRegNumber(ctx context.Context, regNum string) (string, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetParticipantStatus(ctx context.Context, participantID string) (string, error) {
	query := `SELECT status FROM registrations WHERE id = $1`
	var status string
	err := r.db.GetContext(ctx, &status, query, participantID)
	return status, err
}

func (r *repository) GetParticipantIDByRegNumber(ctx context.Context, regNum string) (string, error) {
	query := `SELECT id FROM registrations WHERE (registration_number = $1 OR qr_token = $1)`
	var id string
	err := r.db.GetContext(ctx, &id, query, regNum)
	return id, err
}

func (r *repository) GetAttendanceDetail(ctx context.Context, participantID string) (*AttendanceDetailResponse, error) {
	query := `
		SELECT 
			a.id, a.participant_id, a.checked_in_at, a.checked_in_by, a.created_at, a.updated_at,
			p.full_name, p.email, p.phone, COALESCE(p.company, '') as institution, COALESCE(r.registration_number, '') as registration_number
		FROM attendance a
		JOIN registrations r ON a.participant_id = r.id
		JOIN persons p ON r.person_id = p.id
		WHERE a.participant_id = $1 AND a.undone_at IS NULL
	`
	var detail AttendanceDetailResponse
	if err := r.db.GetContext(ctx, &detail, query, participantID); err != nil {
		return nil, err
	}
	return &detail, nil
}

func (r *repository) BeginTx(ctx context.Context) (*sqlx.Tx, error) {
	return r.db.BeginTxx(ctx, nil)
}

func (r *repository) CreateAttendance(ctx context.Context, tx *sqlx.Tx, participantID string, operatorID string) (bool, error) {
	upsertQuery := `
		INSERT INTO participants (
			id, registration_number, full_name, email, phone, status,
			nickname, company_name, industrial_area, job_title, department
		)
		SELECT 
			r.id, r.registration_number, p.full_name, p.email, COALESCE(p.phone, ''), r.status,
			p.nickname, p.company, r.region, p.job_title, r.community
		FROM registrations r
		JOIN persons p ON r.person_id = p.id
		WHERE r.id = $1
		ON CONFLICT (id) DO NOTHING;
	`

	query := `
		INSERT INTO attendance (participant_id, checked_in_by)
		VALUES ($1, $2)
		ON CONFLICT (participant_id) WHERE undone_at IS NULL DO NOTHING
	`
	executor := r.db.ExecContext
	if tx != nil {
		executor = tx.ExecContext
	}

	// Provision participant to satisfy fk_attendance_participants
	_, err := executor(ctx, upsertQuery, participantID)
	if err != nil {
		return false, err
	}

	res, err := executor(ctx, query, participantID, operatorID)
	if err != nil {
		return false, err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return rows > 0, nil
}

func (r *repository) UndoCheckIn(ctx context.Context, tx *sqlx.Tx, checkInID string, operatorID string, reason string) error {
	query := `
		UPDATE attendance
		SET undone_at = NOW(), undone_by = $1, undo_reason = $2
		WHERE (id = $3 OR participant_id = $3) AND undone_at IS NULL
	`
	executor := r.db.ExecContext
	if tx != nil {
		executor = tx.ExecContext
	}

	res, err := executor(ctx, query, operatorID, reason, checkInID)
	if err != nil {
		return err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return fmt.Errorf("check-in not found or already undone")
	}

	return nil
}

func (r *repository) BulkUndo(ctx context.Context, tx *sqlx.Tx, ids []string, operatorID string, reason string) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}

	query, args, err := sqlx.In(`
		UPDATE attendance
		SET undone_at = NOW(), undone_by = ?, undo_reason = ?
		WHERE (id IN (?) OR participant_id IN (?)) AND undone_at IS NULL
	`, operatorID, reason, ids, ids)
	if err != nil {
		return 0, err
	}

	query = r.db.Rebind(query)

	executor := r.db.ExecContext
	if tx != nil {
		executor = tx.ExecContext
	}

	res, err := executor(ctx, query, args...)
	if err != nil {
		return 0, err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}

	return int(rows), nil
}

func (r *repository) GetSummaryByEvent(ctx context.Context, eventID string) (*AttendanceSummary, error) {
	query := `
		SELECT 
			COUNT(r.id) as total_participants,
			COUNT(a.id) as total_present,
			COUNT(r.id) - COUNT(a.id) as total_absent
		FROM registrations r
		LEFT JOIN attendance a ON r.id = a.participant_id AND a.undone_at IS NULL
		WHERE UPPER(TRIM(r.status)) IN ('VERIFIED', 'APPROVED')
	`
	var summary AttendanceSummary
	if err := r.db.GetContext(ctx, &summary, query); err != nil {
		return nil, err
	}
	return &summary, nil
}

func (r *repository) LogAudit(ctx context.Context, tx *sqlx.Tx, module, action, entity, entityID, operatorID string, metadata string) error {
	query := `
		INSERT INTO audit_logs (module, action, entity, entity_id, user_id, metadata)
		VALUES ($1, $2, $3, $4, NULLIF($5, '')::uuid, NULLIF($6, '')::jsonb)
	`
	executor := r.db.ExecContext
	if tx != nil {
		executor = tx.ExecContext
	}

	_, err := executor(ctx, query, module, action, entity, entityID, operatorID, metadata)
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
			whereClause += " AND a.id IS NOT NULL"
		} else if filter.AttendanceStatus == "ABSENT" {
			whereClause += " AND a.id IS NULL"
		}
	}

	if filter.ParticipantID != "" {
		whereClause += fmt.Sprintf(" AND r.id = $%d", argIdx)
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
		LEFT JOIN attendance a ON r.id = a.participant_id AND a.undone_at IS NULL
		%s
	`, whereClause)

	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`
		SELECT 
			r.id as participant_id,
			p.full_name as participant_name,
			COALESCE(p.company, '') as institution,
			r.status as verification_status,
			CASE WHEN a.id IS NOT NULL THEN 'PRESENT' ELSE 'ABSENT' END as attendance_status,
			a.checked_in_at
		FROM registrations r
		JOIN persons p ON r.person_id = p.id
		LEFT JOIN attendance a ON r.id = a.participant_id AND a.undone_at IS NULL
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
			a.id, a.participant_id, a.checked_in_at, a.checked_in_by, a.created_at, a.updated_at,
			p.full_name, p.email, p.phone, COALESCE(p.company, '') as institution
		FROM attendance a
		JOIN registrations r ON a.participant_id = r.id
		JOIN persons p ON r.person_id = p.id
		WHERE a.id = $1 AND a.undone_at IS NULL
	`
	var detail AttendanceDetailResponse
	if err := r.db.GetContext(ctx, &detail, query, attendanceID); err != nil {
		return nil, err
	}
	return &detail, nil
}

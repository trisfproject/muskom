package candidate

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

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
	GetAdminCandidateList(ctx context.Context, filter CandidateAdminListRequest) ([]CandidateAdminListResponse, int, error)
	GetAdminCandidateDetail(ctx context.Context, candidateCode string) (*CandidateAdminDetailResponse, error)
	UpdateCandidateStatus(ctx context.Context, tx *sqlx.Tx, candidateCode, status, reviewedBy string) error
	GetCandidateAuditHistory(ctx context.Context, candidateCode string) ([]CandidateAuditLogResponse, error)
	UpdateCandidateDetails(ctx context.Context, tx *sqlx.Tx, candidateCode string, req *CandidateAdminUpdateRequest) error
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

func (r *repository) GetAdminCandidateList(ctx context.Context, filter CandidateAdminListRequest) ([]CandidateAdminListResponse, int, error) {
	baseQuery := `
		FROM candidate_applications ca
		JOIN registrations reg ON ca.registration_id = reg.id
		JOIN persons p ON reg.person_id = p.id
		WHERE 1=1
	`
	args := []interface{}{}
	argId := 1

	if filter.EventID != "" {
		baseQuery += fmt.Sprintf(" AND reg.event_id = $%d", argId)
		args = append(args, filter.EventID)
		argId++
	}
	if filter.Status != "" {
		baseQuery += fmt.Sprintf(" AND ca.status = $%d", argId)
		args = append(args, filter.Status)
		argId++
	}
	if filter.Search != "" {
		baseQuery += fmt.Sprintf(" AND p.full_name ILIKE $%d", argId)
		args = append(args, "%"+filter.Search+"%")
		argId++
	}
	if filter.CandidateID != "" {
		baseQuery += fmt.Sprintf(" AND ca.id = $%d", argId)
		args = append(args, filter.CandidateID)
		argId++
	}
	if filter.RegistrationID != "" {
		baseQuery += fmt.Sprintf(" AND ca.registration_id = $%d", argId)
		args = append(args, filter.RegistrationID)
		argId++
	}
	if filter.SubmissionDate != "" {
		baseQuery += fmt.Sprintf(" AND DATE(ca.created_at) = $%d", argId)
		args = append(args, filter.SubmissionDate)
		argId++
	}

	countQuery := "SELECT COUNT(ca.id) " + baseQuery
	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, err
	}

	if filter.Limit == 0 {
		filter.Limit = 10
	}
	if filter.Page == 0 {
		filter.Page = 1
	}
	offset := (filter.Page - 1) * filter.Limit

	orderColumn := "ca.created_at"
	switch filter.SortBy {
	case "updated_at":
		orderColumn = "ca.updated_at"
	case "status":
		orderColumn = "ca.status"
	case "created_at":
		orderColumn = "ca.created_at"
	}
	orderDir := "DESC"
	if filter.SortOrder == "asc" || filter.SortOrder == "ASC" {
		orderDir = "ASC"
	}

	dataQuery := `
		SELECT 
			ca.id,
			ca.id as candidate_code,
			ca.registration_id,
			p.full_name as name,
			reg.participant_category,
			ca.status,
			ca.created_at
	` + baseQuery + fmt.Sprintf(" ORDER BY %s %s LIMIT $%d OFFSET $%d", orderColumn, orderDir, argId, argId+1)

	args = append(args, filter.Limit, offset)

	var list []CandidateAdminListResponse
	if err := r.db.SelectContext(ctx, &list, dataQuery, args...); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *repository) GetAdminCandidateDetail(ctx context.Context, candidateCode string) (*CandidateAdminDetailResponse, error) {
	query := `
		SELECT 
			ca.id,
			ca.id as candidate_code,
			ca.registration_id,
			p.full_name as name,
			reg.participant_category,
			ca.status,
			ca.created_at,
			ca.vision,
			ca.mission,
			ca.work_program,
			ca.photo_path,
			ca.document_path,
			ca.reviewed_by,
			ca.reviewed_at,
			u.name as reviewer_name
		FROM candidate_applications ca
		JOIN registrations reg ON ca.registration_id = reg.id
		JOIN persons p ON reg.person_id = p.id
		LEFT JOIN users u ON ca.reviewed_by = u.id
		WHERE ca.id = $1
	`
	var detail struct {
		CandidateAdminDetailResponse
		PhotoPath    *string `db:"photo_path"`
		DocumentPath *string `db:"document_path"`
	}
	if err := r.db.GetContext(ctx, &detail, query, candidateCode); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("candidate not found")
		}
		return nil, err
	}

	resp := detail.CandidateAdminDetailResponse
	if detail.PhotoPath != nil {
		resp.PhotoURL = *detail.PhotoPath
	}
	if detail.DocumentPath != nil {
		resp.DocumentURL = *detail.DocumentPath
	}

	return &resp, nil
}

func (r *repository) UpdateCandidateStatus(ctx context.Context, tx *sqlx.Tx, candidateCode, status, reviewedBy string) error {
	query := `
		UPDATE candidate_applications
		SET status = $1,
		    reviewed_by = $2,
		    reviewed_at = NOW(),
		    updated_at = NOW()
		WHERE id = $3
	`
	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, status, reviewedBy, candidateCode)
	} else {
		_, err = r.db.ExecContext(ctx, query, status, reviewedBy, candidateCode)
	}
	return err
}

func (r *repository) GetCandidateAuditHistory(ctx context.Context, candidateCode string) ([]CandidateAuditLogResponse, error) {
	query := `
		SELECT 
			al.id,
			al.action,
			COALESCE(al.metadata::text, '') as metadata,
			al.created_at,
			u.name as user_name
		FROM audit_logs al
		LEFT JOIN users u ON al.user_id = u.id
		WHERE al.entity = 'candidate_applications' AND al.entity_id = $1
		ORDER BY al.created_at DESC
	`
	var list []CandidateAuditLogResponse
	if err := r.db.SelectContext(ctx, &list, query, candidateCode); err != nil {
		return nil, err
	}
	// Return empty list instead of nil if no logs
	if list == nil {
		list = []CandidateAuditLogResponse{}
	}
	return list, nil
}

func (r *repository) UpdateCandidateDetails(ctx context.Context, tx *sqlx.Tx, candidateCode string, req *CandidateAdminUpdateRequest) error {
	query := `
		UPDATE candidate_applications
		SET vision = COALESCE($1, vision),
		    mission = COALESCE($2, mission),
		    work_program = COALESCE($3, work_program),
		    updated_at = NOW()
		WHERE id = $4
	`
	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, req.Vision, req.Mission, req.WorkProgram, candidateCode)
	} else {
		_, err = r.db.ExecContext(ctx, query, req.Vision, req.Mission, req.WorkProgram, candidateCode)
	}
	return err
}

package verification

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetVerifications(ctx context.Context, filter VerificationListRequest) ([]VerificationItemResponse, int, error)
	GetVerificationSummary(ctx context.Context) (*VerificationSummaryResponse, error)
	GetParticipantDetail(ctx context.Context, registrationID string) (*ParticipantDetailResponse, error)
	BeginTx(ctx context.Context) (*sqlx.Tx, error)
	LogAudit(ctx context.Context, tx *sqlx.Tx, module, action, entity, entityID string, metadata string) error
	UpdateParticipantStatus(ctx context.Context, tx *sqlx.Tx, registrationID string, status string, verifierID string, rejectionReason *string) error
	GetCandidateDetail(ctx context.Context, candidateID string) (*CandidateDetailResponse, error)
	UpdateCandidateStatus(ctx context.Context, tx *sqlx.Tx, candidateID string, status string, verifierID string) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetVerifications(ctx context.Context, filter VerificationListRequest) ([]VerificationItemResponse, int, error) {
	// Base CTEs to unify participants and candidates
	baseQuery := `
		WITH combined_queue AS (
			-- Participant Applications
			SELECT 
				p.id::text as id,
				'participant' as queue_type,
				p.full_name as applicant_name,
				p.status as status,
				p.created_at
			FROM participants p
			WHERE p.deleted_at IS NULL
			
			UNION ALL
			
			-- Candidate Applications
			SELECT 
				c.id::text as id,
				'candidate' as queue_type,
				c.full_name as applicant_name,
				c.status as status,
				c.created_at
			FROM candidates c
			WHERE c.deleted_at IS NULL
		)
		SELECT * FROM combined_queue
		WHERE 1=1
	`

	args := []interface{}{}
	argId := 1

	if filter.QueueType != "" && filter.QueueType != "all" {
		baseQuery += fmt.Sprintf(" AND queue_type = $%d", argId)
		args = append(args, filter.QueueType)
		argId++
	}

	if filter.Status != "" {
		baseQuery += fmt.Sprintf(" AND status ILIKE $%d", argId)
		args = append(args, filter.Status)
		argId++
	}

	if filter.ApplicantName != "" {
		baseQuery += fmt.Sprintf(" AND applicant_name ILIKE $%d", argId)
		args = append(args, "%"+filter.ApplicantName+"%")
		argId++
	}

	if filter.SubmissionDate != "" {
		baseQuery += fmt.Sprintf(" AND DATE(created_at) = $%d", argId)
		args = append(args, filter.SubmissionDate)
		argId++
	}

	countQuery := "SELECT COUNT(*) FROM (" + baseQuery + ") as cq"
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

	orderColumn := "created_at"
	if filter.SortBy == "status" {
		orderColumn = "status"
	}

	orderDir := "DESC"
	if filter.SortOrder == "asc" || filter.SortOrder == "ASC" {
		orderDir = "ASC"
	}

	dataQuery := baseQuery + fmt.Sprintf(" ORDER BY %s %s LIMIT $%d OFFSET $%d", orderColumn, orderDir, argId, argId+1)
	args = append(args, filter.Limit, offset)

	var list []VerificationItemResponse
	if err := r.db.SelectContext(ctx, &list, dataQuery, args...); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *repository) GetVerificationSummary(ctx context.Context) (*VerificationSummaryResponse, error) {
	query := `
		SELECT 
			(SELECT COUNT(*) FROM participants WHERE deleted_at IS NULL AND status IN ('Pending', 'PENDING')) as pending_participants,
			(SELECT COUNT(*) FROM candidates WHERE deleted_at IS NULL AND status IN ('Draft', 'DRAFT', 'Submitted', 'Pending')) as pending_candidates
	`

	var summary VerificationSummaryResponse
	if err := r.db.GetContext(ctx, &summary, query); err != nil {
		return nil, err
	}

	summary.TotalPending = summary.PendingParticipants + summary.PendingCandidates
	return &summary, nil
}

func (r *repository) GetParticipantDetail(ctx context.Context, registrationID string) (*ParticipantDetailResponse, error) {
	query := `
		SELECT 
			p.id, p.musyawarah_id as  'DELEGATE' as participant_category, 'ONLINE' as source, p.status, NULL as rejection_reason, p.created_at, p.updated_at,
			p.id as person_id, p.full_name, p.email, p.phone, p.company_name as institution
		FROM participants p
		WHERE p.id = $1 AND p.deleted_at IS NULL
	`
	var detail ParticipantDetailResponse
	if err := r.db.GetContext(ctx, &detail, query, registrationID); err != nil {
		return nil, err
	}
	return &detail, nil
}

func (r *repository) BeginTx(ctx context.Context) (*sqlx.Tx, error) {
	return r.db.BeginTxx(ctx, nil)
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

func (r *repository) UpdateParticipantStatus(ctx context.Context, tx *sqlx.Tx, registrationID string, status string, verifierID string, rejectionReason *string) error {
	query := `
		UPDATE participants
		SET status = $1, updated_at = NOW()
		WHERE id = $2 AND deleted_at IS NULL
	`
	executor := r.db.ExecContext
	if tx != nil {
		executor = tx.ExecContext
	}

	res, err := executor(ctx, query, status, registrationID)
	if err != nil {
		return err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("participant not found")
	}

	return nil
}

func (r *repository) GetCandidateDetail(ctx context.Context, candidateID string) (*CandidateDetailResponse, error) {
	query := `
		SELECT 
			c.id, c.id as registration_id, c.musyawarah_id as  'CANDIDATE' as participant_category, 'SYSTEM' as source, c.status, 
			c.created_at, c.updated_at, c.id as person_id, c.full_name, c.email, c.phone, COALESCE(c.organization, '') as institution,
			COALESCE(c.vision, '') as vision, COALESCE(c.mission, '') as mission, '' as work_program, COALESCE(c.profile_photo, '') as photo_path, '' as document_path
		FROM candidates c
		WHERE c.id = $1 AND c.deleted_at IS NULL
	`
	var detail CandidateDetailResponse
	if err := r.db.GetContext(ctx, &detail, query, candidateID); err != nil {
		return nil, err
	}
	return &detail, nil
}

func (r *repository) UpdateCandidateStatus(ctx context.Context, tx *sqlx.Tx, candidateID string, status string, verifierID string) error {
	query := `
		UPDATE candidates
		SET status = $1, updated_at = NOW()
		WHERE id = $2 AND deleted_at IS NULL
	`
	executor := r.db.ExecContext
	if tx != nil {
		executor = tx.ExecContext
	}

	res, err := executor(ctx, query, status, candidateID)
	if err != nil {
		return err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("candidate not found")
	}

	return nil
}

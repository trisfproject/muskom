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
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetVerifications(ctx context.Context, filter VerificationListRequest) ([]VerificationItemResponse, int, error) {
	// Base CTEs to unify registrations and candidate_applications
	baseQuery := `
		WITH combined_queue AS (
			-- Participant Applications (Registrations)
			SELECT 
				r.id::text as id,
				'participant' as queue_type,
				p.full_name as applicant_name,
				r.registration_status as status,
				r.created_at
			FROM registrations r
			JOIN persons p ON r.person_id = p.id
			
			UNION ALL
			
			-- Candidate Applications
			SELECT 
				ca.id::text as id,
				'candidate' as queue_type,
				p.full_name as applicant_name,
				ca.status as status,
				ca.created_at
			FROM candidate_applications ca
			JOIN registrations r ON ca.registration_id = r.id
			JOIN persons p ON r.person_id = p.id
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
		baseQuery += fmt.Sprintf(" AND status = $%d", argId)
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
			(SELECT COUNT(*) FROM registrations WHERE registration_status IN ('SUBMITTED', 'REVIEWING')) as pending_participants,
			(SELECT COUNT(*) FROM candidate_applications WHERE status IN ('SUBMITTED', 'REVIEWING')) as pending_candidates
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
			r.id, r.event_id, r.participant_category, r.source, r.status, r.rejection_reason, r.created_at, r.updated_at,
			p.id as person_id, p.full_name, p.email, p.phone, p.institution
		FROM registrations r
		JOIN persons p ON r.person_id = p.id
		WHERE r.id = $1
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
		UPDATE registrations
		SET status = $1, approved_by = $2, approved_at = NOW(), rejection_reason = $3, updated_at = NOW()
		WHERE id = $4
	`
	executor := r.db.ExecContext
	if tx != nil {
		executor = tx.ExecContext
	}

	res, err := executor(ctx, query, status, verifierID, rejectionReason, registrationID)
	if err != nil {
		return err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("registration not found")
	}

	return nil
}

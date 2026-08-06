package registration

import (
	"context"
	"database/sql"
	"errors"
	"strconv"

	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
)

var ErrSchemaMissing = errors.New("database schema for registration attachments is missing")

type Repository interface {
	GetActiveEventContext(ctx context.Context) (*MusyawarahActiveContext, error)
	IsPhaseActive(ctx context.Context, eventID string, phaseName string) (bool, error)
	CountRegistrations(ctx context.Context, eventID string) (int, error)
	CheckExistingRegistration(ctx context.Context, eventID string, email string) (bool, error)
	CheckExistingPhone(ctx context.Context, eventID string, phone string) (bool, error)
	BeginTx(ctx context.Context) (*sqlx.Tx, error)
	FindOrCreatePerson(ctx context.Context, tx *sqlx.Tx, p *Person) error
	CreateRegistration(ctx context.Context, tx *sqlx.Tx, r *Registration) error
	LogAudit(ctx context.Context, tx *sqlx.Tx, module, action, entity, entityID string, metadata string) error
	GetRegistrationStatus(ctx context.Context, registrationID string) (string, error)
	GetRegistrationByID(ctx context.Context, registrationID string) (*Registration, error)

	// Attachment operations (Stubbed due to missing schema)
	SaveAttachmentMetadata(ctx context.Context, registrationID string, fileInfo *storage.FileInfo) (string, error)
	GetAttachments(ctx context.Context, registrationID string) ([]AttachmentResponse, error)
	DeleteAttachmentMetadata(ctx context.Context, attachmentID string) error

	// Confirmation
	GetRegistrationConfirmation(ctx context.Context, registrationID string) (*RegistrationConfirmationData, error)

	// Admin operations
	ListRegistrations(ctx context.Context, filter AdminListRegistrationsRequest) ([]AdminRegistrationResponse, int, error)
	GetRegistrationAdminByID(ctx context.Context, id string) (*AdminRegistrationResponse, error)
	UpdateRegistrationStatus(ctx context.Context, tx *sqlx.Tx, id string, status string, adminID string) error
}

type RegistrationConfirmationData struct {
	RegistrationCode string `db:"registration_code"`
	Status           string `db:"status"`
	RegistrationDate string `db:"registration_date"`
	MusyawarahName   string `db:"musyawarah_name"`
	ParticipantName  string `db:"participant_name"`
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
		WHERE phase = $2 AND NOW() BETWEEN start_at AND end_at
	`
	var count int
	err := r.db.GetContext(ctx, &count, query, eventID, phaseName)
	return count > 0, err
}

func (r *repository) CountRegistrations(ctx context.Context, eventID string) (int, error) {
	query := `
		SELECT COUNT(1) 
		FROM registrations 
		WHERE status != 'REJECTED'
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
		WHERE p.email = $2
	`
	var count int
	err := r.db.GetContext(ctx, &count, query, eventID, email)
	return count > 0, err
}

func (r *repository) CheckExistingPhone(ctx context.Context, eventID string, phone string) (bool, error) {
	query := `
		SELECT COUNT(1) 
		FROM registrations r
		JOIN persons p ON r.person_id = p.id
		WHERE p.phone = $2
	`
	var count int
	err := r.db.GetContext(ctx, &count, query, eventID, phone)
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
		INSERT INTO registrations (
			 person_id, participant_category, source, status, 
			registration_number, qr_token, region, community, special_notes,
			created_at, updated_at
		)
		VALUES (
			$1, $2, $3, $4, $5, 
			'MUSKOM-2026-' || LPAD(nextval('registration_number_seq')::text, 6, '0'), 
			$6, $7, $8, $9,
			NOW(), NOW()
		)
		RETURNING id, status, registration_number
	`
	return tx.QueryRowContext(
		ctx, query, 
		reg.EventID, reg.PersonID, reg.ParticipantCategory, reg.Source, reg.Status,
		reg.QrToken, reg.Region, reg.Community, reg.SpecialNotes,
	).Scan(&reg.ID, &reg.Status, &reg.RegistrationNumber)
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

func (r *repository) GetRegistrationByID(ctx context.Context, registrationID string) (*Registration, error) {
	query := `SELECT * FROM registrations WHERE id = $1`
	var reg Registration
	err := r.db.GetContext(ctx, &reg, query, registrationID)
	return &reg, err
}

func (r *repository) SaveAttachmentMetadata(ctx context.Context, registrationID string, fileInfo *storage.FileInfo) (string, error) {
	return "", ErrSchemaMissing
}

func (r *repository) GetAttachments(ctx context.Context, registrationID string) ([]AttachmentResponse, error) {
	return nil, ErrSchemaMissing
}

func (r *repository) DeleteAttachmentMetadata(ctx context.Context, attachmentID string) error {
	return ErrSchemaMissing
}

func (r *repository) GetRegistrationConfirmation(ctx context.Context, registrationID string) (*RegistrationConfirmationData, error) {
	query := `
		SELECT 
			r.id AS registration_code,
			r.status,
			r.created_at::text AS registration_date,
			e.title AS musyawarah_name,
			p.full_name AS participant_name
		FROM registrations r
		JOIN events e ON r.event_id = e.id
		JOIN persons p ON r.person_id = p.id
		WHERE r.id = $1
	`
	var data RegistrationConfirmationData
	err := r.db.GetContext(ctx, &data, query, registrationID)
	return &data, err
}

func (r *repository) ListRegistrations(ctx context.Context, filter AdminListRegistrationsRequest) ([]AdminRegistrationResponse, int, error) {
	baseQuery := `
		FROM registrations r
		JOIN events e ON r.event_id = e.id
		JOIN persons p ON r.person_id = p.id
		WHERE 1=1
	`
	args := []interface{}{}
	argIdx := 1

	if filter.Status != "" {
		baseQuery += ` AND r.status = $` + itoa(argIdx)
		args = append(args, filter.Status)
		argIdx++
	}
	if filter.RegistrationCode != "" {
		baseQuery += ` AND r.id = $` + itoa(argIdx)
		args = append(args, filter.RegistrationCode)
		argIdx++
	}
	if filter.ParticipantName != "" {
		baseQuery += ` AND p.full_name ILIKE $` + itoa(argIdx)
		args = append(args, "%"+filter.ParticipantName+"%")
		argIdx++
	}
	if filter.Email != "" {
		baseQuery += ` AND p.email ILIKE $` + itoa(argIdx)
		args = append(args, "%"+filter.Email+"%")
		argIdx++
	}
	if filter.Phone != "" {
		baseQuery += ` AND p.phone ILIKE $` + itoa(argIdx)
		args = append(args, "%"+filter.Phone+"%")
		argIdx++
	}
	if filter.RegistrationDate != "" {
		baseQuery += ` AND DATE(r.created_at) = $` + itoa(argIdx)
		args = append(args, filter.RegistrationDate)
		argIdx++
	}

	countQuery := `SELECT COUNT(1) ` + baseQuery
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, err
	}

	if filter.Limit <= 0 {
		filter.Limit = 10
	}
	if filter.Page <= 0 {
		filter.Page = 1
	}
	offset := (filter.Page - 1) * filter.Limit

	sortCol := "r.created_at"
	switch filter.SortBy {
	case "participant_name":
		sortCol = "p.full_name"
	case "status":
		sortCol = "r.status"
	case "created_at":
		sortCol = "r.created_at"
	}

	sortDir := "DESC"
	if filter.SortOrder == "asc" || filter.SortOrder == "ASC" {
		sortDir = "ASC"
	}

	selectQuery := `
		SELECT 
			r.id,
			r.
			e.title AS event_name,
			p.full_name AS participant_name,
			p.email,
			p.phone,
			p.company,
			p.job_title,
			r.participant_category,
			r.source,
			r.status,
			r.created_at::text,
			r.updated_at::text
		` + baseQuery + ` ORDER BY ` + sortCol + ` ` + sortDir + ` LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)

	args = append(args, filter.Limit, offset)

	rows, err := r.db.QueryContext(ctx, selectQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []AdminRegistrationResponse
	for rows.Next() {
		var resp AdminRegistrationResponse
		var company, jobTitle sql.NullString
		err := rows.Scan(
			&resp.ID,
			&resp.EventID,
			&resp.EventName,
			&resp.ParticipantName,
			&resp.Email,
			&resp.Phone,
			&company,
			&jobTitle,
			&resp.ParticipantCategory,
			&resp.Source,
			&resp.Status,
			&resp.CreatedAt,
			&resp.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		if company.Valid {
			resp.Company = company.String
		}
		if jobTitle.Valid {
			resp.JobTitle = jobTitle.String
		}
		result = append(result, resp)
	}

	if len(result) == 0 {
		result = []AdminRegistrationResponse{}
	}

	return result, total, nil
}

func (r *repository) GetRegistrationAdminByID(ctx context.Context, id string) (*AdminRegistrationResponse, error) {
	query := `
		SELECT 
			r.id,
			r.
			e.title AS event_name,
			p.full_name AS participant_name,
			p.email,
			p.phone,
			p.company,
			p.job_title,
			r.participant_category,
			r.source,
			r.status,
			r.created_at::text,
			r.updated_at::text
		FROM registrations r
		JOIN events e ON r.event_id = e.id
		JOIN persons p ON r.person_id = p.id
		WHERE r.id = $1
	`
	var resp AdminRegistrationResponse
	var company, jobTitle sql.NullString
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&resp.ID,
		&resp.EventID,
		&resp.EventName,
		&resp.ParticipantName,
		&resp.Email,
		&resp.Phone,
		&company,
		&jobTitle,
		&resp.ParticipantCategory,
		&resp.Source,
		&resp.Status,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if company.Valid {
		resp.Company = company.String
	}
	if jobTitle.Valid {
		resp.JobTitle = jobTitle.String
	}
	return &resp, nil
}

func (r *repository) UpdateRegistrationStatus(ctx context.Context, tx *sqlx.Tx, id string, status string, adminID string) error {
	query := `
		UPDATE registrations
		SET status = $1, approved_by = $2, approved_at = NOW(), updated_at = NOW()
		WHERE id = $3
	`
	var err error
	if adminID == "system" {
		query = `
			UPDATE registrations
			SET status = $1, updated_at = NOW()
			WHERE id = $2
		`
		_, err = tx.ExecContext(ctx, query, status, id)
	} else {
		_, err = tx.ExecContext(ctx, query, status, adminID, id)
	}
	return err
}

func itoa(i int) string {
	return strconv.Itoa(i)
}

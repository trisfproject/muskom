package candidate

import (
	"context"
	"database/sql"
	"errors"
	"strconv"

	"github.com/jmoiron/sqlx"
)

var (
	ErrNotFound      = errors.New("candidate not found")
	ErrDuplicateReg  = errors.New("registration number already exists")
)

type Repository interface {
	Create(ctx context.Context, candidate *Candidate) error
	GetByID(ctx context.Context, id string) (*Candidate, error)
	FindAll(ctx context.Context) ([]Candidate, error)
	Update(ctx context.Context, candidate *Candidate) error
	Delete(ctx context.Context, id string) error
	CountByMusyawarah(ctx context.Context, musyawarahID string) (int, error)

	SaveDocument(ctx context.Context, doc *CandidateDocument) error
	GetDocumentByID(ctx context.Context, id string) (*CandidateDocument, error)
	FindDocumentsByCandidateID(ctx context.Context, candidateID string) ([]CandidateDocument, error)
	DeleteDocument(ctx context.Context, id string) error

	// Admin operations
	AdminListCandidates(ctx context.Context, statusFilter string, musyawarahFilter string, search string) ([]Candidate, error)
	AdminUpdateStatus(ctx context.Context, id string, status string, notes *string) error
	AdminUpdateDocumentStatus(ctx context.Context, docID string, status string, notes *string) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, c *Candidate) error {
	query := `
		INSERT INTO candidates (
			musyawarah_id, registration_number, full_name, nickname, email, phone, gender,
			birth_place, birth_date, occupation, organization, address, biography,
			motivation, vision, mission, profile_photo, status
		) VALUES (
			:musyawarah_id, :registration_number, :full_name, :nickname, :email, :phone, :gender,
			:birth_place, :birth_date, :occupation, :organization, :address, :biography,
			:motivation, :vision, :mission, :profile_photo, :status
		) RETURNING id, created_at, updated_at
	`
	
	stmt, err := r.db.PrepareNamedContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	err = stmt.GetContext(ctx, c, c)
	if err != nil {
		// Basic check for unique constraint violation
		if err.Error() == "pq: duplicate key value violates unique constraint \"candidates_registration_number_key\"" {
			return ErrDuplicateReg
		}
		return err
	}
	return nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*Candidate, error) {
	query := `SELECT * FROM candidates WHERE id = $1 AND deleted_at IS NULL`
	var c Candidate
	err := r.db.GetContext(ctx, &c, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &c, nil
}

func (r *repository) FindAll(ctx context.Context) ([]Candidate, error) {
	query := `SELECT * FROM candidates WHERE deleted_at IS NULL ORDER BY created_at DESC`
	var candidates []Candidate
	err := r.db.SelectContext(ctx, &candidates, query)
	if err != nil {
		return nil, err
	}
	return candidates, nil
}

func (r *repository) Update(ctx context.Context, c *Candidate) error {
	query := `
		UPDATE candidates SET
			full_name = :full_name,
			nickname = :nickname,
			email = :email,
			phone = :phone,
			gender = :gender,
			birth_place = :birth_place,
			birth_date = :birth_date,
			occupation = :occupation,
			organization = :organization,
			address = :address,
			biography = :biography,
			motivation = :motivation,
			vision = :vision,
			mission = :mission,
			profile_photo = :profile_photo,
			status = :status,
			updated_at = NOW()
		WHERE id = :id AND deleted_at IS NULL
		RETURNING updated_at
	`
	
	stmt, err := r.db.PrepareNamedContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	err = stmt.GetContext(ctx, c, c)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}
	return nil
}

func (r *repository) Delete(ctx context.Context, id string) error {
	query := `UPDATE candidates SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *repository) CountByMusyawarah(ctx context.Context, musyawarahID string) (int, error) {
	query := `SELECT COUNT(*) FROM candidates WHERE musyawarah_id = $1 AND deleted_at IS NULL`
	var count int
	err := r.db.GetContext(ctx, &count, query, musyawarahID)
	return count, err
}

func (r *repository) SaveDocument(ctx context.Context, doc *CandidateDocument) error {
	query := `
		INSERT INTO candidate_documents (
			candidate_id, document_type, original_filename, stored_filename, mime_type, file_size, checksum, storage_provider, storage_path
		) VALUES (
			:candidate_id, :document_type, :original_filename, :stored_filename, :mime_type, :file_size, :checksum, :storage_provider, :storage_path
		)
		ON CONFLICT (candidate_id, document_type) WHERE deleted_at IS NULL
		DO UPDATE SET
			original_filename = EXCLUDED.original_filename,
			stored_filename = EXCLUDED.stored_filename,
			mime_type = EXCLUDED.mime_type,
			file_size = EXCLUDED.file_size,
			checksum = EXCLUDED.checksum,
			storage_provider = EXCLUDED.storage_provider,
			storage_path = EXCLUDED.storage_path,
			updated_at = NOW()
		RETURNING id, uploaded_at, updated_at
	`
	
	stmt, err := r.db.PrepareNamedContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	return stmt.GetContext(ctx, doc, doc)
}

func (r *repository) GetDocumentByID(ctx context.Context, id string) (*CandidateDocument, error) {
	query := `SELECT * FROM candidate_documents WHERE id = $1 AND deleted_at IS NULL`
	var doc CandidateDocument
	err := r.db.GetContext(ctx, &doc, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &doc, nil
}

func (r *repository) FindDocumentsByCandidateID(ctx context.Context, candidateID string) ([]CandidateDocument, error) {
	query := `SELECT * FROM candidate_documents WHERE candidate_id = $1 AND deleted_at IS NULL ORDER BY uploaded_at ASC`
	var docs []CandidateDocument
	err := r.db.SelectContext(ctx, &docs, query, candidateID)
	if err != nil {
		return nil, err
	}
	if docs == nil {
		docs = []CandidateDocument{}
	}
	return docs, nil
}

func (r *repository) DeleteDocument(ctx context.Context, id string) error {
	query := `UPDATE candidate_documents SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *repository) AdminListCandidates(ctx context.Context, statusFilter string, musyawarahFilter string, search string) ([]Candidate, error) {
	query := `SELECT * FROM candidates WHERE deleted_at IS NULL`
	args := []interface{}{}
	argID := 1

	if statusFilter != "" {
		query += ` AND status = $` + strconv.Itoa(argID)
		args = append(args, statusFilter)
		argID++
	}

	if musyawarahFilter != "" {
		query += ` AND musyawarah_id = $` + strconv.Itoa(argID)
		args = append(args, musyawarahFilter)
		argID++
	}

	if search != "" {
		query += ` AND (full_name ILIKE $` + strconv.Itoa(argID) + ` OR registration_number ILIKE $` + strconv.Itoa(argID) + `)`
		args = append(args, "%"+search+"%")
		argID++
	}

	query += ` ORDER BY created_at DESC`
	var candidates []Candidate
	err := r.db.SelectContext(ctx, &candidates, query, args...)
	if err != nil {
		return nil, err
	}
	if candidates == nil {
		candidates = []Candidate{}
	}
	return candidates, nil
}

func (r *repository) AdminUpdateStatus(ctx context.Context, id string, status string, notes *string) error {
	query := `UPDATE candidates SET status = $1, verification_notes = $2, updated_at = NOW() WHERE id = $3 AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, status, notes, id)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *repository) AdminUpdateDocumentStatus(ctx context.Context, docID string, status string, notes *string) error {
	query := `UPDATE candidate_documents SET verification_status = $1, verification_notes = $2, updated_at = NOW() WHERE id = $3 AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, status, notes, docID)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrNotFound
	}
	return nil
}

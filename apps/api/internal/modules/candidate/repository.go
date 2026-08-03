package candidate

import (
	"context"
	"database/sql"
	"errors"

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

package participant

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
)

var (
	ErrNotFound      = errors.New("participant not found")
	ErrDuplicateReg  = errors.New("registration number already exists")
)

type Repository interface {
	Create(ctx context.Context, p *Participant) error
	GetByID(ctx context.Context, id string) (*Participant, error)
	FindAll(ctx context.Context) ([]Participant, error)
	Update(ctx context.Context, p *Participant) error
	UpdateStatus(ctx context.Context, id string, status string) error
	Delete(ctx context.Context, id string) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, p *Participant) error {
	query := `
		INSERT INTO participants (
			musyawarah_id, registration_number, full_name, email, phone, 
			organization, position, membership_number, province, city, status
		) VALUES (
			:musyawarah_id, :registration_number, :full_name, :email, :phone, 
			:organization, :position, :membership_number, :province, :city, :status
		) RETURNING id, created_at, updated_at
	`
	
	stmt, err := r.db.PrepareNamedContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	err = stmt.GetContext(ctx, p, p)
	if err != nil {
		if err.Error() == "pq: duplicate key value violates unique constraint \"participants_registration_number_key\"" {
			return ErrDuplicateReg
		}
		return err
	}
	return nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*Participant, error) {
	query := `SELECT * FROM participants WHERE id = $1 AND deleted_at IS NULL`
	var p Participant
	err := r.db.GetContext(ctx, &p, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &p, nil
}

func (r *repository) FindAll(ctx context.Context) ([]Participant, error) {
	query := `SELECT * FROM participants WHERE deleted_at IS NULL ORDER BY created_at DESC`
	var list []Participant
	err := r.db.SelectContext(ctx, &list, query)
	if err != nil {
		return nil, err
	}
	if list == nil {
		list = []Participant{}
	}
	return list, nil
}

func (r *repository) Update(ctx context.Context, p *Participant) error {
	query := `
		UPDATE participants SET
			registration_number = :registration_number,
			full_name = :full_name,
			email = :email,
			phone = :phone,
			organization = :organization,
			position = :position,
			membership_number = :membership_number,
			province = :province,
			city = :city,
			updated_at = NOW()
		WHERE id = :id AND deleted_at IS NULL
		RETURNING updated_at
	`
	
	stmt, err := r.db.PrepareNamedContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	err = stmt.GetContext(ctx, p, p)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		if err.Error() == "pq: duplicate key value violates unique constraint \"participants_registration_number_key\"" {
			return ErrDuplicateReg
		}
		return err
	}
	return nil
}

func (r *repository) UpdateStatus(ctx context.Context, id string, status string) error {
	query := `UPDATE participants SET status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, status, id)
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

func (r *repository) Delete(ctx context.Context, id string) error {
	query := `UPDATE participants SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
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

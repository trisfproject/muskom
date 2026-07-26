package event

import (
	"context"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	Create(ctx context.Context, e *Event) error
	FindByID(ctx context.Context, id string) (*Event, error)
	List(ctx context.Context, limit, offset int) ([]Event, int, error)
	Update(ctx context.Context, e *Event) error
	SoftDelete(ctx context.Context, id string) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, e *Event) error {
	query := `
		INSERT INTO events (name, slug, theme, description, location, start_date, event_date, status, created_at, updated_at)
		VALUES (:name, :slug, :theme, :description, :location, :start_date, :event_date, 'DRAFT', NOW(), NOW())
		RETURNING id, status, created_at, updated_at
	`
	rows, err := r.db.NamedQueryContext(ctx, query, e)
	if err != nil {
		return err
	}
	defer rows.Close()

	if rows.Next() {
		return rows.StructScan(e)
	}
	return nil
}

func (r *repository) FindByID(ctx context.Context, id string) (*Event, error) {
	query := `SELECT * FROM events WHERE id = $1 AND deleted_at IS NULL`
	var e Event
	err := r.db.GetContext(ctx, &e, query, id)
	return &e, err
}

func (r *repository) List(ctx context.Context, limit, offset int) ([]Event, int, error) {
	var events []Event
	query := `SELECT * FROM events WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2`
	err := r.db.SelectContext(ctx, &events, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	var total int
	countQuery := `SELECT COUNT(*) FROM events WHERE deleted_at IS NULL`
	err = r.db.GetContext(ctx, &total, countQuery)
	return events, total, err
}

func (r *repository) Update(ctx context.Context, e *Event) error {
	query := `
		UPDATE events 
		SET name = :name, slug = :slug, theme = :theme, description = :description, location = :location, 
		    start_date = :start_date, event_date = :event_date, status = :status, updated_at = NOW()
		WHERE id = :id AND deleted_at IS NULL
	`
	_, err := r.db.NamedExecContext(ctx, query, e)
	return err
}

func (r *repository) SoftDelete(ctx context.Context, id string) error {
	query := `UPDATE events SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

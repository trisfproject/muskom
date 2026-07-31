package eventctx

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

var (
	ErrNoActiveEvent = errors.New("no active event found")
	ErrEventNotFound = errors.New("event not found")
)

type EventResolver interface {
	Resolve(ctx context.Context, headerEventID string) (*EventContext, error)
	GetDefaultActive(ctx context.Context) (*EventContext, error)
}

type resolver struct {
	db  *sqlx.DB
	log *zap.Logger
}

func NewResolver(db *sqlx.DB, log *zap.Logger) EventResolver {
	return &resolver{db: db, log: log}
}

func (r *resolver) Resolve(ctx context.Context, headerEventID string) (*EventContext, error) {
	if headerEventID != "" {
		return r.getByID(ctx, headerEventID)
	}
	return r.GetDefaultActive(ctx)
}

func (r *resolver) getByID(ctx context.Context, id string) (*EventContext, error) {
	query := `SELECT id, slug, name, status, settings FROM events WHERE id = $1 AND deleted_at IS NULL`
	return r.fetchOne(ctx, query, id)
}

func (r *resolver) GetDefaultActive(ctx context.Context) (*EventContext, error) {
	query := `SELECT id, slug, name, status, settings FROM events WHERE is_default_active = true AND deleted_at IS NULL LIMIT 1`
	return r.fetchOne(ctx, query)
}

func (r *resolver) fetchOne(ctx context.Context, query string, args ...interface{}) (*EventContext, error) {
	var row struct {
		ID       string `db:"id"`
		Slug     string `db:"slug"`
		Name     string `db:"name"`
		Status   string `db:"status"`
		Settings []byte `db:"settings"`
	}

	err := r.db.GetContext(ctx, &row, query, args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrEventNotFound
		}
		r.log.Error("Failed to fetch event context", zap.Error(err))
		return nil, err
	}

	return &EventContext{
		ID:       row.ID,
		Slug:     row.Slug,
		Name:     row.Name,
		Status:   row.Status,
		Settings: ParseSettings(row.Settings),
	}, nil
}

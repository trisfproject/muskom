package audit

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) AuditRepository {
	return &repository{db: db}
}

func (r *repository) Insert(ctx context.Context, entry AuditEntry) error {
	query := `
		INSERT INTO audit_logs (module, entity, entity_id, action, user_id, actor_role, reason, ip_address, user_agent, metadata, previous_value, new_value, correlation_id)
		VALUES (:module, :entity, :entity_id, :action, :user_id, :actor_role, :reason, :ip_address, :user_agent, :metadata, :previous_value, :new_value, :correlation_id)
	`
	_, err := r.db.NamedExecContext(ctx, query, entry)
	return err
}

func (r *repository) InsertTx(ctx context.Context, tx *sqlx.Tx, entry AuditEntry) error {
	query := `
		INSERT INTO audit_logs (module, entity, entity_id, action, user_id, actor_role, reason, ip_address, user_agent, metadata, previous_value, new_value, correlation_id)
		VALUES (:module, :entity, :entity_id, :action, :user_id, :actor_role, :reason, :ip_address, :user_agent, :metadata, :previous_value, :new_value, :correlation_id)
	`
	_, err := tx.NamedExecContext(ctx, query, entry)
	return err
}

func (r *repository) Search(ctx context.Context, filter AuditFilter) ([]AuditEntry, int, error) {
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

	if filter.Module != "" {
		whereClause += fmt.Sprintf(" AND module = $%d", argIdx)
		args = append(args, filter.Module)
		argIdx++
	}

	if filter.Action != "" {
		whereClause += fmt.Sprintf(" AND action = $%d", argIdx)
		args = append(args, filter.Action)
		argIdx++
	}

	if filter.Entity != "" {
		whereClause += fmt.Sprintf(" AND entity = $%d", argIdx)
		args = append(args, filter.Entity)
		argIdx++
	}

	if filter.EntityID != "" {
		whereClause += fmt.Sprintf(" AND entity_id = $%d", argIdx)
		args = append(args, filter.EntityID)
		argIdx++
	}

	if filter.ActorID != "" {
		whereClause += fmt.Sprintf(" AND user_id = $%d", argIdx)
		args = append(args, filter.ActorID)
		argIdx++
	}

	if filter.StartDate != "" {
		whereClause += fmt.Sprintf(" AND created_at >= $%d", argIdx)
		args = append(args, filter.StartDate)
		argIdx++
	}

	if filter.EndDate != "" {
		whereClause += fmt.Sprintf(" AND created_at <= $%d", argIdx)
		args = append(args, filter.EndDate)
		argIdx++
	}

	countQuery := fmt.Sprintf(`SELECT COUNT(1) FROM audit_logs %s`, whereClause)
	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`
		SELECT id, module, action, entity, entity_id, user_id, actor_role, reason, ip_address, user_agent, metadata, previous_value, new_value, correlation_id, created_at
		FROM audit_logs
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIdx, argIdx+1)

	args = append(args, limit, offset)

	var items []AuditEntry
	if err := r.db.SelectContext(ctx, &items, query, args...); err != nil {
		return nil, 0, err
	}

	if items == nil {
		items = []AuditEntry{}
	}

	return items, total, nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*AuditEntry, error) {
	query := `
		SELECT id, module, action, entity, entity_id, user_id, actor_role, reason, ip_address, user_agent, metadata, previous_value, new_value, correlation_id, created_at
		FROM audit_logs
		WHERE id = $1
	`
	var entry AuditEntry
	if err := r.db.GetContext(ctx, &entry, query, id); err != nil {
		return nil, err
	}
	return &entry, nil
}

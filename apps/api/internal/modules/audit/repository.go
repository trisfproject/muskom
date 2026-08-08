package audit

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) AuditRepository {
	return &repository{db: db}
}

func parseUUID(id string) *string {
	if id == "" {
		return nil
	}
	if _, err := uuid.Parse(id); err == nil {
		return &id
	}
	return nil
}

func marshalJSON(v interface{}) interface{} {
	if v == nil {
		return nil
	}
	switch val := v.(type) {
	case string:
		return val
	case []byte:
		return string(val)
	default:
		b, err := json.Marshal(v)
		if err != nil {
			return nil
		}
		return string(b)
	}
}

func (r *repository) Insert(ctx context.Context, entry AuditEntry) error {
	query := `
		INSERT INTO audit_logs (module, entity, entity_id, action, user_id, actor_role, reason, ip_address, user_agent, metadata, previous_value, new_value, correlation_id)
		VALUES (:module, :entity, :entity_id, :action, :user_id, :actor_role, :reason, :ip_address, :user_agent, :metadata, :previous_value, :new_value, :correlation_id)
	`
	var entityID *string
	if entry.EntityID != nil {
		entityID = parseUUID(*entry.EntityID)
	}
	var actorID *string
	if entry.ActorID != nil {
		actorID = parseUUID(*entry.ActorID)
	}

	_, err := r.db.NamedExecContext(ctx, query, map[string]interface{}{
		"module":         entry.Module,
		"entity":         entry.Entity,
		"entity_id":      entityID,
		"action":         entry.Action,
		"user_id":        actorID,
		"actor_role":     entry.ActorRole,
		"reason":         entry.Reason,
		"ip_address":     entry.IPAddress,
		"user_agent":     entry.UserAgent,
		"metadata":       marshalJSON(entry.Metadata),
		"previous_value": marshalJSON(entry.PreviousValue),
		"new_value":      marshalJSON(entry.NewValue),
		"correlation_id": entry.CorrelationID,
	})
	return err
}

func (r *repository) InsertTx(ctx context.Context, tx *sqlx.Tx, entry AuditEntry) error {
	query := `
		INSERT INTO audit_logs (module, entity, entity_id, action, user_id, actor_role, reason, ip_address, user_agent, metadata, previous_value, new_value, correlation_id)
		VALUES (:module, :entity, :entity_id, :action, :user_id, :actor_role, :reason, :ip_address, :user_agent, :metadata, :previous_value, :new_value, :correlation_id)
	`
	var entityID *string
	if entry.EntityID != nil {
		entityID = parseUUID(*entry.EntityID)
	}
	var actorID *string
	if entry.ActorID != nil {
		actorID = parseUUID(*entry.ActorID)
	}

	_, err := tx.NamedExecContext(ctx, query, map[string]interface{}{
		"module":         entry.Module,
		"entity":         entry.Entity,
		"entity_id":      entityID,
		"action":         entry.Action,
		"user_id":        actorID,
		"actor_role":     entry.ActorRole,
		"reason":         entry.Reason,
		"ip_address":     entry.IPAddress,
		"user_agent":     entry.UserAgent,
		"metadata":       marshalJSON(entry.Metadata),
		"previous_value": marshalJSON(entry.PreviousValue),
		"new_value":      marshalJSON(entry.NewValue),
		"correlation_id": entry.CorrelationID,
	})
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
		whereClause += fmt.Sprintf(" AND al.module = $%d", argIdx)
		args = append(args, filter.Module)
		argIdx++
	}

	if filter.Action != "" {
		whereClause += fmt.Sprintf(" AND al.action = $%d", argIdx)
		args = append(args, filter.Action)
		argIdx++
	}

	if filter.Entity != "" {
		whereClause += fmt.Sprintf(" AND al.entity = $%d", argIdx)
		args = append(args, filter.Entity)
		argIdx++
	}

	if filter.EntityID != "" {
		if _, err := uuid.Parse(filter.EntityID); err == nil {
			whereClause += fmt.Sprintf(" AND al.entity_id = $%d", argIdx)
			args = append(args, filter.EntityID)
			argIdx++
		}
	}

	if filter.ActorID != "" {
		whereClause += fmt.Sprintf(" AND al.user_id = $%d", argIdx)
		args = append(args, filter.ActorID)
		argIdx++
	}

	if filter.StartDate != "" {
		whereClause += fmt.Sprintf(" AND al.created_at >= $%d", argIdx)
		args = append(args, filter.StartDate)
		argIdx++
	}

	if filter.EndDate != "" {
		whereClause += fmt.Sprintf(" AND al.created_at <= $%d", argIdx)
		args = append(args, filter.EndDate)
		argIdx++
	}

	countQuery := fmt.Sprintf(`SELECT COUNT(1) FROM audit_logs al %s`, whereClause)
	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`
		SELECT al.id, al.module, al.action, al.entity, al.entity_id, al.user_id, al.actor_role, 
		       al.reason, al.ip_address, al.user_agent, al.metadata, al.previous_value, 
		       al.new_value, al.correlation_id, al.created_at, p.full_name as actor_name
		FROM audit_logs al
		LEFT JOIN users u ON al.user_id = u.id
		LEFT JOIN persons p ON u.person_id = p.id
		%s
		ORDER BY al.created_at DESC, al.id DESC
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

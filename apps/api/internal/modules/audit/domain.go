package audit

import (
	"context"
	"time"
	
	"github.com/jmoiron/sqlx"
)

type AuditModule string
type AuditAction string

const (
	ModuleAttendance  AuditModule = "attendance"
	ModuleVoting      AuditModule = "voting"
	ModuleParticipant AuditModule = "participant"
	ModuleCandidate   AuditModule = "candidate"
	ModuleEvent       AuditModule = "event"
	ModuleSystem      AuditModule = "system"
)

type AuditEntry struct {
	ID            string      `json:"id" db:"id"`
	Module        AuditModule `json:"module" db:"module"`
	Entity        string      `json:"entity" db:"entity"`
	EntityID      *string     `json:"entity_id" db:"entity_id"`
	Action        AuditAction `json:"action" db:"action"`
	ActorID       *string     `json:"actor_id" db:"user_id"`
	ActorRole     *string     `json:"actor_role" db:"actor_role"`
	Reason        *string     `json:"reason" db:"reason"`
	IPAddress     *string     `json:"ip_address" db:"ip_address"`
	UserAgent     *string     `json:"user_agent" db:"user_agent"`
	Metadata      interface{} `json:"metadata" db:"metadata"`
	PreviousValue interface{} `json:"previous_value" db:"previous_value"`
	NewValue      interface{} `json:"new_value" db:"new_value"`
	CorrelationID *string     `json:"correlation_id" db:"correlation_id"`
	CreatedAt     time.Time   `json:"created_at" db:"created_at"`
}

type AuditFilter struct {
	Page      int
	Limit     int
	Module    string
	Action    string
	Entity    string
	EntityID  string
	ActorID   string
	StartDate string
	EndDate   string
}

type AuditService interface {
	LogActivityAsync(ctx context.Context, entry AuditEntry)
	LogActivityTx(ctx context.Context, tx *sqlx.Tx, entry AuditEntry) error
	Search(ctx context.Context, filter AuditFilter, operatorID string) ([]AuditEntry, int, error)
	GetByID(ctx context.Context, id string, operatorID string) (*AuditEntry, error)
}

type AuditRepository interface {
	Insert(ctx context.Context, entry AuditEntry) error
	InsertTx(ctx context.Context, tx *sqlx.Tx, entry AuditEntry) error
	Search(ctx context.Context, filter AuditFilter) ([]AuditEntry, int, error)
	GetByID(ctx context.Context, id string) (*AuditEntry, error)
}

func StringPtr(s string) *string {
	return &s
}

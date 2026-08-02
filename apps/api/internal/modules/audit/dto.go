package audit

import "time"

type AuditListRequest struct {
	Page      int    `query:"page"`
	Limit     int    `query:"limit"`
	Module    string `query:"module"`
	Action    string `query:"action"`
	Entity    string `query:"entity"`
	EntityID  string `query:"entity_id"`
	ActorID   string `query:"actor_id"`
	StartDate string `query:"start_date"`
	EndDate   string `query:"end_date"`
}

type AuditDetailResponse struct {
	ID        string      `json:"id"`
	Module    string      `json:"module"`
	Entity    string      `json:"entity"`
	EntityID  string      `json:"entity_id"`
	Action    string      `json:"action"`
	ActorID   *string     `json:"actor_id,omitempty"`
	ActorRole *string     `json:"actor_role,omitempty"`
	Reason        *string     `json:"reason,omitempty"`
	IPAddress     *string     `json:"ip_address,omitempty"`
	UserAgent     *string     `json:"user_agent,omitempty"`
	Metadata      interface{} `json:"metadata,omitempty"`
	PreviousValue interface{} `json:"previous_value,omitempty"`
	NewValue      interface{} `json:"new_value,omitempty"`
	CorrelationID *string     `json:"correlation_id,omitempty"`
	CreatedAt time.Time   `json:"created_at"`
}

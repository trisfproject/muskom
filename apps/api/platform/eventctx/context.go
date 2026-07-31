package eventctx

import (
	"context"
	"encoding/json"
)

type EventSettings struct {
	RegistrationEnabled bool `json:"registration_enabled"`
	CandidateEnabled    bool `json:"candidate_enabled"`
	AttendanceEnabled   bool `json:"attendance_enabled"`
	VotingEnabled       bool `json:"voting_enabled"`
	NotificationEnabled bool `json:"notification_enabled"`
	RealtimeEnabled     bool `json:"realtime_enabled"`
}

type EventContext struct {
	ID       string
	Slug     string
	Name     string
	Status   string // Dynamic workflow state
	Settings EventSettings
}

// contextKey is a distinct type to avoid collisions in context.Context
type contextKey string

const (
	EventContextKey contextKey = "event_context"
)

// WithEventContext injects the EventContext into a standard Go context.
func WithEventContext(ctx context.Context, ec *EventContext) context.Context {
	return context.WithValue(ctx, EventContextKey, ec)
}

// FromContext extracts the EventContext from a standard Go context.
func FromContext(ctx context.Context) *EventContext {
	val, ok := ctx.Value(EventContextKey).(*EventContext)
	if !ok {
		return nil
	}
	return val
}

// ParseSettings parses raw JSON into EventSettings.
func ParseSettings(raw []byte) EventSettings {
	var s EventSettings
	if len(raw) == 0 {
		return s
	}
	_ = json.Unmarshal(raw, &s)
	return s
}

package eventbus

import (
	"time"

	"github.com/google/uuid"
)

type EventType string

const (
	EventParticipantApproved EventType = "ParticipantApproved"
	EventParticipantRejected EventType = "ParticipantRejected"
	EventCandidateVerified   EventType = "CandidateVerified"
	EventAttendanceCheckedIn EventType = "AttendanceCheckedIn"
	EventAttendanceUndone    EventType = "AttendanceUndone"
	EventVotingStarted       EventType = "VotingStarted"
	EventVotingStopped       EventType = "VotingStopped"
	EventVoteSubmitted       EventType = "VoteSubmitted"
	EventNotificationQueued  EventType = "NotificationQueued"
	EventEventPublished      EventType = "EventPublished"
	EventEventCompleted      EventType = "EventCompleted"
)

// EventEnvelope standardizes the delivery of all Domain Events across the platform
type EventEnvelope struct {
	ID            string    `json:"id"`
	CorrelationID string    `json:"correlation_id"`
	EventID       string    `json:"event_id"` // The aggregate root (Tenant)
	Type          EventType `json:"type"`
	Timestamp     time.Time `json:"timestamp"`
	Payload       any       `json:"payload"`
}

func NewEnvelope(eventID string, eventType EventType, payload any) *EventEnvelope {
	return &EventEnvelope{
		ID:            uuid.NewString(),
		CorrelationID: uuid.NewString(),
		EventID:       eventID,
		Type:          eventType,
		Timestamp:     time.Now().UTC(),
		Payload:       payload,
	}
}

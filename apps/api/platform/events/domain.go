package events

import (
	"time"
)

// DomainEvent represents a common contract for all domain events
type DomainEvent interface {
	EventName() string
	OccurredAt() time.Time
}

// BaseEvent provides common properties for domain events
type BaseEvent struct {
	Timestamp time.Time `json:"timestamp"`
}

func (e BaseEvent) OccurredAt() time.Time {
	return e.Timestamp
}

// ParticipantApproved is emitted when a participant verification is successful
type ParticipantApproved struct {
	BaseEvent
	RegistrationID string `json:"registration_id"`
	ApprovedBy     string `json:"approved_by"`
}

func (e ParticipantApproved) EventName() string { return "ParticipantApproved" }

// CandidateApproved is emitted when a candidate verification is successful
type CandidateApproved struct {
	BaseEvent
	CandidateID string `json:"candidate_id"`
	ApprovedBy  string `json:"approved_by"`
}

func (e CandidateApproved) EventName() string { return "CandidateApproved" }

// AttendanceCheckedIn is emitted when a participant successfully checks in
type AttendanceCheckedIn struct {
	BaseEvent
	RegistrationID string `json:"registration_id"`
	OperatorID     string `json:"operator_id"`
}

func (e AttendanceCheckedIn) EventName() string { return "AttendanceCheckedIn" }

// AttendanceUndone is emitted when an attendance is revoked (if supported)
type AttendanceUndone struct {
	BaseEvent
	RegistrationID string `json:"registration_id"`
	OperatorID     string `json:"operator_id"`
	Reason         string `json:"reason"`
}

func (e AttendanceUndone) EventName() string { return "AttendanceUndone" }

// VotingStarted is emitted when a voting session is initialized and opened
type VotingStarted struct {
	BaseEvent
	SessionID string `json:"session_id"`
	EventID   string `json:"event_id"`
}

func (e VotingStarted) EventName() string { return "VotingStarted" }

// VotingStopped is emitted when a voting session is closed
type VotingStopped struct {
	BaseEvent
	SessionID string `json:"session_id"`
	EventID   string `json:"event_id"`
}

func (e VotingStopped) EventName() string { return "VotingStopped" }

// VoteSubmitted is emitted when a participant casts a vote
type VoteSubmitted struct {
	BaseEvent
	SessionID string `json:"session_id"`
	VoterID   string `json:"voter_id"`
}

func (e VoteSubmitted) EventName() string { return "VoteSubmitted" }

// NotificationQueued is emitted when a notification is successfully queued for sending
type NotificationQueued struct {
	BaseEvent
	NotificationID string `json:"notification_id"`
	Channel        string `json:"channel"`
}

func (e NotificationQueued) EventName() string { return "NotificationQueued" }

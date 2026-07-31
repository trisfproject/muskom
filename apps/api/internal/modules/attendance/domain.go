package attendance

import (
	"context"
	"time"
)

// AttendanceStatus represents the state of a participant's attendance
type AttendanceStatus string

const (
	StatusPresent AttendanceStatus = "PRESENT"
	StatusAbsent  AttendanceStatus = "ABSENT"
)

// AttendanceEvent represents the core domain entity for a check-in
type AttendanceEvent struct {
	ID             string           `json:"id"`
	RegistrationID string           `json:"registration_id"`
	Status         AttendanceStatus `json:"status"`
	CheckedInAt    time.Time        `json:"checked_in_at"`
	OperatorID     string           `json:"operator_id"`
}

// AttendanceSummary represents the real-time aggregate stats
type AttendanceSummary struct {
	TotalParticipants int `json:"total_participants"`
	TotalPresent      int `json:"total_present"`
	TotalAbsent       int `json:"total_absent"`
}

// AttendanceService defines the business operations for attendance
type AttendanceService interface {
	CheckIn(ctx context.Context, registrationID string, operatorID string) (*AttendanceEvent, error)
	GetSummary(ctx context.Context, eventID string) (*AttendanceSummary, error)
	GetStatus(ctx context.Context, registrationID string) (*AttendanceStatus, error)
}

// AttendanceRepository defines the data access contract
type AttendanceRepository interface {
	RecordCheckIn(ctx context.Context, event *AttendanceEvent) error
	GetSummaryByEvent(ctx context.Context, eventID string) (*AttendanceSummary, error)
	GetByRegistrationID(ctx context.Context, registrationID string) (*AttendanceEvent, error)
}

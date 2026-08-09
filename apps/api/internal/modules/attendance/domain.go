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
	ID            string           `json:"id"`
	ParticipantID string           `json:"participant_id"`
	Status        AttendanceStatus `json:"status"`
	CheckedInAt   time.Time        `json:"checked_in_at"`
	OperatorID    string           `json:"operator_id"`
}

// AttendanceSummary represents the real-time aggregate stats
type AttendanceSummary struct {
	TotalParticipants int `json:"total_participants" db:"total_participants"`
	TotalPresent      int `json:"total_present" db:"total_present"`
	TotalAbsent       int `json:"total_absent" db:"total_absent"`
}

// AttendanceService defines the business operations for attendance
type AttendanceService interface {
	CheckIn(ctx context.Context, participantID string, operatorID string) (*AttendanceEvent, error)
	UndoCheckIn(ctx context.Context, checkInID string, operatorID string) error
	GetAttendance(ctx context.Context, participantID string) (*AttendanceEvent, error)
	GetSummary(ctx context.Context, eventID string) (*AttendanceSummary, error)
	Search(ctx context.Context, query string, limit, offset int) ([]AttendanceEvent, error)
}

// AttendanceRepository defines the data access contract
type AttendanceRepository interface {
	RecordCheckIn(ctx context.Context, event *AttendanceEvent) error
	GetSummaryByEvent(ctx context.Context, eventID string) (*AttendanceSummary, error)
	GetByParticipantID(ctx context.Context, participantID string) (*AttendanceEvent, error)
}

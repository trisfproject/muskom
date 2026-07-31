package attendance

import "time"

type CheckInRequest struct {
	RegistrationID string `json:"registration_id" validate:"required,uuid"`
}

type CheckInResponse struct {
	Success bool `json:"success"`
	IsNew   bool `json:"is_new"`
}

type AttendanceDetailResponse struct {
	ID             string    `json:"id" db:"id"`
	RegistrationID string    `json:"registration_id" db:"registration_id"`
	CheckedInAt    time.Time `json:"checked_in_at" db:"checked_in_at"`
	CheckedInBy    *string   `json:"checked_in_by,omitempty" db:"checked_in_by"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
	FullName       string    `json:"full_name" db:"full_name"`
	Email          string    `json:"email" db:"email"`
	Phone          string    `json:"phone" db:"phone"`
	Institution    string    `json:"institution" db:"institution"`
}

type AttendanceListRequest struct {
	Page               int    `query:"page"`
	Limit              int    `query:"limit"`
	SortBy             string `query:"sort_by"`
	SortDirection      string `query:"sort_direction"`
	AttendanceStatus   string `query:"attendance_status"`
	ParticipantID      string `query:"participant_id"`
	ParticipantName    string `query:"participant_name"`
	CheckInDate        string `query:"check_in_date"`
	VerificationStatus string `query:"verification_status"`
}

type AttendanceItemResponse struct {
	RegistrationID     string     `json:"registration_id" db:"registration_id"`
	ParticipantName    string     `json:"participant_name" db:"participant_name"`
	Institution        string     `json:"institution" db:"institution"`
	VerificationStatus string     `json:"verification_status" db:"verification_status"`
	AttendanceStatus   string     `json:"attendance_status" db:"attendance_status"`
	CheckedInAt        *time.Time `json:"checked_in_at,omitempty" db:"checked_in_at"`
}

type CorrectAttendanceRequest struct {
	Notes string `json:"notes" validate:"required"`
}

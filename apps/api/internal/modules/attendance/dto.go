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
	ID             string    `json:"id"`
	RegistrationID string    `json:"registration_id"`
	CheckedInAt    time.Time `json:"checked_in_at"`
	CheckedInBy    *string   `json:"checked_in_by,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	FullName       string    `json:"full_name"`
	Email          string    `json:"email"`
	Phone          string    `json:"phone"`
	Institution    string    `json:"institution"`
}

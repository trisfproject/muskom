package participant

import "time"

// Participant represents the participants table in the database
type Participant struct {
	ID                 string     `db:"id" json:"id"`
	MusyawarahID       string     `db:"musyawarah_id" json:"musyawarah_id"`
	RegistrationNumber string     `db:"registration_number" json:"registration_number"`
	FullName           string     `db:"full_name" json:"full_name"`
	Email              string     `db:"email" json:"email"`
	Phone              string     `db:"phone" json:"phone"`
	Organization       string     `db:"organization" json:"organization"`
	Position           string     `db:"position" json:"position"`
	MembershipNumber   string     `db:"membership_number" json:"membership_number"`
	Province           string     `db:"province" json:"province"`
	City               string     `db:"city" json:"city"`
	Status             string     `db:"status" json:"status"`
	CreatedAt          time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt          time.Time  `db:"updated_at" json:"updated_at"`
	DeletedAt          *time.Time `db:"deleted_at" json:"-"`
}

// CreateParticipantRequest represents the payload for creating a new participant
type CreateParticipantRequest struct {
	MusyawarahID       string `json:"musyawarah_id" validate:"required,uuid"`
	RegistrationNumber string `json:"registration_number" validate:"required"`
	FullName           string `json:"full_name" validate:"required"`
	Email              string `json:"email" validate:"required,email"`
	Phone              string `json:"phone" validate:"required"`
	Organization       string `json:"organization" validate:"required"`
	Position           string `json:"position" validate:"required"`
	MembershipNumber   string `json:"membership_number" validate:"required"`
	Province           string `json:"province" validate:"required"`
	City               string `json:"city" validate:"required"`
	Status             string `json:"status" validate:"required,oneof=Pending Verified Rejected Eligible"`
}

// UpdateParticipantRequest represents the payload for updating an existing participant
type UpdateParticipantRequest struct {
	RegistrationNumber string `json:"registration_number" validate:"required"`
	FullName           string `json:"full_name" validate:"required"`
	Email              string `json:"email" validate:"required,email"`
	Phone              string `json:"phone" validate:"required"`
	Organization       string `json:"organization" validate:"required"`
	Position           string `json:"position" validate:"required"`
	MembershipNumber   string `json:"membership_number" validate:"required"`
	Province           string `json:"province" validate:"required"`
	City               string `json:"city" validate:"required"`
}

// UpdateStatusRequest represents the payload for updating a participant's status
type UpdateStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=Pending Verified Rejected Eligible"`
}

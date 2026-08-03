package candidate

import (
	"time"
)

// CreateCandidateRequest represents the payload for creating a new candidate.
type CreateCandidateRequest struct {
	MusyawarahID string  `json:"musyawarah_id" validate:"required,uuid"`
	FullName     string  `json:"full_name" validate:"required,max=255"`
	Nickname     *string `json:"nickname" validate:"omitempty,max=100"`
	Email        string  `json:"email" validate:"required,email,max=255"`
	Phone        string  `json:"phone" validate:"required,max=50"`
	Gender       string  `json:"gender" validate:"required,oneof=MALE FEMALE"`
	BirthPlace   *string `json:"birth_place" validate:"omitempty,max=100"`
	BirthDate    *string `json:"birth_date" validate:"omitempty,datetime=2006-01-02"`
	Occupation   *string `json:"occupation" validate:"omitempty,max=255"`
	Organization *string `json:"organization" validate:"omitempty,max=255"`
	Address      *string `json:"address"`
	Biography    *string `json:"biography"`
	Motivation   *string `json:"motivation"`
	Vision       *string `json:"vision"`
	Mission      *string `json:"mission"`
}

// UpdateCandidateRequest represents the payload for fully updating a candidate.
type UpdateCandidateRequest struct {
	FullName     string  `json:"full_name" validate:"required,max=255"`
	Nickname     *string `json:"nickname" validate:"omitempty,max=100"`
	Email        string  `json:"email" validate:"required,email,max=255"`
	Phone        string  `json:"phone" validate:"required,max=50"`
	Gender       string  `json:"gender" validate:"required,oneof=MALE FEMALE"`
	BirthPlace   *string `json:"birth_place" validate:"omitempty,max=100"`
	BirthDate    *string `json:"birth_date" validate:"omitempty,datetime=2006-01-02"`
	Occupation   *string `json:"occupation" validate:"omitempty,max=255"`
	Organization *string `json:"organization" validate:"omitempty,max=255"`
	Address      *string `json:"address"`
	Biography    *string `json:"biography"`
	Motivation   *string `json:"motivation"`
	Vision       *string `json:"vision"`
	Mission      *string `json:"mission"`
	ProfilePhoto *string `json:"profile_photo"`
	Status       *string `json:"status" validate:"omitempty,oneof=Draft Submitted Verified Rejected Published"`
}

// PatchCandidateRequest represents the payload for partially updating a candidate.
type PatchCandidateRequest struct {
	FullName     *string `json:"full_name" validate:"omitempty,max=255"`
	Nickname     *string `json:"nickname" validate:"omitempty,max=100"`
	Email        *string `json:"email" validate:"omitempty,email,max=255"`
	Phone        *string `json:"phone" validate:"omitempty,max=50"`
	Gender       *string `json:"gender" validate:"omitempty,oneof=MALE FEMALE"`
	BirthPlace   *string `json:"birth_place" validate:"omitempty,max=100"`
	BirthDate    *string `json:"birth_date" validate:"omitempty,datetime=2006-01-02"`
	Occupation   *string `json:"occupation" validate:"omitempty,max=255"`
	Organization *string `json:"organization" validate:"omitempty,max=255"`
	Address      *string `json:"address"`
	Biography    *string `json:"biography"`
	Motivation   *string `json:"motivation"`
	Vision       *string `json:"vision"`
	Mission      *string `json:"mission"`
	ProfilePhoto *string `json:"profile_photo"`
	Status       *string `json:"status" validate:"omitempty,oneof=Draft Submitted Verified Rejected Published"`
}

// CandidateResponse represents the response payload for a candidate.
type CandidateResponse struct {
	ID                 string     `json:"id"`
	MusyawarahID       string     `json:"musyawarah_id"`
	RegistrationNumber string     `json:"registration_number"`
	FullName           string     `json:"full_name"`
	Nickname           *string    `json:"nickname,omitempty"`
	Email              string     `json:"email"`
	Phone              string     `json:"phone"`
	Gender             string     `json:"gender"`
	BirthPlace         *string    `json:"birth_place,omitempty"`
	BirthDate          *string    `json:"birth_date,omitempty"`
	Occupation         *string    `json:"occupation,omitempty"`
	Organization       *string    `json:"organization,omitempty"`
	Address            *string    `json:"address,omitempty"`
	Biography          *string    `json:"biography,omitempty"`
	Motivation         *string    `json:"motivation,omitempty"`
	Vision             *string    `json:"vision,omitempty"`
	Mission            *string    `json:"mission,omitempty"`
	ProfilePhoto       *string    `json:"profile_photo,omitempty"`
	Status             string     `json:"status"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

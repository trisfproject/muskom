package verification

import (
	"time"
)

type VerificationListRequest struct {
	QueueType      string `query:"queue_type" validate:"omitempty,oneof=participant candidate all"`
	Status         string `query:"status"`
	SubmissionDate string `query:"submission_date"`
	ApplicantName  string `query:"applicant_name"`
	SortBy         string `query:"sort_by" validate:"omitempty,oneof=created_at status"`
	SortOrder      string `query:"sort_order" validate:"omitempty,oneof=asc desc ASC DESC"`
	Page           int    `query:"page"`
	Limit          int    `query:"limit"`
}

type VerificationItemResponse struct {
	ID            string    `json:"id" db:"id"`
	QueueType     string    `json:"queue_type" db:"queue_type"`
	ApplicantName string    `json:"applicant_name" db:"applicant_name"`
	Status        string    `json:"status" db:"status"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}

type VerificationSummaryResponse struct {
	TotalPending        int `json:"total_pending" db:"total_pending"`
	PendingParticipants int `json:"pending_participants" db:"pending_participants"`
	PendingCandidates   int `json:"pending_candidates" db:"pending_candidates"`
}

type ParticipantDetailResponse struct {
	ID                  string    `json:"id" db:"id"`
	EventID             string    `json:"event_id" db:"event_id"`
	ParticipantCategory string    `json:"participant_category" db:"participant_category"`
	Source              string    `json:"source" db:"source"`
	Status              string    `json:"status" db:"status"`
	RejectionReason     *string   `json:"rejection_reason,omitempty" db:"rejection_reason"`
	CreatedAt           time.Time `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time `json:"updated_at" db:"updated_at"`
	PersonID            string    `json:"person_id" db:"person_id"`
	FullName            string    `json:"full_name" db:"full_name"`
	Email               string    `json:"email" db:"email"`
	Phone               string    `json:"phone" db:"phone"`
	Institution         string    `json:"institution" db:"institution"`
}

type VerifyParticipantRequest struct {
	Status          string  `json:"status" validate:"required,oneof=APPROVED REJECTED"`
	RejectionReason *string `json:"rejection_reason" validate:"omitempty"`
}

type CandidateDetailResponse struct {
	ID                  string    `json:"id" db:"id"`
	RegistrationID      string    `json:"registration_id" db:"registration_id"`
	EventID             string    `json:"event_id" db:"event_id"`
	ParticipantCategory string    `json:"participant_category" db:"participant_category"`
	Source              string    `json:"source" db:"source"`
	Status              string    `json:"status" db:"status"`
	CreatedAt           time.Time `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time `json:"updated_at" db:"updated_at"`
	PersonID            string    `json:"person_id" db:"person_id"`
	FullName            string    `json:"full_name" db:"full_name"`
	Email               string    `json:"email" db:"email"`
	Phone               string    `json:"phone" db:"phone"`
	Institution         string    `json:"institution" db:"institution"`
	Vision              *string   `json:"vision,omitempty" db:"vision"`
	Mission             *string   `json:"mission,omitempty" db:"mission"`
	WorkProgram         *string   `json:"work_program,omitempty" db:"work_program"`
	PhotoPath           *string   `json:"photo_path,omitempty" db:"photo_path"`
	DocumentPath        *string   `json:"document_path,omitempty" db:"document_path"`
}

type VerifyCandidateRequest struct {
	Status string  `json:"status" validate:"required,oneof=REVIEWING ACCEPTED REJECTED"`
	Notes  *string `json:"notes" validate:"omitempty"`
}

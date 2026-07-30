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
	ID            string    `json:"id"`
	QueueType     string    `json:"queue_type"`
	ApplicantName string    `json:"applicant_name"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
}

type VerificationSummaryResponse struct {
	TotalPending        int `json:"total_pending"`
	PendingParticipants int `json:"pending_participants"`
	PendingCandidates   int `json:"pending_candidates"`
}

type ParticipantDetailResponse struct {
	ID                  string    `json:"id"`
	EventID             string    `json:"event_id"`
	ParticipantCategory string    `json:"participant_category"`
	Source              string    `json:"source"`
	Status              string    `json:"status"`
	RejectionReason     *string   `json:"rejection_reason,omitempty"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
	PersonID            string    `json:"person_id"`
	FullName            string    `json:"full_name"`
	Email               string    `json:"email"`
	Phone               string    `json:"phone"`
	Institution         string    `json:"institution"`
}

type VerifyParticipantRequest struct {
	Status          string  `json:"status" validate:"required,oneof=APPROVED REJECTED"`
	RejectionReason *string `json:"rejection_reason" validate:"omitempty"`
}

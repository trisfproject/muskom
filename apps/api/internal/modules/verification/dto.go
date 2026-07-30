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

package candidate

import "time"

type RegisterCandidateRequest struct {
	RegistrationID string `json:"registration_id" validate:"required,uuid"`
	Vision         string `json:"vision" validate:"required"`
	Mission        string `json:"mission" validate:"required"`
	WorkProgram    string `json:"work_program" validate:"required"`
}

type RegisterCandidateResponse struct {
	CandidateCode string `json:"candidate_code"`
	Status        string `json:"status"`
}

type CandidateStatusResponse struct {
	CandidateCode string    `json:"candidate_code"`
	Status        string    `json:"status"`
	SubmittedAt   time.Time `json:"submitted_at"`
}

type CandidateDocumentsResponse struct {
	PhotoURL    string `json:"photo_url,omitempty"`
	DocumentURL string `json:"document_url,omitempty"`
}

type CandidatePublicResponse struct {
	ID           string `json:"id" db:"id"`
	Name         string `json:"name" db:"name"`
	Number       int    `json:"number" db:"number"`
	Organization string `json:"organization" db:"organization"`
	Motto        string `json:"motto" db:"motto"`
	Vision       string `json:"vision" db:"vision"`
	PhotoURL     string `json:"photo_url" db:"photo_url"`
}

type DeleteDocumentsRequest struct {
	Photo    bool `json:"photo"`
	Document bool `json:"document"`
}

type CandidateAdminListRequest struct {
	EventID        string `query:"event_id"`
	Status         string `query:"status"`
	Search         string `query:"search"`
	CandidateID    string `query:"candidate_id"`
	RegistrationID string `query:"registration_id"`
	SubmissionDate string `query:"submission_date"`
	SortBy         string `query:"sort_by"`
	SortOrder      string `query:"sort_order"`
	Page           int    `query:"page"`
	Limit          int    `query:"limit"`
}

type CandidateAdminListResponse struct {
	ID                  string    `json:"id" db:"id"`
	CandidateCode       string    `json:"candidate_code" db:"candidate_code"`
	RegistrationID      string    `json:"registration_id" db:"registration_id"`
	Name                string    `json:"name" db:"name"`
	ParticipantCategory string    `json:"participant_category" db:"participant_category"`
	Status              string    `json:"status" db:"status"`
	CreatedAt           time.Time `json:"created_at" db:"created_at"`
}

type CandidateAdminDetailResponse struct {
	CandidateAdminListResponse
	Vision       string                      `json:"vision" db:"vision"`
	Mission      string                      `json:"mission" db:"mission"`
	WorkProgram  string                      `json:"work_program" db:"work_program"`
	PhotoURL     string                      `json:"photo_url,omitempty" db:"-"`
	DocumentURL  string                      `json:"document_url,omitempty" db:"-"`
	ReviewedBy   *string                     `json:"reviewed_by,omitempty" db:"reviewed_by"`
	ReviewedAt   *time.Time                  `json:"reviewed_at,omitempty" db:"reviewed_at"`
	ReviewerName *string                     `json:"reviewer_name,omitempty" db:"reviewer_name"`
	AuditHistory []CandidateAuditLogResponse `json:"audit_history,omitempty" db:"-"`
}

type CandidateAuditLogResponse struct {
	ID        string    `json:"id" db:"id"`
	Action    string    `json:"action" db:"action"`
	Metadata  string    `json:"metadata" db:"metadata"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UserName  *string   `json:"user_name,omitempty" db:"user_name"`
}

type CandidateUpdateStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=REVIEWING ACCEPTED REJECTED"`
}

type CandidateAdminUpdateRequest struct {
	Vision      *string `json:"vision" validate:"omitempty"`
	Mission     *string `json:"mission" validate:"omitempty"`
	WorkProgram *string `json:"work_program" validate:"omitempty"`
}

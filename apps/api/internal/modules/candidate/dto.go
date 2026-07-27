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

type DeleteDocumentsRequest struct {
	Photo    bool `json:"photo"`
	Document bool `json:"document"`
}

type CandidateAdminListRequest struct {
	EventID string `query:"event_id"`
	Status  string `query:"status"`
	Search  string `query:"search"`
	Page    int    `query:"page"`
	Limit   int    `query:"limit"`
}

type CandidateAdminListResponse struct {
	ID                  string    `json:"id"`
	CandidateCode       string    `json:"candidate_code"`
	RegistrationID      string    `json:"registration_id"`
	Name                string    `json:"name"`
	ParticipantCategory string    `json:"participant_category"`
	Status              string    `json:"status"`
	CreatedAt           time.Time `json:"created_at"`
}

type CandidateAdminDetailResponse struct {
	CandidateAdminListResponse
	Vision       string     `json:"vision"`
	Mission      string     `json:"mission"`
	WorkProgram  string     `json:"work_program"`
	PhotoURL     string     `json:"photo_url,omitempty"`
	DocumentURL  string     `json:"document_url,omitempty"`
	ReviewedBy   *string    `json:"reviewed_by,omitempty"`
	ReviewedAt   *time.Time `json:"reviewed_at,omitempty"`
	ReviewerName *string    `json:"reviewer_name,omitempty"`
}

type CandidateUpdateStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=REVIEWING ACCEPTED REJECTED"`
}

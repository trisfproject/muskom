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

package candidate

import (
	"time"
)

// CreateCandidateRequest represents the payload for creating a new candidate.
type CreateCandidateRequest struct {
	MusyawarahID string  `json:"musyawarah_id" validate:"omitempty,uuid"`
	FullName     string  `json:"full_name" validate:"required,max=255"`
	Nickname     *string `json:"nickname" validate:"omitempty,max=100"`
	Email        string  `json:"email" validate:"required,email,max=255"`
	Phone        string  `json:"phone" validate:"required,max=50"`

	CompanyName    *string `json:"company_name" validate:"omitempty,max=255"`
	IndustrialArea *string `json:"industrial_area" validate:"omitempty,max=255"`
	JobTitle       *string `json:"job_title" validate:"omitempty,max=255"`
	Department     *string `json:"department" validate:"omitempty,max=255"`
	Biography      *string `json:"biography"`
	Motivation     *string `json:"motivation"`
	Vision         *string `json:"vision"`
	Mission        *string `json:"mission"`
}

type BulkDeleteCandidateRequest struct {
	IDs []string `json:"ids" validate:"required,min=1"`
}

// UpdateCandidateRequest represents the payload for fully updating a candidate.
type UpdateCandidateRequest struct {
	FullName string  `json:"full_name" validate:"required,max=255"`
	Nickname *string `json:"nickname" validate:"omitempty,max=100"`
	Email    string  `json:"email" validate:"required,email,max=255"`
	Phone    string  `json:"phone" validate:"required,max=50"`

	CompanyName    *string `json:"company_name" validate:"omitempty,max=255"`
	IndustrialArea *string `json:"industrial_area" validate:"omitempty,max=255"`
	JobTitle       *string `json:"job_title" validate:"omitempty,max=255"`
	Department     *string `json:"department" validate:"omitempty,max=255"`
	Biography      *string `json:"biography"`
	Motivation     *string `json:"motivation"`
	Vision         *string `json:"vision"`
	Mission        *string `json:"mission"`
	ProfilePhoto   *string `json:"profile_photo"`
	Status         *string `json:"status" validate:"omitempty,oneof=Draft Submitted Verified Rejected Published"`
}

// PatchCandidateRequest represents the payload for partially updating a candidate.
type PatchCandidateRequest struct {
	FullName *string `json:"full_name" validate:"omitempty,max=255"`
	Nickname *string `json:"nickname" validate:"omitempty,max=100"`
	Email    *string `json:"email" validate:"omitempty,email,max=255"`
	Phone    *string `json:"phone" validate:"omitempty,max=50"`

	CompanyName    *string `json:"company_name" validate:"omitempty,max=255"`
	IndustrialArea *string `json:"industrial_area" validate:"omitempty,max=255"`
	JobTitle       *string `json:"job_title" validate:"omitempty,max=255"`
	Department     *string `json:"department" validate:"omitempty,max=255"`
	Biography      *string `json:"biography"`
	Motivation     *string `json:"motivation"`
	Vision         *string `json:"vision"`
	Mission        *string `json:"mission"`
	ProfilePhoto   *string `json:"profile_photo"`
	Status         *string `json:"status" validate:"omitempty,oneof=Draft Submitted Verified Rejected Published"`
}

// CandidateResponse represents the response payload for a candidate.
type CandidateResponse struct {
	ID                 string  `json:"id"`
	MusyawarahID       string  `json:"musyawarah_id"`
	RegistrationNumber string  `json:"registration_number"`
	FullName           string  `json:"full_name"`
	Nickname           *string `json:"nickname,omitempty"`
	Email              string  `json:"email"`
	Phone              string  `json:"phone"`

	CompanyName       *string                     `json:"company_name,omitempty"`
	IndustrialArea    *string                     `json:"industrial_area,omitempty"`
	JobTitle          *string                     `json:"job_title,omitempty"`
	Department        *string                     `json:"department,omitempty"`
	Biography         *string                     `json:"biography,omitempty"`
	Motivation        *string                     `json:"motivation,omitempty"`
	Vision            *string                     `json:"vision,omitempty"`
	Mission           *string                     `json:"mission,omitempty"`
	ProfilePhoto      *string                     `json:"profile_photo,omitempty"`
	Status            string                      `json:"status"`
	VerificationNotes *string                     `json:"verification_notes,omitempty"`
	CandidateNumber   *int                        `json:"candidate_number"`
	DisplayOrder      int                         `json:"display_order"`
	PublicationStatus string                      `json:"publication_status"`
	PublishedAt       *time.Time                  `json:"published_at,omitempty"`
	ShowBiography     bool                        `json:"show_biography"`
	ShowVision        bool                        `json:"show_vision"`
	ShowMission       bool                        `json:"show_mission"`
	ShowPhoto         bool                        `json:"show_photo"`
	CreatedAt         time.Time                   `json:"created_at"`
	UpdatedAt         time.Time                   `json:"updated_at"`
	Documents         []CandidateDocumentResponse `json:"documents,omitempty"`
	Token             string                      `json:"token,omitempty"`
}

// CandidateDocumentResponse represents the response payload for a candidate document.
type CandidateDocumentResponse struct {
	ID                 string    `json:"id"`
	CandidateID        string    `json:"candidate_id"`
	DocumentType       string    `json:"document_type"`
	OriginalFilename   string    `json:"original_filename"`
	MimeType           string    `json:"mime_type"`
	FileSize           int64     `json:"file_size"`
	UploadedAt         time.Time `json:"uploaded_at"`
	VerificationStatus string    `json:"verification_status"`
	VerificationNotes  *string   `json:"verification_notes,omitempty"`
}

// AdminVerifyCandidateRequest represents the payload for verifying a candidate
type AdminVerifyCandidateRequest struct {
	Status            string  `json:"status" validate:"required,oneof='Under Review' 'Revision Required' Verified Rejected"`
	VerificationNotes *string `json:"verification_notes"`
}

// AdminVerifyDocumentRequest represents the payload for verifying a candidate document
type AdminVerifyDocumentRequest struct {
	VerificationStatus string  `json:"verification_status" validate:"required,oneof=Valid Invalid"`
	VerificationNotes  *string `json:"verification_notes"`
}

type AdminPublicationRequest struct {
	CandidateNumber *int `json:"candidate_number" validate:"omitempty,min=1"`
	DisplayOrder    int  `json:"display_order"`
	ShowBiography   bool `json:"show_biography"`
	ShowVision      bool `json:"show_vision"`
	ShowMission     bool `json:"show_mission"`
	ShowPhoto       bool `json:"show_photo"`
}

type AdminReorderCandidatesRequest struct {
	Items []ReorderCandidateItem `json:"items" validate:"required,dive"`
}

type ReorderCandidateItem struct {
	ID           string `json:"id" validate:"required,uuid"`
	DisplayOrder int    `json:"display_order"`
}

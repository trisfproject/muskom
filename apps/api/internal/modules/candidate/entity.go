package candidate

import (
	"time"
)

// Candidate Status Constants
const (
	StatusDraft            = "Draft"
	StatusSubmitted        = "Submitted"
	StatusUnderReview      = "Under Review"
	StatusRevisionRequired = "Revision Required"
	StatusVerified         = "Verified"
	StatusRejected         = "Rejected"
	StatusPublished        = "Published"
)

// Document Verification Status Constants
const (
	DocStatusPending = "Pending"
	DocStatusValid   = "Valid"
	DocStatusInvalid = "Invalid"
)

// Candidate represents a candidate for Musyawarah.
type Candidate struct {
	ID                 string     `db:"id"`
	MusyawarahID       string     `db:"musyawarah_id"`
	RegistrationNumber string     `db:"registration_number"`
	FullName           string     `db:"full_name"`
	Nickname           *string    `db:"nickname"`
	Email              string     `db:"email"`
	Phone              string     `db:"phone"`

	BirthPlace         *string    `db:"birth_place"`
	BirthDate          *time.Time `db:"birth_date"`
	Occupation         *string    `db:"occupation"`
	Organization       *string    `db:"organization"`
	Address            *string    `db:"address"`
	Biography          *string    `db:"biography"`
	Motivation         *string    `db:"motivation"`
	Vision             *string    `db:"vision"`
	Mission            *string    `db:"mission"`
	ProfilePhoto       *string    `db:"profile_photo"`
	Status             string     `db:"status"`
	CreatedAt          time.Time  `db:"created_at"`
	UpdatedAt          time.Time  `db:"updated_at"`
	DeletedAt          *time.Time `db:"deleted_at"`
	VerificationNotes  *string    `db:"verification_notes"`
	CandidateNumber    *int       `db:"candidate_number"`
	DisplayOrder       int        `db:"display_order"`
	PublicationStatus  string     `db:"publication_status"`
	PublishedAt        *time.Time `db:"published_at"`
	ShowBiography      bool       `db:"show_biography"`
	ShowVision         bool       `db:"show_vision"`
	ShowMission        bool       `db:"show_mission"`
	ShowPhoto          bool       `db:"show_photo"`
	Documents          []CandidateDocument
}

// CandidateDocument represents an uploaded document for a candidate.
type CandidateDocument struct {
	ID               string     `db:"id"`
	CandidateID      string     `db:"candidate_id"`
	DocumentType     string     `db:"document_type"`
	OriginalFilename string     `db:"original_filename"`
	StoredFilename   string     `db:"stored_filename"`
	MimeType         string     `db:"mime_type"`
	FileSize         int64      `db:"file_size"`
	Checksum         *string    `db:"checksum"`
	StorageProvider  string     `db:"storage_provider"`
	StoragePath      string     `db:"storage_path"`
	UploadedAt       time.Time  `db:"uploaded_at"`
	UpdatedAt          time.Time  `db:"updated_at"`
	DeletedAt          *time.Time `db:"deleted_at"`
	VerificationStatus string     `db:"verification_status"`
	VerificationNotes  *string    `db:"verification_notes"`
}

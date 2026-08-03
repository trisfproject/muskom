package participant

import "time"

// ─── Stats DTOs ───────────────────────────────────────────────────────────────

// LabelCount is a generic key-value count pair used for breakdown charts.
type LabelCount struct {
	Label string `db:"label" json:"label"`
	Count int    `db:"count" json:"count"`
}

// DailyCount represents registrations grouped by calendar date.
type DailyCount struct {
	Date  string `db:"date" json:"date"`
	Count int    `db:"count" json:"count"`
}

// RecentParticipant is a lightweight summary for the recent-registrations list.
type RecentParticipant struct {
	ID                 string    `db:"id" json:"id"`
	RegistrationNumber string    `db:"registration_number" json:"registration_number"`
	FullName           string    `db:"full_name" json:"full_name"`
	CompanyName        string    `db:"company_name" json:"company_name"`
	IndustrialArea     string    `db:"industrial_area" json:"industrial_area"`
	Status             string    `db:"status" json:"status"`
	CreatedAt          time.Time `db:"created_at" json:"created_at"`
}

// ParticipantStats is the aggregated response for the dashboard stats endpoint.
type ParticipantStats struct {
	// Summary counts
	Total    int `json:"total"`
	Pending  int `json:"pending"`
	Verified int `json:"verified"`
	Rejected int `json:"rejected"`
	Today    int `json:"today"`

	// Chart breakdowns
	ByIndustrialArea []LabelCount `json:"by_industrial_area"`
	ByCompany        []LabelCount `json:"by_company"`
	ByDate           []DailyCount `json:"by_date"`

	// Recent registrations (latest 10)
	Recent []RecentParticipant `json:"recent"`
}

// Participant represents the participants table in the database
type Participant struct {
	ID                 string     `db:"id" json:"id"`
	MusyawarahID       string     `db:"musyawarah_id" json:"musyawarah_id"`
	RegistrationNumber string     `db:"registration_number" json:"registration_number"`
	FullName           string     `db:"full_name" json:"full_name"`
	Nickname           *string    `db:"nickname" json:"nickname"`

	Email              string     `db:"email" json:"email"`
	Phone              string     `db:"phone" json:"phone"`
	CompanyName        string     `db:"company_name" json:"company_name"`
	IndustrialArea     string     `db:"industrial_area" json:"industrial_area"`
	JobTitle           string     `db:"job_title" json:"job_title"`
	Department         *string    `db:"department" json:"department"`
	Status             string     `db:"status" json:"status"`
	CreatedAt          time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt          time.Time  `db:"updated_at" json:"updated_at"`
	DeletedAt          *time.Time `db:"deleted_at" json:"-"`
}

// CreateParticipantRequest represents the payload for creating a new participant
type CreateParticipantRequest struct {
	MusyawarahID       string  `json:"musyawarah_id" validate:"required,uuid"`
	RegistrationNumber string  `json:"registration_number" validate:"required"`
	FullName           string  `json:"full_name" validate:"required"`
	Nickname           *string `json:"nickname"`

	Email              string  `json:"email" validate:"required,email"`
	Phone              string  `json:"phone" validate:"required"`
	CompanyName        string  `json:"company_name" validate:"required"`
	IndustrialArea     string  `json:"industrial_area" validate:"required"`
	JobTitle           string  `json:"job_title" validate:"required"`
	Department         *string `json:"department"`
	Status             string  `json:"status" validate:"required,oneof=Pending Verified Rejected Eligible"`
}

// UpdateParticipantRequest represents the payload for updating an existing participant
type UpdateParticipantRequest struct {
	RegistrationNumber string  `json:"registration_number" validate:"required"`
	FullName           string  `json:"full_name" validate:"required"`
	Nickname           *string `json:"nickname"`

	Email              string  `json:"email" validate:"required,email"`
	Phone              string  `json:"phone" validate:"required"`
	CompanyName        string  `json:"company_name" validate:"required"`
	IndustrialArea     string  `json:"industrial_area" validate:"required"`
	JobTitle           string  `json:"job_title" validate:"required"`
	Department         *string `json:"department"`
}

// UpdateStatusRequest represents the payload for updating a participant's status
type UpdateStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=Pending Verified Rejected Eligible"`
}

// PublicRegisterParticipantRequest represents the payload for the public registration wizard
type PublicRegisterParticipantRequest struct {
	MusyawarahID   string  `json:"musyawarah_id" validate:"required,uuid"`
	FullName       string  `json:"full_name" validate:"required,max=255"`
	Nickname       *string `json:"nickname" validate:"omitempty,max=255"`

	Email          string  `json:"email" validate:"required,email,max=255"`
	Phone          string  `json:"phone" validate:"required,max=50"`
	CompanyName    string  `json:"company_name" validate:"required,max=255"`
	IndustrialArea string  `json:"industrial_area" validate:"required,max=255"`
	JobTitle       string  `json:"job_title" validate:"required,max=255"`
	Department     *string `json:"department" validate:"omitempty,max=255"`
}

// PublicRegisterParticipantResponse represents the response after successful public registration
type PublicRegisterParticipantResponse struct {
	RegistrationNumber string `json:"registration_number"`
	QRToken            string `json:"qr_token"`
}

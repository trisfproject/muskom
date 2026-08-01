package registration

type PublicRegistrationRequest struct {
	FullName            string  `json:"full_name" validate:"required,max=255"`
	Email               string  `json:"email" validate:"required,email,max=255"`
	Phone               *string `json:"phone" validate:"omitempty,max=50"`
	Company             *string `json:"company" validate:"omitempty,max=255"`
	JobTitle            *string `json:"job_title" validate:"omitempty,max=255"`
	ParticipantCategory string  `json:"participant_category" validate:"required,max=100"`
	Region              *string `json:"region" validate:"omitempty,max=255"`
	Community           *string `json:"community" validate:"omitempty,max=255"`
	SpecialNotes        *string `json:"special_notes" validate:"omitempty"`
}

type PublicRegistrationResponse struct {
	RegistrationCode   string  `json:"registration_code"`
	RegistrationNumber *string `json:"registration_number"`
	QrToken            *string `json:"qr_token"`
	Status             string  `json:"status"`
}

type RegistrationStatusResponse struct {
	Status string `json:"status"`
}

type AttachmentResponse struct {
	ID        string `json:"id"`
	FileName  string `json:"file_name"`
	FileURL   string `json:"file_url"`
	MimeType  string `json:"mime_type"`
	Size      int64  `json:"size"`
	CreatedAt string `json:"created_at"`
}

type RegistrationConfirmationResponse struct {
	RegistrationCode string `json:"registration_code"`
	Status           string `json:"status"`
	RegistrationDate string `json:"registration_date"`
	MusyawarahName   string `json:"musyawarah_name"`
	ParticipantName  string `json:"participant_name"`
	NextStep         string `json:"next_step"`
}

type AdminListRegistrationsRequest struct {
	Page             int    `query:"page"`
	Limit            int    `query:"limit"`
	SortBy           string `query:"sort_by"`
	SortOrder        string `query:"sort_order"`
	Status           string `query:"status"`
	RegistrationCode string `query:"registration_code"`
	ParticipantName  string `query:"participant_name"`
	Email            string `query:"email"`
	Phone            string `query:"phone"`
	RegistrationDate string `query:"registration_date"`
}

type AdminUpdateRegistrationStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=PENDING APPROVED REJECTED"`
}

type AdminRegistrationResponse struct {
	ID                  string `json:"id"`
	EventID             string `json:"event_id"`
	EventName           string `json:"event_name"`
	ParticipantName     string `json:"participant_name"`
	Email               string `json:"email"`
	Phone               string `json:"phone"`
	Company             string `json:"company"`
	JobTitle            string `json:"job_title"`
	ParticipantCategory string `json:"participant_category"`
	Source              string `json:"source"`
	Status              string `json:"status"`
	CreatedAt           string `json:"created_at"`
	UpdatedAt           string `json:"updated_at"`
}

type AdminListRegistrationsResponse struct {
	Data       []AdminRegistrationResponse `json:"data"`
	Total      int                         `json:"total"`
	Page       int                         `json:"page"`
	Limit      int                         `json:"limit"`
	TotalPages int                         `json:"total_pages"`
}

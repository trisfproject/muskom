package registration

type PublicRegistrationRequest struct {
	FullName            string  `json:"full_name" validate:"required,max=255"`
	Email               string  `json:"email" validate:"required,email,max=255"`
	Phone               *string `json:"phone" validate:"omitempty,max=50"`
	Company             *string `json:"company" validate:"omitempty,max=255"`
	JobTitle            *string `json:"job_title" validate:"omitempty,max=255"`
	ParticipantCategory string  `json:"participant_category" validate:"required,max=100"`
}

type PublicRegistrationResponse struct {
	RegistrationCode string `json:"registration_code"`
	Status           string `json:"status"`
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

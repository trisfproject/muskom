package registration

import "time"

type Person struct {
	ID        string    `db:"id"`
	FullName  string    `db:"full_name"`
	Email     string    `db:"email"`
	Phone     *string   `db:"phone"`
	Company   *string   `db:"company"`
	JobTitle  *string   `db:"job_title"`
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
}

type Registration struct {
	ID                  string     `db:"id"`
	PersonID            string     `db:"person_id"`
	ParticipantCategory *string    `db:"participant_category"`
	Source              *string    `db:"source"`
	Status              string     `db:"status"`
	ApprovedBy          *string    `db:"approved_by"`
	ApprovedAt          *time.Time `db:"approved_at"`
	RejectionReason     *string    `db:"rejection_reason"`
	RegistrationNumber  *string    `db:"registration_number"`
	QrToken             *string    `db:"qr_token"`
	Region              *string    `db:"region"`
	Community           *string    `db:"community"`
	SpecialNotes        *string    `db:"special_notes"`
	CreatedAt           time.Time  `db:"created_at"`
	UpdatedAt           time.Time  `db:"updated_at"`
}

type MusyawarahActiveContext struct {
	EventID                  string `db:"id"`
	Status                   string `db:"status"`
	RegistrationLimit        *int   `db:"registration_limit"`
	RegistrationApprovalMode string `db:"registration_approval_mode"`
}

type EmailLog struct {
	ID             string     `db:"id"`
	RegistrationID string     `db:"registration_id"`
	EmailType      string     `db:"email_type"`
	RecipientEmail string     `db:"recipient_email"`
	Status         string     `db:"status"`
	SentAt         *time.Time `db:"sent_at"`
	LastRetryAt    *time.Time `db:"last_retry_at"`
	RetryCount     int        `db:"retry_count"`
	ErrorMessage   *string    `db:"error_message"`
	CreatedBy      *string    `db:"created_by"`
	CreatedAt      time.Time  `db:"created_at"`
	UpdatedAt      time.Time  `db:"updated_at"`
}

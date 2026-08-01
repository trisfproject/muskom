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
	EventID             string     `db:"event_id"`
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

package notification

import (
	"time"
)

type Channel string
type JobStatus string

const (
	ChannelEmail    Channel = "EMAIL"
	ChannelWhatsApp Channel = "WHATSAPP"
	ChannelTelegram Channel = "TELEGRAM"

	StatusPending    JobStatus = "PENDING"
	StatusQueued     JobStatus = "QUEUED"
	StatusProcessing JobStatus = "PROCESSING"
	StatusSent       JobStatus = "SENT"
	StatusFailed     JobStatus = "FAILED"
	StatusCancelled  JobStatus = "CANCELLED"
)

type NotificationTemplate struct {
	ID        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Channel   Channel   `json:"channel" db:"channel"`
	Subject   *string   `json:"subject" db:"subject"`
	Body      string    `json:"body" db:"body"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type NotificationJob struct {
	ID           string    `json:"id" db:"id"`
	TemplateID   string    `json:"template_id" db:"template_id"`
	Channel      Channel   `json:"channel" db:"channel"`
	Recipient    string    `json:"recipient" db:"recipient"`
	Payload      *string   `json:"payload" db:"payload"` // JSON encoded string for ease
	Status       JobStatus `json:"status" db:"status"`
	RetryCount   int       `json:"retry_count" db:"retry_count"`
	ErrorMessage *string   `json:"error_message" db:"error_message"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type NotificationHistory struct {
	ID           string     `json:"id" db:"id"`
	JobID        *string    `json:"job_id" db:"job_id"`
	Channel      Channel    `json:"channel" db:"channel"`
	Recipient    string     `json:"recipient" db:"recipient"`
	Status       JobStatus  `json:"status" db:"status"`
	SentAt       *time.Time `json:"sent_at" db:"sent_at"`
	ErrorMessage *string    `json:"error_message" db:"error_message"`
}

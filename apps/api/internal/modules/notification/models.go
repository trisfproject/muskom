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
	ChannelInApp    Channel = "INAPP"

	StatusPending    JobStatus = "PENDING"
	StatusQueued     JobStatus = "QUEUED"
	StatusProcessing JobStatus = "PROCESSING"
	StatusSent       JobStatus = "SENT"
	StatusFailed     JobStatus = "FAILED"
	StatusCancelled  JobStatus = "CANCELLED"
)

type NotificationType string
type NotificationPriority string

const (
	TypeInfo    NotificationType = "INFO"
	TypeSuccess NotificationType = "SUCCESS"
	TypeWarning NotificationType = "WARNING"
	TypeError   NotificationType = "ERROR"
	TypeSystem  NotificationType = "SYSTEM"

	PriorityLow      NotificationPriority = "LOW"
	PriorityNormal   NotificationPriority = "NORMAL"
	PriorityHigh     NotificationPriority = "HIGH"
	PriorityCritical NotificationPriority = "CRITICAL"
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
	Template     string     `json:"template" db:"template"`
}

type InAppNotification struct {
	ID        string               `json:"id" db:"id"`
	UserID    *string              `json:"user_id" db:"user_id"`
	Type      NotificationType     `json:"type" db:"type"`
	Priority  NotificationPriority `json:"priority" db:"priority"`
	Title     string               `json:"title" db:"title"`
	Message   string               `json:"message" db:"message"`
	ActionURL *string              `json:"action_url" db:"action_url"`
	IsRead    bool                 `json:"is_read" db:"is_read"`
	ReadAt    *time.Time           `json:"read_at" db:"read_at"`
	CreatedAt time.Time            `json:"created_at" db:"created_at"`
}

type ReminderRecipient struct {
	ID                 string `json:"id" db:"id"`
	Email              string `json:"email" db:"email"`
	FullName           string `json:"full_name" db:"full_name"`
	RegistrationNumber string `json:"registration_number" db:"registration_number"`
	Status             string `json:"status" db:"status"`
}

// BlastRequest is the payload for a targeted blast.
// RecipientIDs are participant UUIDs selected by the admin in the composer.
// Subject and Body are the (possibly admin-edited) email content.
// Server-side eligibility is re-validated before queuing any job.
type BlastRequest struct {
	RecipientIDs []string `json:"recipient_ids"`
	Subject      string   `json:"subject"`
	Body         string   `json:"body"`
}

// BlastResult reports what happened during a blast.
type BlastResult struct {
	Requested int `json:"requested"`
	Eligible  int `json:"eligible"`
	Queued    int `json:"queued"`
	Skipped   int `json:"skipped"`
}

type BroadcastDraft struct {
	ID           string    `json:"id" db:"id"`
	CampaignID   string    `json:"campaign_id" db:"campaign_id"`
	Subject      string    `json:"subject" db:"subject"`
	BodyHTML     string    `json:"body_html" db:"body_html"`
	RecipientIDs *string   `json:"recipient_ids" db:"recipient_ids"` // JSON string of array
	Status       string    `json:"status" db:"status"`
	CreatedBy    *string   `json:"created_by" db:"created_by"`
	UpdatedBy    *string   `json:"updated_by" db:"updated_by"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type DraftRequest struct {
	Subject      string   `json:"subject"`
	BodyHTML     string   `json:"body_html"`
	RecipientIDs []string `json:"recipient_ids"`
}

package announcement

import (
	"time"
)

// Status enum
const (
	StatusDraft     = "Draft"
	StatusScheduled = "Scheduled"
	StatusPublished = "Published"
	StatusArchived  = "Archived"
)

// Category enum
const (
	CategoryGeneral      = "General"
	CategoryRegistration = "Registration"
	CategoryCandidate    = "Candidate"
	CategoryParticipant  = "Participant"
	CategoryAttendance   = "Attendance"
	CategoryVoting       = "Voting"
	CategorySystem       = "System"
	CategoryEmergency    = "Emergency"
)

// Priority enum
const (
	PriorityNormal    = "Normal"
	PriorityImportant = "Important"
	PriorityUrgent    = "Urgent"
	PriorityCritical  = "Critical"
)

// Audience enum
const (
	AudienceEveryone             = "Everyone"
	AudienceParticipants         = "Participants"
	AudienceVerifiedParticipants = "Verified Participants"
	AudienceCandidates           = "Candidates"
	AudienceCommittee            = "Committee"
	AudienceAdmins               = "Admins"
)

type Attachment struct {
	Type string `json:"type"` // e.g., "PDF", "Image", "Link"
	URL  string `json:"url"`
	Name string `json:"name"`
}

type Announcement struct {
	ID           string       `json:"id" db:"id"`
	Title        string       `json:"title" db:"title"`
	Slug         string       `json:"slug" db:"slug"`
	Summary      *string      `json:"summary" db:"summary"`
	Content      string       `json:"content" db:"content"`
	ThumbnailURL *string      `json:"thumbnail_url" db:"thumbnail_url"`
	Category     string       `json:"category" db:"category"`
	Priority     string       `json:"priority" db:"priority"`
	Status       string       `json:"status" db:"status"`
	Attachments  *string      `json:"attachments" db:"attachments"` // stored as JSONB string in DB
	Pinned       bool         `json:"pinned" db:"pinned"`
	PublishDate  *time.Time   `json:"publish_date" db:"publish_date"`
	ExpireDate   *time.Time   `json:"expire_date" db:"expire_date"`
	CreatedBy    *string      `json:"created_by" db:"created_by"`
	UpdatedBy    *string      `json:"updated_by" db:"updated_by"`
	CreatedAt    time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time    `json:"updated_at" db:"updated_at"`
}

type BroadcastJob struct {
	ID                   string     `json:"id" db:"id"`
	AnnouncementID       string     `json:"announcement_id" db:"announcement_id"`
	TargetAudience       string     `json:"target_audience" db:"target_audience"`
	Channels             string     `json:"channels" db:"channels"` // stored as JSONB string array in DB
	Status               string     `json:"status" db:"status"`     // e.g., "Queued", "Sending", "Delivered", "Failed"
	TotalTargets         int        `json:"total_targets" db:"total_targets"`
	SuccessfulDeliveries int        `json:"successful_deliveries" db:"successful_deliveries"`
	FailedDeliveries     int        `json:"failed_deliveries" db:"failed_deliveries"`
	ErrorMessage         *string    `json:"error_message" db:"error_message"`
	StartedAt            *time.Time `json:"started_at" db:"started_at"`
	CompletedAt          *time.Time `json:"completed_at" db:"completed_at"`
	CreatedBy            *string    `json:"created_by" db:"created_by"`
	CreatedAt            time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at" db:"updated_at"`
}

// CreateAnnouncementRequest payload
type CreateAnnouncementRequest struct {
	Title        string       `json:"title" validate:"required"`
	Summary      *string      `json:"summary"`
	Content      string       `json:"content" validate:"required"`
	ThumbnailURL *string      `json:"thumbnail_url"`
	Category     string       `json:"category" validate:"required"`
	Priority     string       `json:"priority" validate:"required"`
	Attachments  []Attachment `json:"attachments"`
	Pinned       bool         `json:"pinned"`
	PublishDate  *time.Time   `json:"publish_date"`
	ExpireDate   *time.Time   `json:"expire_date"`
}

// UpdateAnnouncementRequest payload
type UpdateAnnouncementRequest struct {
	Title        *string      `json:"title"`
	Summary      *string      `json:"summary"`
	Content      *string      `json:"content"`
	ThumbnailURL *string      `json:"thumbnail_url"`
	Category     *string      `json:"category"`
	Priority     *string      `json:"priority"`
	Status       *string      `json:"status"`
	Attachments  []Attachment `json:"attachments"`
	Pinned       *bool        `json:"pinned"`
	PublishDate  *time.Time   `json:"publish_date"`
	ExpireDate   *time.Time   `json:"expire_date"`
}

// CreateBroadcastRequest payload
type CreateBroadcastRequest struct {
	TargetAudience string   `json:"target_audience" validate:"required"`
	Channels       []string `json:"channels" validate:"required,min=1"`
}

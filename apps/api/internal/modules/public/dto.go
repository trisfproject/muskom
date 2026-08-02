package public

import "time"

type HomeResponse struct {
	Event         *EventDTO         `json:"event"`
	Settings      SettingsDTO       `json:"settings"`
	Timeline      []TimelineDTO     `json:"timeline"`
	CurrentPhase  CurrentPhaseDTO   `json:"currentPhase"`
	Announcements []AnnouncementDTO `json:"announcements"`
	Candidates    []CandidateDTO    `json:"candidates"`
}

type EventDTO struct {
	Name           string     `json:"name"`
	Theme          *string    `json:"theme"`
	Location       *string    `json:"location"`
	EventDate      *time.Time `json:"event_date"`
	Status         string     `json:"status"`
	LifecycleState string     `json:"lifecycle_state"`
}

type SettingsDTO struct {
	RegistrationApprovalMode string `json:"registration_approval_mode"`
	ShowCandidateList        bool   `json:"show_candidate_list"`
	ShowTimeline             bool   `json:"show_timeline"`
	ShowAnnouncements        bool   `json:"show_announcements"`
}

type TimelineDTO struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description *string   `json:"description"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
}

type CurrentPhaseDTO struct {
	Name      string     `json:"name"`
	EndDate   *time.Time `json:"end_date"`
	IsActive  bool       `json:"is_active"`
}

type AnnouncementDTO struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Content     string     `json:"content"`
	PublishedAt *time.Time `json:"published_at"`
	CreatedAt   time.Time  `json:"created_at"`
}

type CandidateDTO struct {
	ID             string  `json:"id"`
	SequenceNumber *int    `json:"sequence_number"`
	Name           *string `json:"name"`
	Title          *string `json:"title"`
	Vision         *string `json:"vision"`
	PhotoURL       *string `json:"photo_url"` // derived from photo_path
}

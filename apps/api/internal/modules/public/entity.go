package public

import "time"

type PublicEvent struct {
	ID        string     `db:"id"`
	Name      string     `db:"name"`
	Theme     *string    `db:"theme"`
	Location  *string    `db:"location"`
	EventDate *time.Time `db:"event_date"`
	Status    string     `db:"status"`
}

type PublicSettings struct {
	RegistrationLimit        *int   `db:"registration_limit"`
	RegistrationApprovalMode string `db:"registration_approval_mode"`
	ShowCandidateList        bool   `db:"show_candidate_list"`
	ShowTimeline             bool   `db:"show_timeline"`
	ShowAnnouncements        bool   `db:"show_announcements"`
}

type PublicTimeline struct {
	ID               string    `db:"id"`
	Title            string    `db:"title"`
	Description      *string   `db:"description"`
	StartDate        time.Time `db:"start_date"`
	EndDate          time.Time `db:"end_date"`
	SortOrder        int       `db:"sort_order"`
	PublicVisibility bool      `db:"public_visibility"`
}

type PublicAnnouncement struct {
	ID          string     `db:"id"`
	Title       string     `db:"title"`
	Content     string     `db:"content"`
	PublishedAt *time.Time `db:"published_at"`
	CreatedAt   time.Time  `db:"created_at"`
}

type PublicCandidate struct {
	ID             string  `db:"id"`
	SequenceNumber *int    `db:"sequence_number"`
	Name           *string `db:"name"`
	Title          *string `db:"title"`
	Vision         *string `db:"vision"`
	PhotoPath      *string `db:"photo_path"`
}

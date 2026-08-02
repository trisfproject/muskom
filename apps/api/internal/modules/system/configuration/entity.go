package configuration

import (
	"encoding/json"
	"time"
)

// SystemConfiguration represents a raw configuration record from the database.
type SystemConfiguration struct {
	ID        string          `db:"id" json:"id"`
	GroupName string          `db:"group_name" json:"group_name"`
	Settings  json.RawMessage `db:"settings" json:"settings"`
	UpdatedBy *string         `db:"updated_by" json:"updated_by"`
	UpdatedAt time.Time       `db:"updated_at" json:"updated_at"`
}

// ---------------------------------------------------------
// Strongly-Typed Configuration Groups
// ---------------------------------------------------------

type WebsiteIdentityConfig struct {
	CommunityName      string `json:"community_name"`
	EventName          string `json:"event_name"`
	EventYear          string `json:"event_year"`
	WebsiteTitle       string `json:"website_title"`
	WebsiteDescription string `json:"website_description"`
	LogoURL            string `json:"logo_url"`
	FaviconURL         string `json:"favicon_url"`
}

type PublicationConfig struct {
	WebsiteStatus    string `json:"website_status"` // e.g., "PUBLISHED", "DRAFT"
	MaintenanceMode  bool   `json:"maintenance_mode"`
	PublicVisibility bool   `json:"public_visibility"`
}

type RegistrationConfig struct {
	CandidateRegistration   bool    `json:"candidate_registration"`
	ParticipantRegistration bool    `json:"participant_registration"`
	OpeningDate             *string `json:"opening_date"` // ISO Date string
	ClosingDate             *string `json:"closing_date"` // ISO Date string
}

type TimelineConfig struct {
	ActiveTimelineMode bool   `json:"active_timeline_mode"`
	CountdownSource    string `json:"countdown_source"` // e.g., "TIMELINE_EVENT", "MANUAL"
}

type ContactConfig struct {
	Email       string `json:"email"`
	WhatsApp    string `json:"whatsapp"`
	Secretariat string `json:"secretariat"`
	MapsEmbed   string `json:"maps_embed"`
}

type SocialMediaConfig struct {
	Instagram string `json:"instagram"`
	Telegram  string `json:"telegram"`
	Website   string `json:"website"`
}

// FullSystemConfig is an aggregate structure useful for returning everything to the client
type FullSystemConfig struct {
	WebsiteIdentity WebsiteIdentityConfig `json:"website_identity"`
	Publication     PublicationConfig     `json:"publication"`
	Registration    RegistrationConfig    `json:"registration"`
	Timeline        TimelineConfig        `json:"timeline"`
	Contact         ContactConfig         `json:"contact"`
	SocialMedia     SocialMediaConfig     `json:"social_media"`
}

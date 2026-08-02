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
	OfflineMessage   string `json:"offline_message"`
}

type RegistrationConfig struct {
	CandidateRegistration   bool    `json:"candidate_registration"`
	ParticipantRegistration bool    `json:"participant_registration"`
	OpeningDate             *string `json:"opening_date"` // ISO Date string
	ClosingDate             *string `json:"closing_date"` // ISO Date string
	RegistrationInformation string  `json:"registration_information"`
}

type SEOConfig struct {
	MetaTitle       string `json:"meta_title"`
	MetaDescription string `json:"meta_description"`
	MetaKeywords    string `json:"meta_keywords"`
	OpenGraphImage  string `json:"opengraph_image"`
}

type FeatureFlagsConfig struct {
	ShowHero           bool `json:"show_hero"`
	ShowCountdown      bool `json:"show_countdown"`
	ShowTimeline       bool `json:"show_timeline"`
	ShowCandidate      bool `json:"show_candidate"`
	ShowInformation    bool `json:"show_information"`
	ShowFooter         bool `json:"show_footer"`
	EnableRegistration bool `json:"enable_registration"`
	EnableDarkTheme    bool `json:"enable_dark_theme"`
}

type ContactConfig struct {
	Email       string `json:"email"`
	WhatsApp    string `json:"whatsapp"`
	Secretariat string `json:"secretariat"`
	MapsEmbed   string `json:"maps_embed"`
}



// FullSystemConfig is an aggregate structure useful for returning everything to the client
type FullSystemConfig struct {
	WebsiteIdentity WebsiteIdentityConfig `json:"website_identity"`
	Publication     PublicationConfig     `json:"publication"`
	Registration    RegistrationConfig    `json:"registration"`
	Contact         ContactConfig         `json:"contact"`
	SEO             SEOConfig             `json:"seo"`
	FeatureFlags    FeatureFlagsConfig    `json:"feature_flags"`
}

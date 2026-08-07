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
	CommunityName      string `json:"community_name" validate:"required,max=255"`
	WebsiteTitle       string `json:"website_title" validate:"required,max=255"`
	WebsiteDescription string `json:"website_description" validate:"required"`
	LogoURL            string `json:"logo_url" validate:"omitempty"`
	FaviconURL         string `json:"favicon_url" validate:"omitempty"`
}

type PublicationConfig struct {
	WebsiteStatus    string `json:"website_status" validate:"required,oneof=PUBLISHED DRAFT ARCHIVED MAINTENANCE"`
	MaintenanceMode  bool   `json:"maintenance_mode"`
	PublicVisibility bool   `json:"public_visibility"`
	OfflineMessage   string `json:"offline_message" validate:"omitempty,max=500"`
}

type RegistrationConfig struct {
	CandidateRegistration   bool    `json:"candidate_registration"`
	ParticipantRegistration bool    `json:"participant_registration"`
	OpeningDate             *string `json:"opening_date" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
	ClosingDate             *string `json:"closing_date" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
	RegistrationInformation string  `json:"registration_information" validate:"omitempty"`
	ParticipantLimit        int     `json:"participant_limit" validate:"min=0"`
	CapacityMode            string  `json:"capacity_mode" validate:"required,oneof=CLOSE WAITING_LIST ALLOW"`
}

type SEOConfig struct {
	MetaTitle       string `json:"meta_title" validate:"required,max=255"`
	MetaDescription string `json:"meta_description" validate:"required,max=500"`
	MetaKeywords    string `json:"meta_keywords" validate:"omitempty,max=500"`
	OpenGraphImage  string `json:"opengraph_image" validate:"omitempty"`
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
	Email       string `json:"email" validate:"required,email"`
	WhatsApp    string `json:"whatsapp" validate:"required,max=20"`
	Secretariat string `json:"secretariat" validate:"required"`
	MapsEmbed   string `json:"maps_embed" validate:"omitempty"`
}

type SMTPConfig struct {
	Enabled   bool   `json:"enabled"`
	Host      string `json:"host" validate:"required"`
	Port      int    `json:"port" validate:"required,min=1,max=65535"`
	Username  string `json:"username"`
	Password  string `json:"password"`
	FromName  string `json:"from_name"`
	FromEmail string `json:"from_email" validate:"omitempty,email"`
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

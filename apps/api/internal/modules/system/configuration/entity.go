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

type WebsiteConfig struct {
	SiteName       string `json:"site_name"`
	Theme          string `json:"theme"`
	PrimaryColor   string `json:"primary_color"`
	DefaultTheme   string `json:"default_theme"`
	Maintenance    bool   `json:"maintenance"`
	LandingEnabled bool   `json:"landing_enabled"`
}

type EventConfig struct {
	ActiveEventID     *string `json:"active_event_id"`
	Timezone          string  `json:"timezone"`
	CurrentElection   *string `json:"current_election"`
	CurrentMusyawarah *string `json:"current_musyawarah"`
	ArchiveMode       bool    `json:"archive_mode"`
}

type RegistrationConfig struct {
	ParticipantRegistrationEnabled bool    `json:"participant_registration_enabled"`
	CandidateRegistrationEnabled   bool    `json:"candidate_registration_enabled"`
	RegistrationDeadline           *string `json:"registration_deadline"` // ISO Date string
	MaxParticipants                int     `json:"max_participants"`
}

type VotingConfig struct {
	VotingEnabled  bool    `json:"voting_enabled"`
	VotingStart    *string `json:"voting_start"` // ISO Date string
	VotingEnd      *string `json:"voting_end"`   // ISO Date string
	RealtimeResult bool    `json:"realtime_result"`
	PublicResult   bool    `json:"public_result"`
}

type AttendanceConfig struct {
	AttendanceEnabled bool `json:"attendance_enabled"`
	QRExpiration      int  `json:"qr_expiration"`   // seconds
	CheckInWindow     int  `json:"check_in_window"` // minutes
}

type NotificationConfig struct {
	TelegramEnabled bool `json:"telegram_enabled"`
	EmailEnabled    bool `json:"email_enabled"`
	ReminderEnabled bool `json:"reminder_enabled"`
}

type SecurityConfig struct {
	MaxLoginAttempts      int `json:"max_login_attempts"`
	SessionTimeoutMinutes int `json:"session_timeout_minutes"`
}

type FeatureFlagsConfig struct {
	CandidateModule  bool `json:"candidate_module"`
	VotingModule     bool `json:"voting_module"`
	AttendanceModule bool `json:"attendance_module"`
	StatisticsModule bool `json:"statistics_module"`
	GalleryModule    bool `json:"gallery_module"`
}

// FullSystemConfig is an aggregate structure useful for returning everything to the client
type FullSystemConfig struct {
	Website      WebsiteConfig      `json:"website"`
	Event        EventConfig        `json:"event"`
	Registration RegistrationConfig `json:"registration"`
	Voting       VotingConfig       `json:"voting"`
	Attendance   AttendanceConfig   `json:"attendance"`
	Notification NotificationConfig `json:"notification"`
	Security     SecurityConfig     `json:"security"`
	FeatureFlags FeatureFlagsConfig `json:"feature_flags"`
}

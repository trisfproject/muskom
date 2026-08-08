package website

import "time"

// WebsiteGeneralSettings represents global website configuration
type WebsiteGeneralSettings struct {
	ID                  string    `db:"id" json:"id"`
	SiteName            string    `db:"site_name" json:"site_name"`
	Tagline             string    `db:"tagline" json:"tagline"`
	Theme               string    `db:"theme" json:"theme"`
	PrimaryColor        string    `db:"primary_color" json:"primary_color"`
	SecondaryColor      string    `db:"secondary_color" json:"secondary_color"`
	DefaultLightTheme   bool      `db:"default_light_theme" json:"default_light_theme"`
	DefaultDarkTheme    bool      `db:"default_dark_theme" json:"default_dark_theme"`
	RegistrationEnabled bool      `db:"registration_enabled" json:"registration_enabled"`
	MaintenanceMode     bool      `db:"maintenance_mode" json:"maintenance_mode"`
	SEOTitle            string    `db:"seo_title" json:"seo_title"`
	SEODescription      string    `db:"seo_description" json:"seo_description"`
	SEOImageURL         string    `db:"seo_image_url" json:"seo_image_url"`
	FaviconURL          string    `db:"favicon_url" json:"favicon_url"`
	CreatedAt           time.Time `db:"created_at" json:"created_at"`
	UpdatedAt           time.Time `db:"updated_at" json:"updated_at"`
}

// WebsiteHeroSettings represents hero section configuration
type WebsiteHeroSettings struct {
	ID                  string    `db:"id" json:"id"`
	HeroBadge           string    `db:"hero_badge" json:"hero_badge"`
	PrimaryCTALabel     string    `db:"primary_cta_label" json:"primary_cta_label"`
	PrimaryCTAURL       string    `db:"primary_cta_url" json:"primary_cta_url"`
	PrimaryCTAEnabled   bool      `db:"primary_cta_enabled" json:"primary_cta_enabled"`
	SecondaryCTALabel   string    `db:"secondary_cta_label" json:"secondary_cta_label"`
	SecondaryCTAURL     string    `db:"secondary_cta_url" json:"secondary_cta_url"`
	SecondaryCTAEnabled bool      `db:"secondary_cta_enabled" json:"secondary_cta_enabled"`
	BackgroundMode      string    `db:"background_mode" json:"background_mode"`
	HeroStatus          string    `db:"hero_status" json:"hero_status"`
	IsPublished         bool      `db:"is_published" json:"is_published"`
	CreatedAt           time.Time `db:"created_at" json:"created_at"`
	UpdatedAt           time.Time `db:"updated_at" json:"updated_at"`
}

// WebsiteTimelinePhase represents a milestone/phase in the event timeline
type WebsiteTimelinePhase struct {
	ID               string     `db:"id" json:"id"`
	Title            string     `db:"title" json:"title"`
	Description      string     `db:"description" json:"description"`
	StartDate        time.Time  `db:"start_date" json:"start_date"`
	EndDate          time.Time  `db:"end_date" json:"end_date"`
	DisplayOrder     int        `db:"display_order" json:"display_order"`
	RegistrationType string     `db:"registration_type" json:"registration_type"` // 'NONE', 'PARTICIPANT', 'CANDIDATE', 'BOTH'
	CurrentIndicator bool       `db:"current_indicator" json:"current_indicator"`
	IsPublished      bool       `db:"is_published" json:"is_published"`
	DeletedAt        *time.Time `db:"deleted_at" json:"deleted_at,omitempty"`
	CreatedAt        time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt        time.Time  `db:"updated_at" json:"updated_at"`
	Status           string     `db:"-" json:"status"`
}

// WebsiteAnnouncement represents a broadcast article/announcement
type WebsiteAnnouncement struct {
	ID           string     `db:"id" json:"id"`
	Title        string     `db:"title" json:"title"`
	Slug         string     `db:"slug" json:"slug"`
	Category     string     `db:"category" json:"category"`
	Summary      string     `db:"summary" json:"summary"`
	Content      string     `db:"content" json:"content"`
	ThumbnailURL string     `db:"thumbnail_url" json:"thumbnail_url"`
	IsPinned     bool       `db:"is_pinned" json:"is_pinned"`
	IsPublished  bool       `db:"is_published" json:"is_published"`
	PublishedAt  time.Time  `db:"published_at" json:"published_at"`
	DeletedAt    *time.Time `db:"deleted_at" json:"deleted_at,omitempty"`
	CreatedAt    time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time  `db:"updated_at" json:"updated_at"`
}

// WebsiteCandidateSettings represents candidate CMS section configuration
type WebsiteCandidateSettings struct {
	ID                 string    `db:"id" json:"id"`
	SectionTitle       string    `db:"section_title" json:"section_title"`
	SectionDescription string    `db:"section_description" json:"section_description"`
	RegistrationStatus string    `db:"registration_status" json:"registration_status"`
	EmptyStateMessage  string    `db:"empty_state_message" json:"empty_state_message"`
	PublicationMessage string    `db:"publication_message" json:"publication_message"`
	CreatedAt          time.Time `db:"created_at" json:"created_at"`
	UpdatedAt          time.Time `db:"updated_at" json:"updated_at"`
}

// WebsiteFooterSettings represents footer section configuration
type WebsiteFooterSettings struct {
	ID               string    `db:"id" json:"id"`
	OrganizationName string    `db:"organization_name" json:"organization_name"`
	Description      string    `db:"description" json:"description"`
	Copyright        string    `db:"copyright" json:"copyright"`
	OfficialBadge    string    `db:"official_badge" json:"official_badge"`
	Tagline          string    `db:"tagline" json:"tagline"`
	CreatedAt        time.Time `db:"created_at" json:"created_at"`
	UpdatedAt        time.Time `db:"updated_at" json:"updated_at"`
}

// WebsiteInformationPage represents an information center page
type WebsiteInformationPage struct {
	ID          string    `db:"id" json:"id"`
	Slug        string    `db:"slug" json:"slug"`
	Title       string    `db:"title" json:"title"`
	Content     string    `db:"content" json:"content"`
	IsPublished bool      `db:"is_published" json:"is_published"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}

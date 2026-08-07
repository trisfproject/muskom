package website

import "time"

// ============================================================================
// Public Responses (Domain -> Public Wire DTOs)
// ============================================================================

type PublicHomeResponse struct {
	Hero          WebsiteHeroDTO            `json:"hero"`
	CurrentPhase  PublicCurrentPhaseDTO     `json:"currentPhase"`
	CTA           PublicCtaDTO              `json:"cta"`
	Countdown     *PublicCountdownDTO       `json:"countdown,omitempty"`
	Timeline      []PublicTimelineDTO       `json:"timeline"`
	Announcements []PublicAnnouncementDTO   `json:"announcements"`
	Candidate     PublicCandidateSectionDTO `json:"candidate"`
	Footer        WebsiteFooterDTO          `json:"footer"`
	Navigation    []PublicNavigationItemDTO `json:"navigation"`
	Metadata      PublicMetadataDTO         `json:"metadata"`
	FeatureFlags  PublicFeatureFlagsDTO     `json:"feature_flags"`

	// Backward compatibility aliases
	General      WebsiteGeneralDTO      `json:"general"`
	CandidateCMS WebsiteCandidateCMSDTO `json:"candidate_cms"`
	Candidates   []PublicCandidateDTO   `json:"candidates"`
	Settings     *PublicSettingsDTO     `json:"settings,omitempty"`
}

type PublicSettingsDTO struct {
	RegistrationApprovalMode string `json:"registration_approval_mode"`
	ShowCandidateList        bool   `json:"show_candidate_list"`
	ShowTimeline             bool   `json:"show_timeline"`
	ShowAnnouncements        bool   `json:"show_announcements"`
	ParticipantLimit         int    `json:"participant_limit"`
	ParticipantCount         int    `json:"participant_count"`
	RegistrationEnabled      bool   `json:"registration_enabled"`
}

type WebsiteGeneralDTO struct {
	SiteName            string `json:"site_name"`
	Tagline             string `json:"tagline"`
	Theme               string `json:"theme"`
	PrimaryColor        string `json:"primary_color"`
	SecondaryColor      string `json:"secondary_color"`
	DefaultLightTheme   bool   `json:"default_light_theme"`
	DefaultDarkTheme    bool   `json:"default_dark_theme"`
	RegistrationEnabled bool   `json:"registration_enabled"`
	MaintenanceMode     bool   `json:"maintenance_mode"`
	SEOTitle            string `json:"seo_title"`
	SEODescription      string `json:"seo_description"`
	SEOImageURL         string `json:"seo_image_url"`
	FaviconURL          string `json:"favicon_url"`
}

type WebsiteHeroDTO struct {
	HeroBadge           string `json:"hero_badge"`
	HeroTitle           string `json:"hero_title"`
	HeroDescription     string `json:"hero_description"`
	PrimaryCTALabel     string `json:"primary_cta_label"`
	PrimaryCTAURL       string `json:"primary_cta_url"`
	PrimaryCTAEnabled   bool   `json:"primary_cta_enabled"`
	SecondaryCTALabel   string `json:"secondary_cta_label"`
	SecondaryCTAURL     string `json:"secondary_cta_url"`
	SecondaryCTAEnabled bool   `json:"secondary_cta_enabled"`
	BackgroundMode      string `json:"background_mode"`
	HeroStatus          string `json:"hero_status"`
	IsPublished         bool   `json:"is_published"`
}

type PublicCurrentPhaseDTO struct {
	Name     string     `json:"name"`
	EndDate  *time.Time `json:"end_date,omitempty"`
	IsActive bool       `json:"is_active"`
}

type PublicCountdownDTO struct {
	TargetDate string `json:"target_date"`
	Label      string `json:"label"`
}

type PublicRegistrationCTA struct {
	Label string `json:"label"`
	URL   string `json:"url"`
	Open  bool   `json:"open"`
	Style string `json:"style"` // "primary" or "outline"
}

type PublicCtaDTO struct {
	CandidateRegistration   *PublicRegistrationCTA `json:"candidate_registration,omitempty"`
	ParticipantRegistration *PublicRegistrationCTA `json:"participant_registration,omitempty"`
}

type PublicTimelineDTO struct {
	ID               string    `json:"id"`
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	StartDate        time.Time `json:"start_date"`
	EndDate          time.Time `json:"end_date"`
	DisplayOrder     int       `json:"display_order"`
	RegistrationType string    `json:"registration_type"`
	Status           string    `json:"status"` // "past", "active", "upcoming"
}

type PublicAnnouncementDTO struct {
	ID           string    `json:"id"`
	Title        string    `json:"title"`
	Slug         string    `json:"slug"`
	Category     string    `json:"category"`
	Summary      string    `json:"summary"`
	Content      string    `json:"content"`
	ThumbnailURL string    `json:"thumbnail_url"`
	IsPinned     bool      `json:"is_pinned"`
	PublishedAt  time.Time `json:"published_at"`
	CreatedAt    time.Time `json:"created_at"`
}

type WebsiteCandidateCMSDTO struct {
	SectionTitle       string `json:"section_title"`
	SectionDescription string `json:"section_description"`
	RegistrationStatus string `json:"registration_status"`
	EmptyStateMessage  string `json:"empty_state_message"`
	PublicationMessage string `json:"publication_message"`
}

type PublicCandidateSectionDTO struct {
	SectionTitle       string               `json:"section_title"`
	SectionDescription string               `json:"section_description"`
	RegistrationStatus string               `json:"registration_status"`
	EmptyStateMessage  string               `json:"empty_state_message"`
	PublicationMessage string               `json:"publication_message"`
	Items              []PublicCandidateDTO `json:"items"`
}

type PublicCandidateDTO struct {
	ID             string  `json:"id"`
	SequenceNumber *int    `json:"sequence_number"`
	Name           *string `json:"name"`
	Title          *string `json:"title"`
	Vision         *string `json:"vision"`
	PhotoURL       *string `json:"photo_url"`
	Biography      *string `json:"biography,omitempty"`
	Mission        *string `json:"mission,omitempty"`
	Organization   *string `json:"organization,omitempty"`
	MusyawarahID   *string `json:"omitempty"`
}

type WebsiteFooterDTO struct {
	OrganizationName string `json:"organization_name"`
	Description      string `json:"description"`
	Copyright        string `json:"copyright"`
	OfficialBadge    string `json:"official_badge"`
	Tagline          string `json:"tagline"`
}

type PublicNavigationItemDTO struct {
	Label      string `json:"label"`
	Href       string `json:"href"`
	IsExternal bool   `json:"is_external"`
}

type PublicMetadataDTO struct {
	SiteName       string `json:"site_name"`
	Tagline        string `json:"tagline"`
	SEOTitle       string `json:"seo_title"`
	SEODescription string `json:"seo_description"`
	SEOImageURL    string `json:"seo_image_url"`
	FaviconURL     string `json:"favicon_url"`
}

type PublicFeatureFlagsDTO struct {
	RegistrationEnabled bool `json:"registration_enabled"`
	MaintenanceMode     bool `json:"maintenance_mode"`
	DefaultLightTheme   bool `json:"default_light_theme"`
	DefaultDarkTheme    bool `json:"default_dark_theme"`
}

// ============================================================================
// Admin Request DTOs
// ============================================================================

type UpdateGeneralRequest struct {
	SiteName            string `json:"site_name" validate:"required,max=255"`
	Tagline             string `json:"tagline" validate:"required,max=255"`
	Theme               string `json:"theme" validate:"required,max=100"`
	PrimaryColor        string `json:"primary_color" validate:"required,max=50"`
	SecondaryColor      string `json:"secondary_color" validate:"required,max=50"`
	DefaultLightTheme   bool   `json:"default_light_theme"`
	DefaultDarkTheme    bool   `json:"default_dark_theme"`
	RegistrationEnabled bool   `json:"registration_enabled"`
	MaintenanceMode     bool   `json:"maintenance_mode"`
	SEOTitle            string `json:"seo_title" validate:"required,max=255"`
	SEODescription      string `json:"seo_description" validate:"required"`
	SEOImageURL         string `json:"seo_image_url"`
	FaviconURL          string `json:"favicon_url"`
}

type UpdateHeroRequest struct {
	HeroBadge           string `json:"hero_badge" validate:"required,max=255"`
	HeroTitle           string `json:"hero_title" validate:"required,max=255"`
	HeroDescription     string `json:"hero_description" validate:"required"`
	PrimaryCTALabel     string `json:"primary_cta_label" validate:"required,max=100"`
	PrimaryCTAURL       string `json:"primary_cta_url" validate:"required,max=255"`
	PrimaryCTAEnabled   bool   `json:"primary_cta_enabled"`
	SecondaryCTALabel   string `json:"secondary_cta_label" validate:"required,max=100"`
	SecondaryCTAURL     string `json:"secondary_cta_url" validate:"required,max=255"`
	SecondaryCTAEnabled bool   `json:"secondary_cta_enabled"`
	BackgroundMode      string `json:"background_mode" validate:"required,max=50"`
	HeroStatus          string `json:"hero_status" validate:"required,max=50"`
	IsPublished         bool   `json:"is_published"`
}

type CreateTimelinePhaseRequest struct {
	Title            string    `json:"title" validate:"required,max=255"`
	Description      string    `json:"description"`
	StartDate        time.Time `json:"start_date" validate:"required"`
	EndDate          time.Time `json:"end_date" validate:"required"`
	DisplayOrder     int       `json:"display_order"`
	RegistrationType string    `json:"registration_type" validate:"required,oneof=NONE PARTICIPANT CANDIDATE BOTH"`
	CurrentIndicator bool      `json:"current_indicator"`
	IsPublished      bool      `json:"is_published"`
}

type UpdateTimelinePhaseRequest struct {
	Title            string    `json:"title" validate:"required,max=255"`
	Description      string    `json:"description"`
	StartDate        time.Time `json:"start_date" validate:"required"`
	EndDate          time.Time `json:"end_date" validate:"required"`
	DisplayOrder     int       `json:"display_order"`
	RegistrationType string    `json:"registration_type" validate:"required,oneof=NONE PARTICIPANT CANDIDATE BOTH"`
	CurrentIndicator bool      `json:"current_indicator"`
	IsPublished      bool      `json:"is_published"`
}

type ReorderTimelinePhaseItem struct {
	ID           string `json:"id" validate:"required,uuid"`
	DisplayOrder int    `json:"display_order"`
}

type ReorderTimelinePhasesRequest struct {
	Items []ReorderTimelinePhaseItem `json:"items" validate:"required,dive"`
}

type CreateAnnouncementRequest struct {
	Title        string    `json:"title" validate:"required,max=255"`
	Slug         string    `json:"slug" validate:"required,max=255"`
	Category     string    `json:"category" validate:"required,max=100"`
	Summary      string    `json:"summary"`
	Content      string    `json:"content" validate:"required"`
	ThumbnailURL string    `json:"thumbnail_url"`
	IsPinned     bool      `json:"is_pinned"`
	IsPublished  bool      `json:"is_published"`
	PublishedAt  time.Time `json:"published_at"`
}

type UpdateAnnouncementRequest struct {
	Title        string    `json:"title" validate:"required,max=255"`
	Slug         string    `json:"slug" validate:"required,max=255"`
	Category     string    `json:"category" validate:"required,max=100"`
	Summary      string    `json:"summary"`
	Content      string    `json:"content" validate:"required"`
	ThumbnailURL string    `json:"thumbnail_url"`
	IsPinned     bool      `json:"is_pinned"`
	IsPublished  bool      `json:"is_published"`
	PublishedAt  time.Time `json:"published_at"`
}

type UpdateCandidateCMSRequest struct {
	SectionTitle       string `json:"section_title" validate:"required,max=255"`
	SectionDescription string `json:"section_description" validate:"required"`
	RegistrationStatus string `json:"registration_status" validate:"required,max=50"`
	EmptyStateMessage  string `json:"empty_state_message" validate:"required"`
	PublicationMessage string `json:"publication_message" validate:"required"`
}

type UpdateFooterRequest struct {
	OrganizationName string `json:"organization_name" validate:"required,max=255"`
	Description      string `json:"description" validate:"required"`
	Copyright        string `json:"copyright" validate:"required,max=255"`
	OfficialBadge    string `json:"official_badge" validate:"required,max=255"`
	Tagline          string `json:"tagline" validate:"required,max=255"`
}

type PublicInformationPageDTO struct {
	ID          string    `json:"id"`
	Slug        string    `json:"slug"`
	Title       string    `json:"title"`
	Content     string    `json:"content"`
	IsPublished bool      `json:"is_published"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateInformationPageRequest struct {
	Slug        string `json:"slug" validate:"required,max=255"`
	Title       string `json:"title" validate:"required,max=255"`
	Content     string `json:"content" validate:"required"`
	IsPublished bool   `json:"is_published"`
}

type UpdateInformationPageRequest struct {
	Slug        string `json:"slug" validate:"required,max=255"`
	Title       string `json:"title" validate:"required,max=255"`
	Content     string `json:"content" validate:"required"`
	IsPublished bool   `json:"is_published"`
}

type MediaUploadResponse struct {
	Path string `json:"path"`
	URL  string `json:"url"`
	Size int64  `json:"size"`
}


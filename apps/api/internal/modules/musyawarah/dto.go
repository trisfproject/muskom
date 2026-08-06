package musyawarah

import "time"

// --- List / Create ---

type CreateMusyawarahRequest struct {
	Name                       string     `json:"name" validate:"required,max=255"`
	Slug                       string     `json:"slug" validate:"required,max=255"`
	Theme                      *string    `json:"theme" validate:"required,max=255"`
	Description                *string    `json:"description" validate:"required"`
	PeriodStart                time.Time `json:"period_start" validate:"omitempty"`
	PeriodEnd                  time.Time `json:"period_end" validate:"omitempty"`
	EventDate                  time.Time `json:"event_date" validate:"required"`
	LocationName               *string    `json:"location_name" validate:"required,max=255"`
	Address                    *string    `json:"address" validate:"omitempty"`
	GoogleMapsURL              *string    `json:"google_maps_url" validate:"omitempty,max=255"`
}

type MusyawarahListItem struct {
	ID                         string     `json:"id"`
	Name                       string     `json:"name"`
	Slug                       string     `json:"slug"`
	Theme                      *string    `json:"theme"`
	Status                     string     `json:"status"`
	PeriodStart                time.Time `json:"period_start"`
	PeriodEnd                  time.Time `json:"period_end"`
	EventDate                  time.Time `json:"event_date"`
	PublishResult              bool       `json:"publish_result"`
	CreatedAt                  time.Time  `json:"created_at"`
}

// --- Update (full config) ---

type UpdateMusyawarahRequest struct {
	Name                       string     `json:"name" validate:"required,max=255"`
	Slug                       string     `json:"slug" validate:"required,max=255"`
	Theme                      *string    `json:"theme" validate:"required,max=255"`
	Description                *string    `json:"description" validate:"required"`
	PeriodStart                time.Time `json:"period_start" validate:"omitempty"`
	PeriodEnd                  time.Time `json:"period_end" validate:"omitempty"`
	EventDate                  time.Time `json:"event_date" validate:"required"`
	LocationName               *string    `json:"location_name" validate:"required,max=255"`
	Address                    *string    `json:"address" validate:"omitempty"`
	GoogleMapsURL              *string    `json:"google_maps_url" validate:"omitempty,max=255"`
}

type MusyawarahResponse struct {
	ID                         string     `json:"id"`
	Name                       string     `json:"name"`
	Slug                       string     `json:"slug"`
	Theme                      *string    `json:"theme"`
	Description                *string    `json:"description"`
	PeriodStart                time.Time `json:"period_start"`
	PeriodEnd                  time.Time `json:"period_end"`
	EventDate                  time.Time `json:"event_date"`
	LocationName               *string    `json:"location_name"`
	Address                    *string    `json:"address"`
	GoogleMapsURL              *string    `json:"google_maps_url"`
	BannerPath                 *string    `json:"banner_path"`
	LogoPath                   *string    `json:"logo_path"`
	CoverPath                  *string    `json:"cover_path"`
	Status                     string     `json:"status"`
	IsActive                   bool       `json:"is_active"`
	PublishResult              bool       `json:"publish_result"`
	CreatedAt                  time.Time  `json:"created_at"`
	UpdatedAt                  time.Time  `json:"updated_at"`
}


type MediaResponse struct {
	LogoURL   *string `json:"logo_url"`
	BannerURL *string `json:"banner_url"`
	CoverURL  *string `json:"cover_url"`
}

type SettingsRequest struct {
	MaxParticipants            *int   `json:"max_participants" validate:"omitempty,gt=0"`
	RegistrationApprovalMode   string `json:"registration_approval_mode" validate:"required,oneof=MANUAL AUTOMATIC"`
	CandidateApprovalMode      string `json:"candidate_approval_mode" validate:"required,oneof=MANUAL AUTOMATIC"`
	EnableAttendance           bool   `json:"enable_attendance"`
	AttendanceQRExpiration     int    `json:"attendance_qr_expiration" validate:"required,gt=0"`
	AttendanceRadius           int    `json:"attendance_radius" validate:"required,gte=0"`
	EnableVoting               bool   `json:"enable_voting"`
	AllowRevote                bool   `json:"allow_revote"`
	ShowLiveResult             bool   `json:"show_live_result"`
	PublishFinalResult         bool   `json:"publish_final_result"`
	AllowCandidateRegistration bool   `json:"allow_candidate_registration"`
	ShowCandidateList          bool   `json:"show_candidate_list"`
	ShowTimeline               bool   `json:"show_timeline"`
	ShowStatistics             bool   `json:"show_statistics"`
	ShowAnnouncements          bool   `json:"show_announcements"`
}

type SettingsResponse struct {
	MaxParticipants            *int   `json:"max_participants"`
	RegistrationApprovalMode   string `json:"registration_approval_mode"`
	CandidateApprovalMode      string `json:"candidate_approval_mode"`
	EnableAttendance           bool   `json:"enable_attendance"`
	AttendanceQRExpiration     int    `json:"attendance_qr_expiration"`
	AttendanceRadius           int    `json:"attendance_radius"`
	EnableVoting               bool   `json:"enable_voting"`
	AllowRevote                bool   `json:"allow_revote"`
	ShowLiveResult             bool   `json:"show_live_result"`
	PublishFinalResult         bool   `json:"publish_final_result"`
	AllowCandidateRegistration bool   `json:"allow_candidate_registration"`
	ShowCandidateList          bool   `json:"show_candidate_list"`
	ShowTimeline               bool   `json:"show_timeline"`
	ShowStatistics             bool   `json:"show_statistics"`
	ShowAnnouncements          bool   `json:"show_announcements"`
}

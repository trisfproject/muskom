package musyawarah

import "time"

type UpdateMusyawarahRequest struct {
	Name                       string     `json:"name" validate:"required,max=255"`
	Slug                       string     `json:"slug" validate:"required,max=255"`
	Theme                      *string    `json:"theme" validate:"omitempty,max=255"`
	Tagline                    *string    `json:"tagline" validate:"omitempty,max=255"`
	Description                *string    `json:"description" validate:"omitempty"`
	Year                       *int       `json:"year" validate:"omitempty"`
	StartDate                  *time.Time `json:"start_date" validate:"omitempty"`
	EndDate                    *time.Time `json:"end_date" validate:"omitempty"`
	Timezone                   *string    `json:"timezone" validate:"omitempty,max=50"`
	Venue                      *string    `json:"venue" validate:"omitempty,max=255"`
	Address                    *string    `json:"address" validate:"omitempty"`
	GoogleMapsURL              *string    `json:"google_maps_url" validate:"omitempty"`
	City                       *string    `json:"city" validate:"omitempty,max=100"`
	Province                   *string    `json:"province" validate:"omitempty,max=100"`
	MeetingType                *string    `json:"meeting_type" validate:"omitempty,max=50"`
	Location                   *string    `json:"location" validate:"omitempty,max=255"`
	BannerPath                 *string    `json:"banner_path" validate:"omitempty,max=255"`
	LogoPath                   *string    `json:"logo_path" validate:"omitempty,max=255"`
	Status                     string     `json:"status" validate:"required,oneof=DRAFT PUBLISHED ARCHIVED UPCOMING ONGOING COMPLETED CANCELLED"`
	MaxParticipants            *int    `json:"max_participants"`
	PublishResult              bool    `json:"publish_result"`
	AllowCandidateRegistration bool    `json:"allow_candidate_registration"`

	// Phases
	RegistrationStart          *time.Time `json:"registration_start"`
	RegistrationEnd            *time.Time `json:"registration_end"`
	CandidateRegistrationStart *time.Time `json:"candidate_registration_start"`
	CandidateRegistrationEnd   *time.Time `json:"candidate_registration_end"`
	VotingStart                *time.Time `json:"voting_start"`
	VotingEnd                  *time.Time `json:"voting_end"`
}

type MusyawarahResponse struct {
	ID                         string     `json:"id"`
	Name                       string     `json:"name"`
	Slug                       string     `json:"slug"`
	Theme                      *string    `json:"theme"`
	Tagline                    *string    `json:"tagline"`
	Description                *string    `json:"description"`
	Year                       *int       `json:"year"`
	StartDate                  *time.Time `json:"start_date"`
	EndDate                    *time.Time `json:"end_date"`
	Timezone                   *string    `json:"timezone"`
	Venue                      *string    `json:"venue"`
	Address                    *string    `json:"address"`
	GoogleMapsURL              *string    `json:"google_maps_url"`
	City                       *string    `json:"city"`
	Province                   *string    `json:"province"`
	MeetingType                *string    `json:"meeting_type"`
	Location                   *string    `json:"location"`
	BannerPath                 *string    `json:"banner_path"`
	LogoPath                   *string    `json:"logo_path"`
	CoverPath                  *string    `json:"cover_path"`
	Status                     string     `json:"status"`
	MaxParticipants            *int    `json:"max_participants"`
	PublishResult              bool    `json:"publish_result"`
	AllowCandidateRegistration bool    `json:"allow_candidate_registration"`

	RegistrationStart          *time.Time `json:"registration_start"`
	RegistrationEnd            *time.Time `json:"registration_end"`
	CandidateRegistrationStart *time.Time `json:"candidate_registration_start"`
	CandidateRegistrationEnd   *time.Time `json:"candidate_registration_end"`
	VotingStart                *time.Time `json:"voting_start"`
	VotingEnd                  *time.Time `json:"voting_end"`
}

type TimelinePhaseDTO struct {
	StartAt *time.Time `json:"start_at"`
	EndAt   *time.Time `json:"end_at"`
}

type TimelineRequest struct {
	Registration               TimelinePhaseDTO `json:"registration"`
	CandidateRegistration      TimelinePhaseDTO `json:"candidate_registration"`
	AdministrativeVerification TimelinePhaseDTO `json:"administrative_verification"`
	CandidateVerification      TimelinePhaseDTO `json:"candidate_verification"`
	Campaign                   TimelinePhaseDTO `json:"campaign"`
	CoolingOff                 TimelinePhaseDTO `json:"cooling_off"`
	AttendanceCheckIn          TimelinePhaseDTO `json:"attendance_check_in"`
	Voting                     TimelinePhaseDTO `json:"voting"`
	ResultPublication          TimelinePhaseDTO `json:"result_publication"`
}

type TimelineResponse struct {
	Registration               TimelinePhaseDTO `json:"registration"`
	CandidateRegistration      TimelinePhaseDTO `json:"candidate_registration"`
	AdministrativeVerification TimelinePhaseDTO `json:"administrative_verification"`
	CandidateVerification      TimelinePhaseDTO `json:"candidate_verification"`
	Campaign                   TimelinePhaseDTO `json:"campaign"`
	CoolingOff                 TimelinePhaseDTO `json:"cooling_off"`
	AttendanceCheckIn          TimelinePhaseDTO `json:"attendance_check_in"`
	Voting                     TimelinePhaseDTO `json:"voting"`
	ResultPublication          TimelinePhaseDTO `json:"result_publication"`
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

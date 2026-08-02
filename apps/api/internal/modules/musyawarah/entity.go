package musyawarah

import "time"

type MusyawarahEvent struct {
	ID                         string     `db:"id"`
	Name                       string     `db:"name"`
	Slug                       string     `db:"slug"`
	Theme                      *string    `db:"theme"`
	Description                *string    `db:"description"`
	Location                   *string    `db:"location"`
	Address                    *string    `db:"address"`
	GoogleMapsURL              *string    `db:"google_maps_url"`
	PeriodStart                *time.Time `db:"period_start"`
	PeriodEnd                  *time.Time `db:"period_end"`
	EventDate                  *time.Time `db:"event_date"`
	RegistrationOpen           *time.Time `db:"registration_open"`
	RegistrationClose          *time.Time `db:"registration_close"`
	CandidateRegistrationOpen  *time.Time `db:"candidate_registration_open"`
	CandidateRegistrationClose *time.Time `db:"candidate_registration_close"`
	BannerPath                 *string    `db:"banner_path"`
	LogoPath                   *string    `db:"logo_path"`
	CoverPath                  *string    `db:"cover_path"`
	Status                     string     `db:"status"`
	IsActive                   bool       `db:"is_default_active"`
	CreatedBy                  *string    `db:"created_by"`
	UpdatedBy                  *string    `db:"updated_by"`
	CreatedAt                  time.Time  `db:"created_at"`
	UpdatedAt                  time.Time  `db:"updated_at"`
	DeletedAt                  *time.Time `db:"deleted_at"`
}

type MusyawarahSettings struct {
	RegistrationLimit          *int   `db:"registration_limit"`
	RegistrationApprovalMode   string `db:"registration_approval_mode"`
	CandidateApprovalMode      string `db:"candidate_approval_mode"`
	EnableAttendance           bool   `db:"enable_attendance"`
	AttendanceQRExpiration     int    `db:"attendance_qr_expiration"`
	AttendanceRadius           int    `db:"attendance_radius"`
	EnableVoting               bool   `db:"enable_voting"`
	AllowRevote                bool   `db:"allow_revote"`
	ShowLiveResult             bool   `db:"show_live_result"`
	PublishFinalResult         bool   `db:"publish_final_result"`
	AllowCandidateRegistration bool   `db:"allow_candidate_registration"`
	ShowCandidateList          bool   `db:"show_candidate_list"`
	ShowTimeline               bool   `db:"show_timeline"`
	ShowStatistics             bool   `db:"show_statistics"`
	ShowAnnouncements          bool   `db:"show_announcements"`
}

type MusyawarahPhase struct {
	Phase   string     `db:"phase"`
	StartAt *time.Time `db:"start_at"`
	EndAt   *time.Time `db:"end_at"`
}

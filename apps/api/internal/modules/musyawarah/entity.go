package musyawarah

import "time"

type MusyawarahEvent struct {
	ID         string  `db:"id"`
	Name       string  `db:"name"`
	Theme      *string `db:"theme"`
	Location   *string `db:"location"`
	BannerPath *string `db:"banner_path"`
	LogoPath   *string `db:"logo_path"`
	CoverPath  *string `db:"cover_path"`
	Status     string  `db:"status"`
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

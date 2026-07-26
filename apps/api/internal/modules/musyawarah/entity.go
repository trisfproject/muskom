package musyawarah

import "time"

type MusyawarahEvent struct {
	ID         string  `db:"id"`
	Name       string  `db:"name"`
	Theme      *string `db:"theme"`
	Location   *string `db:"location"`
	BannerPath *string `db:"banner_path"`
	LogoPath   *string `db:"logo_path"`
	Status     string  `db:"status"`
}

type MusyawarahSettings struct {
	RegistrationLimit          *int `db:"registration_limit"`
	ShowLiveResult             bool `db:"show_live_result"`
	AllowCandidateRegistration bool `db:"allow_candidate_registration"`
}

type MusyawarahPhase struct {
	Phase   string     `db:"phase"`
	StartAt *time.Time `db:"start_at"`
	EndAt   *time.Time `db:"end_at"`
}

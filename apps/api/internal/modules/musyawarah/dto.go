package musyawarah

import "time"

type UpdateMusyawarahRequest struct {
	Name                       string  `json:"name" validate:"required,max=255"`
	Theme                      *string `json:"theme" validate:"omitempty,max=255"`
	Location                   *string `json:"location" validate:"omitempty,max=255"`
	BannerPath                 *string `json:"banner_path" validate:"omitempty,max=255"`
	LogoPath                   *string `json:"logo_path" validate:"omitempty,max=255"`
	Status                     string  `json:"status" validate:"required,oneof=DRAFT UPCOMING ONGOING COMPLETED CANCELLED"`
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
	ID                         string  `json:"id"`
	Name                       string  `json:"name"`
	Theme                      *string `json:"theme"`
	Location                   *string `json:"location"`
	BannerPath                 *string `json:"banner_path"`
	LogoPath                   *string `json:"logo_path"`
	Status                     string  `json:"status"`
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

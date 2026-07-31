package voting

import (
	"time"

	"github.com/google/uuid"
)

// SubmitVoteRequest represents the payload for casting a vote
type SubmitVoteRequest struct {
	EventID     uuid.UUID `json:"event_id" validate:"required"`
	CandidateID uuid.UUID `json:"candidate_id" validate:"required"`
}

// MyVoteStatusResponse represents the participant's voting status
type MyVoteStatusResponse struct {
	EventID  uuid.UUID  `json:"event_id"`
	HasVoted bool       `json:"has_voted"`
	VotedAt  *time.Time `json:"voted_at,omitempty"`
}

type AdminListVotesRequest struct {
	Page           int        `query:"page"`
	Limit          int        `query:"limit"`
	EventID        *uuid.UUID `query:"event_id"`
	CandidateID    *uuid.UUID `query:"candidate_id"`
	RegistrationID *uuid.UUID `query:"registration_id"`
	SortBy         string     `query:"sort_by"`
	SortOrder      string     `query:"sort_order"`
}

type AdminVoteResponse struct {
	ID              uuid.UUID `json:"id" db:"id"`
	EventID         uuid.UUID `json:"event_id" db:"event_id"`
	RegistrationID  uuid.UUID `json:"registration_id" db:"registration_id"`
	CandidateID     uuid.UUID `json:"candidate_id" db:"candidate_id"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	ParticipantName string    `json:"participant_name,omitempty" db:"participant_name"`
	CandidateName   string    `json:"candidate_name,omitempty" db:"candidate_name"`
}

type AdminListVotesResponse struct {
	Data       []AdminVoteResponse `json:"data"`
	Total      int                 `json:"total"`
	Page       int                 `json:"page"`
	Limit      int                 `json:"limit"`
	TotalPages int                 `json:"total_pages"`
}

type CandidateStatistic struct {
	CandidateID   uuid.UUID `json:"candidate_id"`
	CandidateName string    `json:"candidate_name"`
	VoteCount     int       `json:"vote_count"`
	Percentage    float64   `json:"percentage"`
}

type AdminVoteStatisticsResponse struct {
	EventID    uuid.UUID            `json:"event_id"`
	TotalVotes int                  `json:"total_votes"`
	Candidates []CandidateStatistic `json:"candidates"`
}

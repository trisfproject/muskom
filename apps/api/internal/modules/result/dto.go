package result

import (
	"time"

	"github.com/google/uuid"
)

type CandidateResult struct {
	CandidateID   uuid.UUID `json:"candidate_id"`
	CandidateName string    `json:"candidate_name"`
	VoteCount     int       `json:"vote_count"`
	Percentage    float64   `json:"percentage"`
}

type ElectionResultResponse struct {
	EventID        uuid.UUID         `json:"event_id"`
	TotalVotes     int               `json:"total_votes"`
	ValidVotes     int               `json:"valid_votes"`
	WinnerID       *uuid.UUID        `json:"winner_id,omitempty"`
	WinnerName     string            `json:"winner_name,omitempty"`
	Candidates     []CandidateResult `json:"candidates"`
	PublishedAt    *time.Time        `json:"published_at,omitempty"`
	IsTie          bool              `json:"is_tie"`
}

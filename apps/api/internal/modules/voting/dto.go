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

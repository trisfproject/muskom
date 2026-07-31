package voting

import (
	"context"
	"time"
)

// Ballot represents a sealed vote record
type Ballot struct {
	ID          string    `json:"id"`
	SessionID   string    `json:"session_id"`
	CandidateID string    `json:"candidate_id"`
	CastAt      time.Time `json:"cast_at"`
}

// CandidateVote represents the aggregation for a candidate
type CandidateVote struct {
	CandidateID string  `json:"candidate_id"`
	TotalVotes  int     `json:"total_votes"`
	Percentage  float64 `json:"percentage"`
}

// VotingSession represents an active election period
type VotingSession struct {
	ID        string    `json:"id"`
	EventID   string    `json:"event_id"`
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`
	IsActive  bool      `json:"is_active"`
}

// VoteSummary represents the final or real-time vote tally
type VoteSummary struct {
	SessionID    string          `json:"session_id"`
	TotalVoters  int             `json:"total_voters"`
	VotesCast    int             `json:"votes_cast"`
	Results      []CandidateVote `json:"results"`
}

// VotingService defines the business logic for elections
type VotingService interface {
	CastVote(ctx context.Context, sessionID, voterID, candidateID string) (*Ballot, error)
	GetSessionSummary(ctx context.Context, sessionID string) (*VoteSummary, error)
	InitializeSession(ctx context.Context, eventID string) (*VotingSession, error)
}

// VotingRepository defines the data access contract
type VotingRepository interface {
	SaveBallot(ctx context.Context, ballot *Ballot) error
	GetResults(ctx context.Context, sessionID string) ([]CandidateVote, error)
	GetSession(ctx context.Context, sessionID string) (*VotingSession, error)
}

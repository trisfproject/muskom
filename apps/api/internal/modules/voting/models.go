package voting

import (
	"time"
)

type SessionStatus string

const (
	SessionNotStarted SessionStatus = "NOT_STARTED"
	SessionRunning    SessionStatus = "RUNNING"
	SessionPaused     SessionStatus = "PAUSED"
	SessionClosed     SessionStatus = "CLOSED"
)

type VotingSession struct {
	ID        string        `db:"id"`
	EventID   string        `db:"event_id"`
	Status    SessionStatus `db:"status"`
	StartedAt *time.Time    `db:"started_at"`
	ClosedAt  *time.Time    `db:"closed_at"`
	CreatedAt time.Time     `db:"created_at"`
	UpdatedAt time.Time     `db:"updated_at"`
}

type Vote struct {
	ID             string    `db:"id"`
	EventID        string    `db:"event_id"`
	RegistrationID string    `db:"registration_id"`
	CandidateID    string    `db:"candidate_id"`
	CreatedAt      time.Time `db:"created_at"`
	UpdatedAt      time.Time `db:"updated_at"`
}

type CandidateSnapshot struct {
	ID             string `json:"id"`
	Number         int    `json:"number"`
	Name           string `json:"name"`
	PhotoURL       string `json:"photo_url"`
	Vision         string `json:"vision"`
	Mission        string `json:"mission"`
}

type Ballot struct {
	Candidates []CandidateSnapshot `json:"candidates"`
}

type VoteResult struct {
	CandidateID   string `json:"candidate_id" db:"candidate_id"`
	CandidateName string `json:"candidate_name" db:"name"`
	TotalVotes    int    `json:"total_votes" db:"total_votes"`
}

type VoteSummary struct {
	TotalVoters      int          `json:"total_voters"`
	VotesCast        int          `json:"votes_cast"`
	ParticipationPct float64      `json:"participation_pct"`
	Results          []VoteResult `json:"results"`
}

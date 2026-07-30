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
	EventName      string            `json:"event_name"`
	TotalVotes     int               `json:"total_votes"`
	ValidVotes     int               `json:"valid_votes"`
	WinnerID       *uuid.UUID        `json:"winner_id,omitempty"`
	WinnerName     string            `json:"winner_name,omitempty"`
	Candidates     []CandidateResult `json:"candidates"`
	PublishedAt    *time.Time        `json:"published_at,omitempty"`
	IsTie          bool              `json:"is_tie"`
	TiedCandidates []CandidateResult `json:"tied_candidates,omitempty"`
}

type ElectionOverviewResponse struct {
	EventID        uuid.UUID `json:"event_id"`
	TotalEligible  int       `json:"total_eligible"`
	TotalCheckedIn int       `json:"total_checked_in"`
	TotalVotes     int       `json:"total_votes"`
	Participation  float64   `json:"participation_percentage"`
}

type AuditLogResponse struct {
	ID        uuid.UUID   `json:"id"`
	UserID    *uuid.UUID  `json:"user_id,omitempty"`
	Action    string      `json:"action"`
	IPAddress string      `json:"ip_address,omitempty"`
	Metadata  interface{} `json:"metadata,omitempty"`
	CreatedAt time.Time   `json:"created_at"`
}

type AdminListAuditRequest struct {
	Page      int    `query:"page"`
	Limit     int    `query:"limit"`
	Action    string `query:"action"`
	SortBy    string `query:"sort_by"`
	SortOrder string `query:"sort_order"`
}

type AdminListAuditResponse struct {
	Data       []AuditLogResponse `json:"data"`
	Total      int                `json:"total"`
	Page       int                `json:"page"`
	TotalPages int                `json:"total_pages"`
}

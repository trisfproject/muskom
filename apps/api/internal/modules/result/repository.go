package result

import (
	"context"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetElectionResults(ctx context.Context, eventID uuid.UUID) (*ElectionResultResponse, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetElectionResults(ctx context.Context, eventID uuid.UUID) (*ElectionResultResponse, error) {
	// 1. Get total votes for the event
	var totalVotes int
	totalQuery := `SELECT COUNT(id) FROM votes WHERE event_id = $1`
	err := r.db.GetContext(ctx, &totalVotes, totalQuery, eventID)
	if err != nil {
		return nil, err
	}

	// 2. Get statistics per candidate
	statsQuery := `
		SELECT 
			c.id as candidate_id, 
			cp.full_name as candidate_name,
			COUNT(v.id) as vote_count
		FROM candidates c
		JOIN registrations cr ON c.registration_id = cr.id
		JOIN persons cp ON cr.person_id = cp.id
		LEFT JOIN votes v ON v.candidate_id = c.id AND v.event_id = $1
		WHERE c.event_id = $1 AND c.status = 'ACCEPTED'
		GROUP BY c.id, cp.full_name
		ORDER BY vote_count DESC
	`

	type statRow struct {
		CandidateID   uuid.UUID `db:"candidate_id"`
		CandidateName string    `db:"candidate_name"`
		VoteCount     int       `db:"vote_count"`
	}

	var rows []statRow
	err = r.db.SelectContext(ctx, &rows, statsQuery, eventID)
	if err != nil {
		return nil, err
	}

	stats := make([]CandidateResult, 0, len(rows))
	var highestVotes int
	var winnerID *uuid.UUID
	var winnerName string
	var isTie bool
	var tiedCandidates []CandidateResult

	for i, row := range rows {
		percentage := float64(0)
		if totalVotes > 0 {
			percentage = (float64(row.VoteCount) / float64(totalVotes)) * 100.0
		}

		candidateRes := CandidateResult{
			CandidateID:   row.CandidateID,
			CandidateName: row.CandidateName,
			VoteCount:     row.VoteCount,
			Percentage:    percentage,
		}

		stats = append(stats, candidateRes)

		// Tie and Winner Logic
		if i == 0 {
			highestVotes = row.VoteCount
			id := row.CandidateID
			winnerID = &id
			winnerName = row.CandidateName
			tiedCandidates = append(tiedCandidates, candidateRes)
		} else if row.VoteCount == highestVotes && highestVotes > 0 {
			isTie = true
			winnerID = nil
			winnerName = ""
			tiedCandidates = append(tiedCandidates, candidateRes)
		}
	}

	if !isTie {
		tiedCandidates = nil
	}

	return &ElectionResultResponse{
		EventID:        eventID,
		TotalVotes:     totalVotes,
		ValidVotes:     totalVotes,
		WinnerID:       winnerID,
		WinnerName:     winnerName,
		Candidates:     stats,
		IsTie:          isTie,
		TiedCandidates: tiedCandidates,
	}, nil
}

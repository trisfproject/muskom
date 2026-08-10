package reporting

import (
	"context"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetOfficialResult(ctx context.Context, eventID string) (*OfficialResult, error)
	LogReportGeneration(ctx context.Context, history *ReportHistory) error
	GetReportHistory(ctx context.Context, eventID string) ([]ReportHistory, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetOfficialResult(ctx context.Context, eventID string) (*OfficialResult, error) {
	result := &OfficialResult{}

	// 1. Total Registered
	r.db.GetContext(ctx, &result.TotalRegistered, `SELECT COUNT(*) FROM participants WHERE deleted_at IS NULL`, eventID)

	// 2. Approved Participants
	r.db.GetContext(ctx, &result.ApprovedParticipants, `SELECT COUNT(*) FROM participants WHERE deleted_at IS NULL AND status IN ('Verified', 'APPROVED')`, eventID)

	// 3. Checked In & Eligible Voters (Same for this context)
	r.db.GetContext(ctx, &result.CheckedIn, `
		SELECT COUNT(DISTINCT p.id) 
		FROM attendance a 
		JOIN participants p ON a.participant_id = p.id 
		WHERE p.deleted_at IS NULL AND a.undone_at IS NULL
	`, eventID)
	result.EligibleVoters = result.CheckedIn

	// 4. Candidate Results & Total Votes
	query := `
		SELECT c.id, COALESCE(c.candidate_number, c.display_order, 0) as number, c.full_name as name, COUNT(b.id) as total_votes
		FROM candidates c
		LEFT JOIN ballots b ON c.id = b.candidate_id
		WHERE c.deleted_at IS NULL
		GROUP BY c.id, c.candidate_number, c.display_order, c.full_name
		ORDER BY total_votes DESC, number ASC
	`
	var rows []struct {
		ID         string `db:"id"`
		Number     int    `db:"number"`
		Name       string `db:"name"`
		TotalVotes int    `db:"total_votes"`
	}
	r.db.SelectContext(ctx, &rows, query, eventID)

	for _, row := range rows {
		cand := CandidateResult{
			CandidateID: row.ID,
			Name:        row.Name,
			Number:      row.Number,
			TotalVotes:  row.TotalVotes,
		}
		result.CandidateResults = append(result.CandidateResults, cand)
		result.TotalVotes += row.TotalVotes
	}

	// Calculate winning candidate (first in ordered list if votes > 0)
	if len(result.CandidateResults) > 0 && result.CandidateResults[0].TotalVotes > 0 {
		result.WinningCandidate = &result.CandidateResults[0]
	}

	// 5. Abstain & Participation
	result.Abstain = result.EligibleVoters - result.TotalVotes
	if result.Abstain < 0 {
		result.Abstain = 0 // Failsafe
	}

	if result.EligibleVoters > 0 {
		result.ParticipationPct = (float64(result.TotalVotes) / float64(result.EligibleVoters)) * 100
	}

	return result, nil
}

func (r *repository) LogReportGeneration(ctx context.Context, history *ReportHistory) error {
	query := `
		INSERT INTO report_history ( report_type, file_format, generated_by, file_url)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query,
		history.EventID, history.ReportType, history.FileFormat, history.GeneratedBy, history.FileURL,
	).Scan(&history.ID, &history.CreatedAt)
}

func (r *repository) GetReportHistory(ctx context.Context, eventID string) ([]ReportHistory, error) {
	var history []ReportHistory
	query := `SELECT * FROM report_history WHERE event_id = $1 ORDER BY created_at DESC`
	err := r.db.SelectContext(ctx, &history, query, eventID)
	return history, err
}

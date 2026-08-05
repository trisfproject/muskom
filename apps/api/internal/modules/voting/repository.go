package voting

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetSessionByEvent(ctx context.Context, eventID string) (*VotingSession, error)
	UpdateSessionStatus(ctx context.Context, eventID string, status SessionStatus) error
	
	HasVoted(ctx context.Context, eventID, participantID string) (bool, error)
	CastVote(ctx context.Context, tx *sqlx.Tx, vote *Vote) error
	
	GetBallotCandidates(ctx context.Context, eventID string) ([]CandidateSnapshot, error)
	GetResults(ctx context.Context, eventID string) ([]VoteResult, error)
	GetTotalCheckedIn(ctx context.Context, eventID string) (int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetSessionByEvent(ctx context.Context, eventID string) (*VotingSession, error) {
	var session VotingSession
	err := r.db.GetContext(ctx, &session, `SELECT * FROM voting_sessions WHERE event_id = $1`, eventID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// Auto-initialize if it doesn't exist
			_, err = r.db.ExecContext(ctx, `INSERT INTO voting_sessions (event_id) VALUES ($1) ON CONFLICT DO NOTHING`, eventID)
			if err != nil {
				return nil, err
			}
			return r.GetSessionByEvent(ctx, eventID)
		}
		return nil, err
	}
	return &session, nil
}

func (r *repository) UpdateSessionStatus(ctx context.Context, eventID string, status SessionStatus) error {
	query := `UPDATE voting_sessions SET status = $1, updated_at = NOW()`
	if status == SessionRunning {
		query += `, started_at = COALESCE(started_at, NOW())`
	} else if status == SessionClosed {
		query += `, closed_at = NOW()`
	}
	query += ` WHERE event_id = $2`
	_, err := r.db.ExecContext(ctx, query, status, eventID)
	return err
}

func (r *repository) HasVoted(ctx context.Context, eventID, participantID string) (bool, error) {
	var count int
	err := r.db.GetContext(ctx, &count, `SELECT COUNT(*) FROM votes WHERE (event_id = $1 OR $1 = '') AND participant_id = $2`, eventID, participantID)
	return count > 0, err
}

func (r *repository) CastVote(ctx context.Context, tx *sqlx.Tx, vote *Vote) error {
	query := `INSERT INTO votes (event_id, participant_id, candidate_id) VALUES ($1, $2, $3)`
	_, err := tx.ExecContext(ctx, query, vote.EventID, vote.ParticipantID, vote.CandidateID)
	return err
}

func (r *repository) GetBallotCandidates(ctx context.Context, eventID string) ([]CandidateSnapshot, error) {
	query := `
		SELECT c.id, COALESCE(c.candidate_number, c.display_order, 0) as number, c.full_name as name, c.profile_photo as photo_path, c.vision, c.mission
		FROM candidates c
		WHERE (c.musyawarah_id = $1 OR $1 = '') AND c.deleted_at IS NULL AND c.status IN ('Verified', 'VERIFIED', 'Approved', 'Draft')
		ORDER BY number ASC
	`
	var rows []struct {
		ID        string         `db:"id"`
		Number    int            `db:"number"`
		Name      string         `db:"name"`
		PhotoPath sql.NullString `db:"photo_path"`
		Vision    sql.NullString `db:"vision"`
		Mission   sql.NullString `db:"mission"`
	}
	err := r.db.SelectContext(ctx, &rows, query, eventID)
	if err != nil {
		return nil, err
	}

	var res []CandidateSnapshot
	for _, r := range rows {
		res = append(res, CandidateSnapshot{
			ID:       r.ID,
			Number:   r.Number,
			Name:     r.Name,
			PhotoURL: r.PhotoPath.String,
			Vision:   r.Vision.String,
			Mission:  r.Mission.String,
		})
	}
	return res, nil
}

func (r *repository) GetResults(ctx context.Context, eventID string) ([]VoteResult, error) {
	query := `
		SELECT c.id as candidate_id, c.full_name as name, COUNT(v.id) as total_votes
		FROM candidates c
		LEFT JOIN votes v ON c.id = v.candidate_id
		WHERE (c.musyawarah_id = $1 OR $1 = '') AND c.deleted_at IS NULL
		GROUP BY c.id, c.full_name
		ORDER BY total_votes DESC, c.full_name ASC
	`
	var results []VoteResult
	err := r.db.SelectContext(ctx, &results, query, eventID)
	return results, err
}

func (r *repository) GetTotalCheckedIn(ctx context.Context, eventID string) (int, error) {
	var count int
	err := r.db.GetContext(ctx, &count, `
		SELECT COUNT(a.id) 
		FROM attendance a
		JOIN participants p ON a.participant_id = p.id
		WHERE (p.musyawarah_id = $1 OR $1 = '') AND a.undone_at IS NULL AND p.deleted_at IS NULL
	`, eventID)
	return count, err
}

package voting

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	HasVoted(ctx context.Context, eventID, participantID string) (bool, error)
	CastVote(ctx context.Context, tx *sqlx.Tx, vote *Vote) error

	GetBallotCandidates(ctx context.Context, eventID string) ([]CandidateSnapshot, error)
	GetResults(ctx context.Context, eventID string) ([]VoteResult, error)
	GetTotalCheckedIn(ctx context.Context, eventID string) (int, error)

	GetVerifiedVoterEmails(ctx context.Context, eventID string) ([]string, error)
	GetUnvotedVerifiedVoterEmails(ctx context.Context, eventID string) ([]string, error)
	IsParticipantEligible(ctx context.Context, eventID, participantID string) (bool, error)
	GetParticipantByRegNumber(ctx context.Context, regNum string) (*ParticipantEligibility, error)

	UpdateSessionStatus(ctx context.Context, status SessionStatus) error
	GetSessionStatus(ctx context.Context) (SessionStatus, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) HasVoted(ctx context.Context, eventID, participantID string) (bool, error) {
	var count int
	err := r.db.GetContext(ctx, &count, `SELECT COUNT(*) FROM votes WHERE participant_id = $1`, participantID)
	return count > 0, err
}

func (r *repository) CastVote(ctx context.Context, tx *sqlx.Tx, vote *Vote) error {
	query := `INSERT INTO votes (participant_id, candidate_id) VALUES ($1, $2)`
	_, err := tx.ExecContext(ctx, query, vote.ParticipantID, vote.CandidateID)
	return err
}

func (r *repository) GetBallotCandidates(ctx context.Context, eventID string) ([]CandidateSnapshot, error) {
	query := `
		SELECT c.id, COALESCE(c.candidate_number, c.display_order, 0) as number, c.full_name as name, c.profile_photo as photo_path, c.vision, c.mission
		FROM candidates c
		WHERE c.deleted_at IS NULL AND c.status IN ('Verified', 'VERIFIED', 'Approved', 'APPROVED')
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
	err := r.db.SelectContext(ctx, &rows, query)
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
		WHERE c.deleted_at IS NULL AND c.status IN ('Verified', 'VERIFIED', 'Approved', 'APPROVED')
		GROUP BY c.id, c.full_name
		ORDER BY total_votes DESC, c.full_name ASC
	`
	var results []VoteResult
	err := r.db.SelectContext(ctx, &results, query)
	return results, err
}

func (r *repository) GetTotalCheckedIn(ctx context.Context, eventID string) (int, error) {
	var count int
	err := r.db.GetContext(ctx, &count, `
		SELECT COUNT(a.id) 
		FROM attendance a
		JOIN participants p ON a.participant_id = p.id
		WHERE a.undone_at IS NULL AND p.deleted_at IS NULL
	`)
	return count, err
}

func (r *repository) GetVerifiedVoterEmails(ctx context.Context, eventID string) ([]string, error) {
	var emails []string
	query := `SELECT email FROM participants WHERE status IN ('Verified', 'VERIFIED', 'Approved', 'APPROVED') AND deleted_at IS NULL AND email IS NOT NULL AND email != ''`
	err := r.db.SelectContext(ctx, &emails, query)
	return emails, err
}

func (r *repository) GetUnvotedVerifiedVoterEmails(ctx context.Context, eventID string) ([]string, error) {
	var emails []string
	query := `
		SELECT p.email 
		FROM participants p 
		WHERE p.status IN ('Verified', 'VERIFIED', 'Approved', 'APPROVED') 
		  AND p.deleted_at IS NULL 
		  AND p.email IS NOT NULL 
		  AND p.email != ''
		  AND p.id NOT IN (SELECT participant_id FROM votes)
	`
	err := r.db.SelectContext(ctx, &emails, query)
	return emails, err
}

func (r *repository) IsParticipantEligible(ctx context.Context, eventID, participantID string) (bool, error) {
	var count int
	query := `
		SELECT COUNT(p.id) 
		FROM participants p
		JOIN attendance a ON a.participant_id = p.id
		WHERE p.id = $1 
		  AND p.status IN ('Verified', 'VERIFIED', 'Approved', 'APPROVED') 
		  AND p.deleted_at IS NULL
		  AND a.undone_at IS NULL
	`
	// Using $1 for participantID, we don't strictly filter eventID here unless there are multiple events in one DB (which we assume there aren't for participants directly or we can ignore it since they are unique).
	err := r.db.GetContext(ctx, &count, query, participantID)
	return count > 0, err
}

func (r *repository) GetParticipantByRegNumber(ctx context.Context, regNum string) (*ParticipantEligibility, error) {
	query := `
		SELECT 
			p.id as participant_id,
			p.registration_number,
			p.full_name
		FROM participants p
		WHERE p.registration_number = $1
		  AND p.deleted_at IS NULL
	`
	var res ParticipantEligibility
	err := r.db.GetContext(ctx, &res, query, regNum)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Not found
		}
		return nil, err
	}
	return &res, nil
}

func (r *repository) UpdateSessionStatus(ctx context.Context, status SessionStatus) error {
	query := `
		INSERT INTO system_configurations (group_name, settings)
		VALUES ('voting_session', jsonb_build_object('status', $1::text))
		ON CONFLICT (group_name) DO UPDATE SET settings = EXCLUDED.settings, updated_at = NOW()
	`
	_, err := r.db.ExecContext(ctx, query, status)
	return err
}

func (r *repository) GetSessionStatus(ctx context.Context) (SessionStatus, error) {
	var settings string
	query := `SELECT settings->>'status' FROM system_configurations WHERE group_name = 'voting_session'`
	err := r.db.GetContext(ctx, &settings, query)
	if err != nil {
		if err == sql.ErrNoRows {
			return SessionNotStarted, nil
		}
		return SessionNotStarted, err
	}
	return SessionStatus(settings), nil
}

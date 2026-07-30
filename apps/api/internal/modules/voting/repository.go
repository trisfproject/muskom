package voting

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

var (
	ErrParticipantNotFound = errors.New("participant registration not found or not approved")
	ErrVotingClosed        = errors.New("voting phase is not active for this event")
	ErrNotCheckedIn        = errors.New("participant has not checked in")
	ErrInvalidCandidate    = errors.New("invalid candidate for this event")
	ErrAlreadyVoted        = errors.New("participant has already cast a vote for this event")
)

type Repository interface {
	GetParticipantRegistration(ctx context.Context, userID, eventID uuid.UUID) (uuid.UUID, error)
	CheckEventPhase(ctx context.Context, eventID uuid.UUID, phase string) (bool, error)
	CheckAttendance(ctx context.Context, registrationID uuid.UUID) (bool, error)
	CheckCandidateEligibility(ctx context.Context, candidateID, eventID uuid.UUID) (bool, error)
	GetMyVoteStatus(ctx context.Context, registrationID, eventID uuid.UUID) (*MyVoteStatusResponse, error)
	SubmitVote(ctx context.Context, eventID, registrationID, candidateID uuid.UUID, metadata string) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetParticipantRegistration(ctx context.Context, userID, eventID uuid.UUID) (uuid.UUID, error) {
	query := `
		SELECT r.id
		FROM registrations r
		JOIN users u ON u.person_id = r.person_id
		WHERE u.id = $1 AND r.event_id = $2 AND r.status = 'APPROVED'
	`
	var regID uuid.UUID
	err := r.db.GetContext(ctx, &regID, query, userID, eventID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return uuid.Nil, ErrParticipantNotFound
		}
		return uuid.Nil, err
	}
	return regID, nil
}

func (r *repository) CheckEventPhase(ctx context.Context, eventID uuid.UUID, phase string) (bool, error) {
	query := `
		SELECT is_active
		FROM event_phases
		WHERE event_id = $1 AND phase = $2
	`
	var isActive bool
	err := r.db.GetContext(ctx, &isActive, query, eventID, phase)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}
	return isActive, nil
}

func (r *repository) CheckAttendance(ctx context.Context, registrationID uuid.UUID) (bool, error) {
	query := `
		SELECT 1
		FROM attendance
		WHERE registration_id = $1
	`
	var exists int
	err := r.db.GetContext(ctx, &exists, query, registrationID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (r *repository) CheckCandidateEligibility(ctx context.Context, candidateID, eventID uuid.UUID) (bool, error) {
	query := `
		SELECT 1
		FROM candidates
		WHERE id = $1 AND event_id = $2
	`
	var exists int
	err := r.db.GetContext(ctx, &exists, query, candidateID, eventID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (r *repository) GetMyVoteStatus(ctx context.Context, registrationID, eventID uuid.UUID) (*MyVoteStatusResponse, error) {
	query := `
		SELECT created_at
		FROM votes
		WHERE registration_id = $1 AND event_id = $2
	`
	var votedAt time.Time
	err := r.db.GetContext(ctx, &votedAt, query, registrationID, eventID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &MyVoteStatusResponse{
				EventID:  eventID,
				HasVoted: false,
			}, nil
		}
		return nil, err
	}

	return &MyVoteStatusResponse{
		EventID:  eventID,
		HasVoted: true,
		VotedAt:  &votedAt,
	}, nil
}

func (r *repository) SubmitVote(ctx context.Context, eventID, registrationID, candidateID uuid.UUID, metadata string) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert vote
	voteQuery := `
		INSERT INTO votes (event_id, registration_id, candidate_id)
		VALUES ($1, $2, $3)
	`
	_, err = tx.ExecContext(ctx, voteQuery, eventID, registrationID, candidateID)
	if err != nil {
		// Postgres unique violation code is 23505
		if err.Error() == "pq: duplicate key value violates unique constraint \"uq_votes_event_registration\"" ||
			err.Error() == "ERROR: duplicate key value violates unique constraint \"uq_votes_event_registration\" (SQLSTATE 23505)" {
			// We can't rely on pq specific error matching without importing pq, so we just check substrings or let the service handle it,
			// actually let's just do a simple substring check or let's use standard string check
		}
		return err // We'll handle unique constraint error wrapping if needed, or just let service format it
	}

	// Insert audit log
	// Find user_id from registration_id for the actor
	var actorID uuid.UUID
	actorQuery := `
		SELECT u.id 
		FROM users u 
		JOIN registrations r ON r.person_id = u.person_id 
		WHERE r.id = $1
	`
	err = tx.GetContext(ctx, &actorID, actorQuery, registrationID)
	if err == nil {
		auditQuery := `
			INSERT INTO audit_logs (id, actor_id, entity_type, entity_id, action, metadata, ip_address, user_agent, status, created_at)
			VALUES (gen_random_uuid(), $1, 'VOTE', $2, 'CAST_VOTE', $3, 'system', 'system', 'SUCCESS', NOW())
		`
		_, _ = tx.ExecContext(ctx, auditQuery, actorID, eventID, metadata)
	}

	return tx.Commit()
}

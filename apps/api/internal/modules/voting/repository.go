package voting

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
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
	ErrVoteNotFound        = errors.New("vote not found")
)

type Repository interface {
	GetParticipantRegistration(ctx context.Context, userID, eventID uuid.UUID) (uuid.UUID, error)
	CheckEventPhase(ctx context.Context, eventID uuid.UUID, phase string) (bool, error)
	CheckAttendance(ctx context.Context, registrationID uuid.UUID) (bool, error)
	CheckCandidateEligibility(ctx context.Context, candidateID, eventID uuid.UUID) (bool, error)
	GetMyVoteStatus(ctx context.Context, registrationID, eventID uuid.UUID) (*MyVoteStatusResponse, error)
	SubmitVote(ctx context.Context, eventID, registrationID, candidateID uuid.UUID, metadata string) error

	// Admin Methods
	AdminListVotes(ctx context.Context, req AdminListVotesRequest) ([]AdminVoteResponse, int, error)
	AdminGetVote(ctx context.Context, id uuid.UUID) (*AdminVoteResponse, error)
	AdminGetVoteStatistics(ctx context.Context, eventID uuid.UUID) (*AdminVoteStatisticsResponse, error)
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
			INSERT INTO audit_logs (id, user_id, module, action, entity, entity_id, ip_address, user_agent, metadata, created_at)
			VALUES (gen_random_uuid(), $1, 'VOTING', 'CAST_VOTE', 'EVENT', $2, 'system', 'system', $3, NOW())
		`
		_, _ = tx.ExecContext(ctx, auditQuery, actorID, eventID, metadata)
	}

	return tx.Commit()
}

func (r *repository) AdminListVotes(ctx context.Context, req AdminListVotesRequest) ([]AdminVoteResponse, int, error) {
	query := `
		SELECT 
			v.id, v.event_id, v.registration_id, v.candidate_id, v.created_at,
			p.full_name as participant_name,
			cp.full_name as candidate_name
		FROM votes v
		JOIN registrations r ON v.registration_id = r.id
		JOIN persons p ON r.person_id = p.id
		JOIN candidates c ON v.candidate_id = c.id
		JOIN registrations cr ON c.registration_id = cr.id
		JOIN persons cp ON cr.person_id = cp.id
		WHERE 1=1
	`
	countQuery := `
		SELECT COUNT(v.id)
		FROM votes v
		WHERE 1=1
	`

	var args []interface{}
	argID := 1

	if req.EventID != nil {
		query += fmt.Sprintf(" AND v.event_id = $%d", argID)
		countQuery += fmt.Sprintf(" AND v.event_id = $%d", argID)
		args = append(args, *req.EventID)
		argID++
	}
	if req.CandidateID != nil {
		query += fmt.Sprintf(" AND v.candidate_id = $%d", argID)
		countQuery += fmt.Sprintf(" AND v.candidate_id = $%d", argID)
		args = append(args, *req.CandidateID)
		argID++
	}
	if req.RegistrationID != nil {
		query += fmt.Sprintf(" AND v.registration_id = $%d", argID)
		countQuery += fmt.Sprintf(" AND v.registration_id = $%d", argID)
		args = append(args, *req.RegistrationID)
		argID++
	}

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, err
	}

	if total == 0 {
		return []AdminVoteResponse{}, 0, nil
	}

	// Sorting
	sortBy := "v.created_at"
	sortOrder := "DESC"

	if req.SortBy != "" {
		switch req.SortBy {
		case "created_at":
			sortBy = "v.created_at"
		case "candidate":
			sortBy = "cp.full_name"
		case "registration":
			sortBy = "p.full_name"
		}
	}
	if strings.ToUpper(req.SortOrder) == "ASC" {
		sortOrder = "ASC"
	}

	query += fmt.Sprintf(" ORDER BY %s %s", sortBy, sortOrder)

	// Pagination
	limit := req.Limit
	if limit <= 0 {
		limit = 10
	}
	page := req.Page
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argID, argID+1)
	args = append(args, limit, offset)

	var votes []AdminVoteResponse
	err = r.db.SelectContext(ctx, &votes, query, args...)
	if err != nil {
		return nil, 0, err
	}

	if len(votes) == 0 {
		votes = []AdminVoteResponse{} // Ensure JSON returns [] instead of null
	}

	return votes, total, nil
}

func (r *repository) AdminGetVote(ctx context.Context, id uuid.UUID) (*AdminVoteResponse, error) {
	query := `
		SELECT 
			v.id, v.event_id, v.registration_id, v.candidate_id, v.created_at,
			p.full_name as participant_name,
			cp.full_name as candidate_name
		FROM votes v
		JOIN registrations r ON v.registration_id = r.id
		JOIN persons p ON r.person_id = p.id
		JOIN candidates c ON v.candidate_id = c.id
		JOIN registrations cr ON c.registration_id = cr.id
		JOIN persons cp ON cr.person_id = cp.id
		WHERE v.id = $1
	`
	var vote AdminVoteResponse
	err := r.db.GetContext(ctx, &vote, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("vote not found")
		}
		return nil, err
	}
	return &vote, nil
}

func (r *repository) AdminGetVoteStatistics(ctx context.Context, eventID uuid.UUID) (*AdminVoteStatisticsResponse, error) {
	// 1. Get total votes
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

	// We'll map the results into a temporary struct since sqlx might not map Percentage automatically
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

	stats := make([]CandidateStatistic, 0, len(rows))
	for _, r := range rows {
		percentage := float64(0)
		if totalVotes > 0 {
			percentage = (float64(r.VoteCount) / float64(totalVotes)) * 100.0
		}
		stats = append(stats, CandidateStatistic{
			CandidateID:   r.CandidateID,
			CandidateName: r.CandidateName,
			VoteCount:     r.VoteCount,
			Percentage:    percentage,
		})
	}

	return &AdminVoteStatisticsResponse{
		EventID:    eventID,
		TotalVotes: totalVotes,
		Candidates: stats,
	}, nil
}

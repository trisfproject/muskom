package result

import (
	"context"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetElectionResults(ctx context.Context, eventID uuid.UUID) (*ElectionResultResponse, error)
	GetElectionOverview(ctx context.Context, eventID uuid.UUID) (*ElectionOverviewResponse, error)
	GetAuditLogs(ctx context.Context, eventID uuid.UUID, req AdminListAuditRequest) ([]AuditLogResponse, int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetElectionResults(ctx context.Context, eventID uuid.UUID) (*ElectionResultResponse, error) {
	// 1. Get event info and total votes
	var eventName string
	err := r.db.GetContext(ctx, &eventName, `SELECT name FROM events WHERE id = $1`, eventID)
	if err != nil {
		return nil, err
	}

	var totalVotes int
	totalQuery := `SELECT COUNT(id) FROM ballots`
	err = r.db.GetContext(ctx, &totalVotes, totalQuery)
	if err != nil {
		return nil, err
	}

	// 2. Get statistics per candidate
	statsQuery := `
		SELECT 
			c.id as candidate_id, 
			c.full_name as candidate_name,
			COUNT(v.id) as vote_count
		FROM candidates c
		LEFT JOIN ballots v ON v.candidate_id = c.id
		WHERE c.deleted_at IS NULL AND c.status IN ('Verified', 'VERIFIED', 'Approved', 'APPROVED')
		GROUP BY c.id, c.full_name
		ORDER BY vote_count DESC
	`

	type statRow struct {
		CandidateID   uuid.UUID `db:"candidate_id"`
		CandidateName string    `db:"candidate_name"`
		VoteCount     int       `db:"vote_count"`
	}

	var rows []statRow
	err = r.db.SelectContext(ctx, &rows, statsQuery)
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
		EventName:      eventName,
		TotalVotes:     totalVotes,
		ValidVotes:     totalVotes,
		WinnerID:       winnerID,
		WinnerName:     winnerName,
		Candidates:     stats,
		IsTie:          isTie,
		TiedCandidates: tiedCandidates,
	}, nil
}

func (r *repository) GetElectionOverview(ctx context.Context, eventID uuid.UUID) (*ElectionOverviewResponse, error) {
	var overview ElectionOverviewResponse
	overview.EventID = eventID

	// Total Eligible (Approved/Verified Participants)
	err := r.db.GetContext(ctx, &overview.TotalEligible, `SELECT COUNT(id) FROM participants WHERE deleted_at IS NULL AND status IN ('Verified', 'APPROVED')`)
	if err != nil {
		return nil, err
	}

	// Total Checked-In (Attendance)
	err = r.db.GetContext(ctx, &overview.TotalCheckedIn, `
		SELECT COUNT(a.id) 
		FROM attendance a 
		JOIN participants p ON a.participant_id = p.id 
		WHERE a.undone_at IS NULL AND p.deleted_at IS NULL
	`)
	if err != nil {
		return nil, err
	}

	// Total Votes
	err = r.db.GetContext(ctx, &overview.TotalVotes, `SELECT COUNT(id) FROM ballots`)
	if err != nil {
		return nil, err
	}

	// Participation Percentage
	if overview.TotalEligible > 0 {
		overview.Participation = (float64(overview.TotalVotes) / float64(overview.TotalEligible)) * 100.0
	} else {
		overview.Participation = 0
	}

	return &overview, nil
}

func (r *repository) GetAuditLogs(ctx context.Context, eventID uuid.UUID, req AdminListAuditRequest) ([]AuditLogResponse, int, error) {
	// Query the audit_logs table for module VOTING and entity_id eventID
	baseQuery := ` FROM audit_logs WHERE module = 'VOTING' AND entity = 'EVENT' AND entity_id = $1`
	args := []interface{}{eventID}
	argID := 2

	if req.Action != "" {
		baseQuery += ` AND action = $` + string(rune('0'+argID))
		args = append(args, req.Action)
		argID++
	}

	// Get total
	var total int
	err := r.db.GetContext(ctx, &total, `SELECT COUNT(id)`+baseQuery, args...)
	if err != nil {
		return nil, 0, err
	}

	// Build main query
	orderClause := " ORDER BY created_at DESC"
	if req.SortBy == "action" {
		if req.SortOrder == "asc" {
			orderClause = " ORDER BY action ASC"
		} else {
			orderClause = " ORDER BY action DESC"
		}
	} else if req.SortBy == "created_at" {
		if req.SortOrder == "asc" {
			orderClause = " ORDER BY created_at ASC"
		} else {
			orderClause = " ORDER BY created_at DESC"
		}
	}

	limit := req.Limit
	if limit <= 0 {
		limit = 10
	}
	offset := (req.Page - 1) * limit
	if offset < 0 {
		offset = 0
	}

	args = append(args, limit, offset)

	// Format arg parameters. e.g. $2, $3
	// using direct query construction for simplicity in this exercise, normally you'd use a query builder like squirrel
	// To avoid complex string runes, let's just use `sqlx.Rebind` or query builder
	query := `SELECT id, user_id, action, ip_address, metadata, created_at` + baseQuery + orderClause + ` LIMIT ? OFFSET ?`
	query = r.db.Rebind(query)

	var logs []AuditLogResponse
	err = r.db.SelectContext(ctx, &logs, query, args...)
	if err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}

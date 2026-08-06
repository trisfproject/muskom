package dashboard

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type Service interface {
	GetDashboardData(ctx context.Context) (*DashboardData, error)
}

type service struct {
	db  *sqlx.DB
	log *zap.Logger
}

func NewService(db *sqlx.DB, log *zap.Logger) Service {
	return &service{db: db, log: log}
}

func (s *service) GetDashboardData(ctx context.Context) (*DashboardData, error) {
	// Resolve active event
	var eventID string
	err := s.db.GetContext(ctx, &eventID, `SELECT id FROM events WHERE is_default_active = true AND deleted_at IS NULL LIMIT 1`)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}

	data := &DashboardData{
		EventID: eventID,
		Health: SystemHealth{
			APIStatus:    "OPERATIONAL",
			WorkerStatus: "IDLE",
		},
	}

	// 1. Check DB Health (Quick Ping)
	if err := s.db.PingContext(ctx); err != nil {
		data.Health.DatabaseStatus = "DEGRADED"
	} else {
		data.Health.DatabaseStatus = "OPERATIONAL"
	}

	// 2. Fetch Event Status
	var status struct {
		Phase string `db:"status"`
	}
	err = s.db.GetContext(ctx, &status, `SELECT status FROM events WHERE id = $1`, eventID)
	if err == nil {
		data.Status.Phase = status.Phase
	}

	data.Status.RegistrationOpen = (status.Phase == "PUBLISHED" || status.Phase == "ONGOING")
	data.Status.VerificationActive = (status.Phase == "PUBLISHED" || status.Phase == "ONGOING")

	var votingStatus string
	err = s.db.GetContext(ctx, &votingStatus, `SELECT status FROM voting_sessions WHERE musyawarah_id = $1 ORDER BY created_at DESC LIMIT 1`, eventID)
	if err == nil {
		data.Status.VotingSessionState = votingStatus
	} else {
		data.Status.VotingSessionState = "NOT_STARTED"
	}

	// 3. Fetch Summary Metrics
	// Sequential quick COUNT queries against canonical tables.

	s.db.GetContext(ctx, &data.Summary.TotalParticipants, `SELECT COUNT(*) FROM participants WHERE musyawarah_id = $1 AND deleted_at IS NULL`, eventID)
	s.db.GetContext(ctx, &data.Summary.ApprovedParticipants, `SELECT COUNT(*) FROM participants WHERE musyawarah_id = $1 AND deleted_at IS NULL AND status = 'Verified'`, eventID)
	s.db.GetContext(ctx, &data.Summary.TotalCandidates, `SELECT COUNT(*) FROM candidates WHERE deleted_at IS NULL AND publication_status = 'Published'`)
	s.db.GetContext(ctx, &data.Summary.CheckedIn, `SELECT COUNT(*) FROM attendance WHERE musyawarah_id = $1`, eventID)
	s.db.GetContext(ctx, &data.Summary.VotesCast, `SELECT COUNT(*) FROM votes WHERE musyawarah_id = $1`, eventID)
	s.db.GetContext(ctx, &data.Summary.PendingNotifications, `SELECT COUNT(*) FROM notification_jobs WHERE status IN ('PENDING', 'QUEUED', 'PROCESSING')`)

	// 4. Fetch Recent Activity (Audit logs)
	query := `
		SELECT id, action, actor_name as actor, actor_role as role, created_at as timestamp 
		FROM audit_logs 
		ORDER BY created_at DESC 
		LIMIT 10
	`
	var activities []RecentActivity
	_ = s.db.SelectContext(ctx, &activities, query)

	if activities == nil {
		activities = []RecentActivity{}
	}
	data.RecentActivity = activities

	return data, nil
}

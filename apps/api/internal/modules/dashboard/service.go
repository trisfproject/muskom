package dashboard

import (
	"context"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type Service interface {
	GetDashboardData(ctx context.Context, eventID string) (*DashboardData, error)
}

type service struct {
	db  *sqlx.DB
	log *zap.Logger
}

func NewService(db *sqlx.DB, log *zap.Logger) Service {
	return &service{db: db, log: log}
}

func (s *service) GetDashboardData(ctx context.Context, eventID string) (*DashboardData, error) {
	data := &DashboardData{
		EventID: eventID,
		Health: SystemHealth{
			APIStatus:      "OPERATIONAL",
			WorkerStatus:   "IDLE", // Mock from notification engine state
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
		Phase string `db:"phase"`
	}
	err := s.db.GetContext(ctx, &status, `SELECT phase FROM events WHERE id = $1`, eventID)
	if err == nil {
		data.Status.Phase = status.Phase
	}
	
	// Default booleans logic based on phase could go here. For RC2 we mock the active booleans
	data.Status.RegistrationOpen = (status.Phase == "REGISTRATION")
	data.Status.VerificationActive = (status.Phase == "VERIFICATION")

	var votingStatus string
	err = s.db.GetContext(ctx, &votingStatus, `SELECT status FROM voting_sessions WHERE event_id = $1`, eventID)
	if err == nil {
		data.Status.VotingSessionState = votingStatus
	} else {
		data.Status.VotingSessionState = "NOT_STARTED"
	}

	// 3. Fetch Summary Metrics
	// For performance, this could be a single complex query or parallelized queries.
	// For RC2 backend structure, we do sequential quick COUNT queries.
	
	s.db.GetContext(ctx, &data.Summary.TotalParticipants, `SELECT COUNT(*) FROM registrations WHERE event_id = $1`, eventID)
	s.db.GetContext(ctx, &data.Summary.ApprovedParticipants, `SELECT COUNT(*) FROM registrations WHERE event_id = $1 AND status = 'APPROVED'`, eventID)
	s.db.GetContext(ctx, &data.Summary.TotalCandidates, `SELECT COUNT(*) FROM candidates WHERE event_id = $1 AND status = 'VERIFIED'`, eventID)
	s.db.GetContext(ctx, &data.Summary.CheckedIn, `SELECT COUNT(*) FROM attendance WHERE event_id = $1`, eventID)
	s.db.GetContext(ctx, &data.Summary.VotesCast, `SELECT COUNT(*) FROM votes WHERE event_id = $1`, eventID)
	s.db.GetContext(ctx, &data.Summary.PendingNotifications, `SELECT COUNT(*) FROM notification_jobs WHERE event_id = $1 AND status IN ('PENDING', 'QUEUED', 'PROCESSING')`, eventID)

	// 4. Fetch Recent Activity (Audit logs)
	query := `
		SELECT id, action, actor_name as actor, actor_role as role, created_at as timestamp 
		FROM audit_logs 
		WHERE event_id = $1 
		ORDER BY created_at DESC 
		LIMIT 10
	`
	var activities []RecentActivity
	_ = s.db.SelectContext(ctx, &activities, query, eventID)
	
	if activities == nil {
		activities = []RecentActivity{} // Return empty array instead of null
	}
	data.RecentActivity = activities

	return data, nil
}

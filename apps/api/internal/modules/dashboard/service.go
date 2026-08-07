package dashboard

import (
	"context"

	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/internal/modules/website"
	"go.uber.org/zap"
)

type Service interface {
	GetDashboardData(ctx context.Context) (*DashboardData, error)
}

type service struct {
	db       *sqlx.DB
	resolver website.PhaseResolver
	log      *zap.Logger
}

func NewService(db *sqlx.DB, log *zap.Logger) Service {
	return &service{db: db, resolver: website.NewPhaseResolver(db), log: log}
}

func (s *service) GetDashboardData(ctx context.Context) (*DashboardData, error) {
	data := &DashboardData{
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

	// 2. Fetch Event Status (Now PhaseResolver)
	currentPhase, err := s.resolver.GetCurrentPhase(ctx)
	if err == nil && currentPhase != nil {
		data.Status.Phase = currentPhase.Title
	} else {
		data.Status.Phase = "NOT_STARTED"
	}

	isOpen, _ := s.resolver.IsParticipantRegistrationOpen(ctx)
	data.Status.RegistrationOpen = isOpen
	data.Status.VerificationActive = isOpen

	if currentPhase != nil && currentPhase.Title == "VOTING" {
		data.Status.VotingSessionState = "RUNNING"
	} else {
		data.Status.VotingSessionState = "NOT_STARTED"
	}

	// 3. Fetch Summary Metrics
	// Sequential quick COUNT queries against canonical tables.

	s.db.GetContext(ctx, &data.Summary.TotalParticipants, `SELECT COUNT(*) FROM participants WHERE deleted_at IS NULL`)
	s.db.GetContext(ctx, &data.Summary.ApprovedParticipants, `SELECT COUNT(*) FROM participants WHERE deleted_at IS NULL AND status IN ('Verified', 'APPROVED')`)
	s.db.GetContext(ctx, &data.Summary.TotalCandidates, `SELECT COUNT(*) FROM candidates WHERE deleted_at IS NULL AND publication_status = 'Published'`)
	s.db.GetContext(ctx, &data.Summary.CheckedIn, `SELECT COUNT(*) FROM attendance WHERE undone_at IS NULL`)
	s.db.GetContext(ctx, &data.Summary.VotesCast, `SELECT COUNT(*) FROM votes`)
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

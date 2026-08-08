package dashboard

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"github.com/trisfproject/muskom/apps/api/internal/modules/website"
	"github.com/trisfproject/muskom/apps/api/platform/mailer"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"go.uber.org/zap"
)

type Service interface {
	GetDashboardData(ctx context.Context) (*DashboardData, error)
	GetOperationsData(ctx context.Context) (*OperationsDashboardData, error)
}

type service struct {
	db          *sqlx.DB
	redisClient *redis.Client
	storage     storage.Storage
	mailer      mailer.Mailer
	resolver    website.PhaseResolver
	log         *zap.Logger
}

func NewService(db *sqlx.DB, redisClient *redis.Client, strg storage.Storage, mailSvc mailer.Mailer, log *zap.Logger) Service {
	return &service{
		db:          db,
		redisClient: redisClient,
		storage:     strg,
		mailer:      mailSvc,
		resolver:    website.NewPhaseResolver(db),
		log:         log,
	}
}

func (s *service) getRegistrationCapacitySettings(ctx context.Context) (int, int, string) {
	var settingsJSON []byte
	err := s.db.GetContext(ctx, &settingsJSON, `SELECT settings FROM system_configurations WHERE group_name = 'registration'`)
	if err != nil {
		return 0, 0, "CLOSE"
	}
	var cfg struct {
		ParticipantLimit    int    `json:"participant_limit"`
		WaitingListCapacity int    `json:"waiting_list_capacity"`
		CapacityMode        string `json:"capacity_mode"`
	}
	if err := json.Unmarshal(settingsJSON, &cfg); err != nil {
		return 0, 0, "CLOSE"
	}
	if cfg.CapacityMode == "" {
		cfg.CapacityMode = "CLOSE"
	}
	return cfg.ParticipantLimit, cfg.WaitingListCapacity, cfg.CapacityMode
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

	s.db.GetContext(ctx, &data.Summary.TotalParticipants, `SELECT COUNT(*) FROM registrations WHERE deleted_at IS NULL`)
	
	// ApprovedParticipants now represents the Main Pool count
	s.db.GetContext(ctx, &data.Summary.ApprovedParticipants, `SELECT COUNT(*) FROM registrations WHERE deleted_at IS NULL AND UPPER(TRIM(status)) NOT IN ('REJECTED', 'WAITING LIST', 'WAITINGLIST', 'WAITING_LIST')`)
	
	// Count waiting list
	s.db.GetContext(ctx, &data.Summary.WaitingList, `SELECT COUNT(*) FROM registrations WHERE deleted_at IS NULL AND UPPER(TRIM(status)) IN ('WAITING LIST', 'WAITINGLIST', 'WAITING_LIST')`)

	s.db.GetContext(ctx, &data.Summary.TotalCandidates, `SELECT COUNT(*) FROM candidates WHERE deleted_at IS NULL AND publication_status = 'Published'`)
	s.db.GetContext(ctx, &data.Summary.CheckedIn, `SELECT COUNT(*) FROM attendance WHERE undone_at IS NULL`)
	s.db.GetContext(ctx, &data.Summary.VotesCast, `SELECT COUNT(*) FROM votes`)
	s.db.GetContext(ctx, &data.Summary.PendingNotifications, `SELECT COUNT(*) FROM notification_jobs WHERE status IN ('PENDING', 'QUEUED', 'PROCESSING')`)

	limitVal, wlCap, modeVal := s.getRegistrationCapacitySettings(ctx)
	data.Summary.CapacityMode = modeVal
	if limitVal > 0 {
		data.Summary.ParticipantLimit = &limitVal
		rem := limitVal - data.Summary.ApprovedParticipants
		if rem < 0 {
			rem = 0
		}
		data.Summary.RemainingCapacity = &rem
		pct := (float64(data.Summary.ApprovedParticipants) / float64(limitVal)) * 100.0
		data.Summary.CapacityPercentage = pct

		if pct >= 100.0 {
			if modeVal == "WAITING_LIST" && wlCap > 0 {
				wlRem := wlCap - data.Summary.WaitingList
				if wlRem > 0 {
					data.Summary.CapacityStatus = "WAITING_LIST_OPEN"
				} else {
					data.Summary.CapacityStatus = "FULL"
				}
			} else {
				data.Summary.CapacityStatus = "FULL"
			}
		} else if pct >= 90.0 {
			data.Summary.CapacityStatus = "CRITICAL"
		} else if pct >= 70.0 {
			data.Summary.CapacityStatus = "WARNING"
		} else {
			data.Summary.CapacityStatus = "NORMAL"
		}
	} else {
		data.Summary.CapacityStatus = "UNLIMITED"
	}

	if wlCap > 0 {
		data.Summary.WaitingListCapacity = &wlCap
		wlRem := wlCap - data.Summary.WaitingList
		if wlRem < 0 {
			wlRem = 0
		}
		data.Summary.WaitingListRemaining = &wlRem
	}

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

func (s *service) GetOperationsData(ctx context.Context) (*OperationsDashboardData, error) {
	data := &OperationsDashboardData{
		SystemHealth: SystemHealthStats{
			API:      "Healthy",
			Database: "Healthy",
			Redis:    "Healthy",
			Storage:  "Healthy",
			SMTP:     "Healthy",
		},
	}

	// Health Checks
	if err := s.db.PingContext(ctx); err != nil {
		data.SystemHealth.Database = "Offline"
	}

	if s.redisClient != nil {
		if err := s.redisClient.Ping(ctx).Err(); err != nil {
			data.SystemHealth.Redis = "Offline"
		}
	} else {
		data.SystemHealth.Redis = "Unknown"
	}

	if s.storage == nil {
		data.SystemHealth.Storage = "Unknown"
	} // Assuming storage is healthy if instantiated for now.

	if s.mailer == nil {
		data.SystemHealth.SMTP = "Unknown"
	}

	// Fetch Participants Stats
	var partStats []struct {
		Status string `db:"status"`
		Count  int    `db:"count"`
	}
	s.db.SelectContext(ctx, &partStats, `SELECT status, count(*) as count FROM registrations WHERE deleted_at IS NULL GROUP BY status`)
	for _, p := range partStats {
		data.Participants.Total += p.Count
		normalized := strings.ToUpper(strings.TrimSpace(p.Status))
		switch {
		case normalized == "REJECTED":
			data.Participants.Rejected += p.Count
		case normalized == "WAITING LIST" || normalized == "WAITINGLIST" || normalized == "WAITING_LIST":
			data.Participants.WaitingList += p.Count
		default:
			// Treat all non-rejected, non-waiting list as Main Pool (Verified capacity)
			data.Participants.Verified += p.Count
			// Also keep track of actual pending for the operations grid breakdown
			if normalized == "PENDING" || normalized == "UNVERIFIED" {
				data.Participants.Pending += p.Count
			}
		}
	}

	limitVal, wlCap, modeVal := s.getRegistrationCapacitySettings(ctx)
	data.Participants.CapacityMode = modeVal
	if limitVal > 0 {
		data.Participants.Limit = &limitVal
		// Remaining main-pool capacity = mainLimit - mainRegistered (not WL)
		mainRegistered := data.Participants.Total - data.Participants.WaitingList - data.Participants.Rejected
		if mainRegistered < 0 {
			mainRegistered = 0
		}
		rem := limitVal - mainRegistered
		if rem < 0 {
			rem = 0
		}
		data.Participants.RemainingCapacity = &rem
	}
	if wlCap > 0 {
		data.Participants.WaitingListCapacity = &wlCap
		wlRem := wlCap - data.Participants.WaitingList
		if wlRem < 0 {
			wlRem = 0
		}
		data.Participants.WaitingListRemaining = &wlRem
	}

	// Fetch Candidates Stats
	var candStats []struct {
		Status string `db:"publication_status"`
		Count  int    `db:"count"`
	}
	s.db.SelectContext(ctx, &candStats, `SELECT publication_status, count(*) as count FROM candidates WHERE deleted_at IS NULL GROUP BY publication_status`)
	for _, c := range candStats {
		data.Candidates.Total += c.Count
		if c.Status == "Published" {
			data.Candidates.Published += c.Count
		}
	}

	// Fetch Attendance
	s.db.GetContext(ctx, &data.Attendance.Present, `SELECT count(*) FROM attendance WHERE undone_at IS NULL`)
	data.Attendance.Absent = data.Participants.Verified - data.Attendance.Present
	if data.Attendance.Absent < 0 {
		data.Attendance.Absent = 0
	}
	if data.Participants.Verified > 0 {
		data.Attendance.Percentage = float64(data.Attendance.Present) / float64(data.Participants.Verified) * 100
	}

	// Fetch Voting
	currentPhase, err := s.resolver.GetCurrentPhase(ctx)
	if err == nil && currentPhase != nil && currentPhase.Title == "VOTING" {
		data.Voting.SessionState = "Open"
	} else {
		data.Voting.SessionState = "Closed"
	}

	s.db.GetContext(ctx, &data.Voting.VotesSubmitted, `SELECT count(*) FROM votes`)
	data.Voting.RemainingVoters = data.Participants.Verified - data.Voting.VotesSubmitted
	if data.Voting.RemainingVoters < 0 {
		data.Voting.RemainingVoters = 0
	}

	// Fetch Recent Registrations
	s.db.SelectContext(ctx, &data.RecentRegistrations, `
		SELECT id, registration_number, full_name, email, status, created_at 
		FROM registrations 
		WHERE deleted_at IS NULL 
		ORDER BY created_at DESC LIMIT 5
	`)

	// Fetch Recent Candidates
	s.db.SelectContext(ctx, &data.RecentCandidates, `
		SELECT id, name, photo_url, status, publication_status 
		FROM candidates 
		WHERE deleted_at IS NULL 
		ORDER BY updated_at DESC LIMIT 5
	`)

	// Fetch Recent Activity
	s.db.SelectContext(ctx, &data.RecentActivity, `
		SELECT id, action, actor_name as actor, actor_role as role, created_at as timestamp 
		FROM audit_logs 
		ORDER BY created_at DESC LIMIT 50
	`)

	if data.RecentRegistrations == nil {
		data.RecentRegistrations = []RecentRegistration{}
	}
	if data.RecentCandidates == nil {
		data.RecentCandidates = []RecentCandidate{}
	}
	if data.RecentActivity == nil {
		data.RecentActivity = []RecentActivity{}
	}

	return data, nil
}

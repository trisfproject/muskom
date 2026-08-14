package dashboard

import (
	"context"
	"encoding/json"

	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
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
	auditRepo   audit.AuditRepository
	log         *zap.Logger
}

func NewService(db *sqlx.DB, redisClient *redis.Client, strg storage.Storage, mailSvc mailer.Mailer, log *zap.Logger) Service {
	return &service{
		db:          db,
		redisClient: redisClient,
		storage:     strg,
		mailer:      mailSvc,
		resolver:    website.NewPhaseResolver(db),
		auditRepo:   audit.NewRepository(db),
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

	s.db.GetContext(ctx, &data.Summary.TotalParticipants, `SELECT COUNT(*) FROM registrations`)
	
	// Verified/Approved count
	s.db.GetContext(ctx, &data.Summary.ApprovedParticipants, `SELECT COUNT(*) FROM registrations WHERE UPPER(TRIM(status)) IN ('VERIFIED', 'APPROVED')`)
	
	// Pending count
	s.db.GetContext(ctx, &data.Summary.PendingParticipants, `SELECT COUNT(*) FROM registrations WHERE UPPER(TRIM(status)) IN ('PENDING', 'UNVERIFIED')`)

	// Rejected count
	s.db.GetContext(ctx, &data.Summary.RejectedParticipants, `SELECT COUNT(*) FROM registrations WHERE UPPER(TRIM(status)) = 'REJECTED'`)

	// Count waiting list
	s.db.GetContext(ctx, &data.Summary.WaitingList, `SELECT COUNT(*) FROM registrations WHERE UPPER(TRIM(status)) IN ('WAITING LIST', 'WAITINGLIST', 'WAITING_LIST')`)

	s.db.GetContext(ctx, &data.Summary.TotalCandidates, `SELECT COUNT(*) FROM candidates WHERE deleted_at IS NULL AND publication_status = 'Published'`)
	s.db.GetContext(ctx, &data.Summary.CheckedIn, `SELECT COUNT(*) FROM attendance WHERE undone_at IS NULL`)
	s.db.GetContext(ctx, &data.Summary.VotesCast, `SELECT COUNT(*) FROM ballots`)
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

	// 4. Fetch Recent Activity (Audit logs) using existing repository
	entries, _, _ := s.auditRepo.Search(ctx, audit.AuditFilter{
		Page:  1,
		Limit: 5,
	})

	var activities []RecentActivity
	for _, entry := range entries {
		activities = append(activities, RecentActivity{
			ID:        entry.ID,
			Action:    string(entry.Action),
			Actor:     entry.ActorName,
			Role:      entry.ActorRole,
			Timestamp: entry.CreatedAt,
		})
	}

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
		PendingRegistrations:      []PendingRegistration{},
		PendingCandidates:         []PendingCandidate{},
		RecentActivity:            []RecentActivity{},
		CandidateRegistrationOpen: false, // Hardcoded false as candidate registration is cancelled/frozen
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
	}
	if s.mailer == nil {
		data.SystemHealth.SMTP = "Unknown"
	}

	// Fetch Pending Registrations (Limit 10)
	s.db.SelectContext(ctx, &data.PendingRegistrations, `
		SELECT r.id, r.registration_number, p.full_name, p.email, r.status, r.created_at 
		FROM registrations r
		JOIN persons p ON r.person_id = p.id
		WHERE UPPER(TRIM(r.status)) IN ('PENDING', 'UNVERIFIED')
		ORDER BY r.created_at ASC LIMIT 10
	`)

	// Fetch Pending Candidates (Limit 10)
	s.db.SelectContext(ctx, &data.PendingCandidates, `
		SELECT id, full_name as name, profile_photo as photo_url, status, status as publication_status 
		FROM candidates 
		WHERE deleted_at IS NULL AND UPPER(TRIM(status)) IN ('DRAFT', 'PENDING', 'SUBMITTED')
		ORDER BY updated_at ASC LIMIT 10
	`)

	// Attendance Stats
	var totalApproved int
	_ = s.db.GetContext(ctx, &totalApproved, `SELECT COUNT(*) FROM participants WHERE deleted_at IS NULL AND UPPER(TRIM(status)) IN ('APPROVED', 'VERIFIED')`)
	_ = s.db.GetContext(ctx, &data.Attendance.Present, `SELECT COUNT(*) FROM attendance WHERE undone_at IS NULL`)
	if totalApproved > 0 {
		absent := totalApproved - data.Attendance.Present
		if absent < 0 {
			absent = 0
		}
		data.Attendance.Absent = absent
		data.Attendance.Percentage = (float64(data.Attendance.Present) / float64(totalApproved)) * 100.0
	}
	
	// Eligible Voters & Reconciliation
	var checkedInCount int
	_ = s.db.GetContext(ctx, &checkedInCount, `
		SELECT COUNT(a.id) FROM attendance a
		JOIN participants p ON a.participant_id = p.id
		WHERE a.undone_at IS NULL AND p.deleted_at IS NULL
	`)

	var receiptsCount int
	_ = s.db.GetContext(ctx, &receiptsCount, `SELECT COUNT(*) FROM voter_receipts`)

	var ballotsCount int
	_ = s.db.GetContext(ctx, &ballotsCount, `SELECT COUNT(*) FROM ballots`)

	data.Voting.VotesSubmitted = ballotsCount
	data.Voting.ReceiptsCount = receiptsCount
	data.Voting.BallotsCount = ballotsCount
	data.Voting.ReconciliationOK = (receiptsCount == ballotsCount)

	notYetVoted := checkedInCount - receiptsCount
	if notYetVoted < 0 {
		notYetVoted = 0
	}
	data.Voting.NotYetVoted = notYetVoted
	data.Voting.RemainingVoters = notYetVoted

	// Fetch Recent Activity using existing repository
	opEntries, _, _ := s.auditRepo.Search(ctx, audit.AuditFilter{
		Page:  1,
		Limit: 3,
	})

	for _, entry := range opEntries {
		data.RecentActivity = append(data.RecentActivity, RecentActivity{
			ID:        entry.ID,
			Action:    string(entry.Action),
			Actor:     entry.ActorName,
			Role:      entry.ActorRole,
			Timestamp: entry.CreatedAt,
		})
	}

	return data, nil
}


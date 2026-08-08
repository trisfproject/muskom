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
	
	// ApprovedParticipants now represents the Main Pool count
	s.db.GetContext(ctx, &data.Summary.ApprovedParticipants, `SELECT COUNT(*) FROM registrations WHERE UPPER(TRIM(status)) NOT IN ('REJECTED', 'WAITING LIST', 'WAITINGLIST', 'WAITING_LIST')`)
	
	// Count waiting list
	s.db.GetContext(ctx, &data.Summary.WaitingList, `SELECT COUNT(*) FROM registrations WHERE UPPER(TRIM(status)) IN ('WAITING LIST', 'WAITINGLIST', 'WAITING_LIST')`)

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


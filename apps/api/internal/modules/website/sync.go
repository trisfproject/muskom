package website

import (
	"context"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

// TimelineSynchronizer propagates website_timeline_phases data to derived
// tables (event_phases, events.registration_open/close) so that all backend
// consumers read consistent operational dates.
//
// Architecture Note (ADR-007, RC-1 Transitional):
// website_timeline_phases is the canonical source for RC-1.
// event_phases and events.registration_* are derived consumers, synchronized
// automatically through this service-layer component.
// The long-term architecture (RC-2+) may introduce a domain-owned timeline
// aggregate, but this does not affect the RC-1 implementation.
type TimelineSynchronizer interface {
	SyncAll(ctx context.Context) error
}

type timelineSynchronizer struct {
	db     *sqlx.DB
	logger *zap.Logger
}

// NewTimelineSynchronizer creates a synchronizer that reads all published
// website_timeline_phases for the active event and writes derived data to
// event_phases and events columns.
func NewTimelineSynchronizer(db *sqlx.DB, logger *zap.Logger) TimelineSynchronizer {
	return &timelineSynchronizer{db: db, logger: logger}
}

// SyncAll reads all published website_timeline_phases, maps them to
// event_phases entries and events.registration_open/close columns based on
// the registration_type field.
//
// Mapping:
//
//	registration_type = PARTICIPANT → event_phases.REGISTRATION + events.registration_open/close
//	registration_type = CANDIDATE  → event_phases.CANDIDATE_REGISTRATION + events.candidate_registration_open/close
//	registration_type = BOTH       → both REGISTRATION and CANDIDATE_REGISTRATION phases + all 4 events columns
//
// Phases with registration_type = NONE are not synchronized to event_phases
// (they are display-only for the public website).
func (s *timelineSynchronizer) SyncAll(ctx context.Context) error {
	// 1. Get active event ID
	var eventID string
	err := s.db.GetContext(ctx, &eventID,
		`SELECT id FROM events WHERE is_default_active = true AND deleted_at IS NULL LIMIT 1`)
	if err != nil {
		// No active event — nothing to sync
		s.logger.Debug("Timeline sync skipped: no active event")
		return nil
	}

	// 2. Fetch all published website_timeline_phases
	type phase struct {
		StartDate        string `db:"start_date"`
		EndDate          string `db:"end_date"`
		RegistrationType string `db:"registration_type"`
	}
	var phases []phase
	err = s.db.SelectContext(ctx, &phases, `
		SELECT start_date::text, end_date::text, registration_type
		FROM website_timeline_phases
		WHERE deleted_at IS NULL AND is_published = true
		ORDER BY display_order ASC
	`)
	if err != nil {
		s.logger.Error("Timeline sync: failed to fetch phases", zap.Error(err))
		return err
	}

	// 3. Begin transaction for derived writes
	tx, err := s.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Track which operational dates we find
	var regOpen, regClose *string
	var candOpen, candClose *string

	for _, p := range phases {
		startDate := p.StartDate
		endDate := p.EndDate

		switch p.RegistrationType {
		case "PARTICIPANT":
			// Sync to event_phases.REGISTRATION
			_, err = tx.ExecContext(ctx, `
				INSERT INTO event_phases (id, event_id, phase, start_at, end_at, updated_at)
				VALUES (gen_random_uuid(), $1, 'REGISTRATION', $2::timestamptz, $3::timestamptz, NOW())
				ON CONFLICT (event_id, phase) DO UPDATE SET start_at = $2::timestamptz, end_at = $3::timestamptz, updated_at = NOW()
			`, eventID, startDate, endDate)
			if err != nil {
				s.logger.Error("Timeline sync: failed to upsert REGISTRATION phase", zap.Error(err))
				return err
			}
			regOpen = &startDate
			regClose = &endDate

		case "CANDIDATE":
			// Sync to event_phases.CANDIDATE_REGISTRATION
			_, err = tx.ExecContext(ctx, `
				INSERT INTO event_phases (id, event_id, phase, start_at, end_at, updated_at)
				VALUES (gen_random_uuid(), $1, 'CANDIDATE_REGISTRATION', $2::timestamptz, $3::timestamptz, NOW())
				ON CONFLICT (event_id, phase) DO UPDATE SET start_at = $2::timestamptz, end_at = $3::timestamptz, updated_at = NOW()
			`, eventID, startDate, endDate)
			if err != nil {
				s.logger.Error("Timeline sync: failed to upsert CANDIDATE_REGISTRATION phase", zap.Error(err))
				return err
			}
			candOpen = &startDate
			candClose = &endDate

		case "BOTH":
			// Sync both REGISTRATION and CANDIDATE_REGISTRATION
			_, err = tx.ExecContext(ctx, `
				INSERT INTO event_phases (id, event_id, phase, start_at, end_at, updated_at)
				VALUES (gen_random_uuid(), $1, 'REGISTRATION', $2::timestamptz, $3::timestamptz, NOW())
				ON CONFLICT (event_id, phase) DO UPDATE SET start_at = $2::timestamptz, end_at = $3::timestamptz, updated_at = NOW()
			`, eventID, startDate, endDate)
			if err != nil {
				s.logger.Error("Timeline sync: failed to upsert REGISTRATION phase (BOTH)", zap.Error(err))
				return err
			}
			_, err = tx.ExecContext(ctx, `
				INSERT INTO event_phases (id, event_id, phase, start_at, end_at, updated_at)
				VALUES (gen_random_uuid(), $1, 'CANDIDATE_REGISTRATION', $2::timestamptz, $3::timestamptz, NOW())
				ON CONFLICT (event_id, phase) DO UPDATE SET start_at = $2::timestamptz, end_at = $3::timestamptz, updated_at = NOW()
			`, eventID, startDate, endDate)
			if err != nil {
				s.logger.Error("Timeline sync: failed to upsert CANDIDATE_REGISTRATION phase (BOTH)", zap.Error(err))
				return err
			}
			regOpen = &startDate
			regClose = &endDate
			candOpen = &startDate
			candClose = &endDate
		}
	}

	// 4. Sync events.registration_open/close columns
	_, err = tx.ExecContext(ctx, `
		UPDATE events SET
			registration_open = $1::timestamptz,
			registration_close = $2::timestamptz,
			candidate_registration_open = $3::timestamptz,
			candidate_registration_close = $4::timestamptz,
			updated_at = NOW()
		WHERE id = $5
	`, regOpen, regClose, candOpen, candClose, eventID)
	if err != nil {
		s.logger.Error("Timeline sync: failed to update events columns", zap.Error(err))
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	s.logger.Info("Timeline sync completed",
		zap.String("event_id", eventID),
		zap.Int("phases_processed", len(phases)),
	)
	return nil
}

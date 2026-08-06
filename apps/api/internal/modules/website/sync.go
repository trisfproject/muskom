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
//
// Synchronization is TRANSACTIONAL. If it fails, the entire CMS write is
// rolled back. The administrator receives an error and must retry.
type TimelineSynchronizer interface {
	// SyncWithinTx executes synchronization inside the provided transaction.
	// It reads the current state of website_timeline_phases, maps operational
	// phases to event_phases, and updates events.registration_open/close.
	// On delete, it also nullifies stale derived data.
	SyncWithinTx(ctx context.Context, tx *sqlx.Tx) error
}

type timelineSynchronizer struct {
	db     *sqlx.DB
	logger *zap.Logger
}

func NewTimelineSynchronizer(db *sqlx.DB, logger *zap.Logger) TimelineSynchronizer {
	return &timelineSynchronizer{db: db, logger: logger}
}

// SyncWithinTx reads all published website_timeline_phases within the given
// transaction, maps them to event_phases entries and events columns.
//
// Mapping:
//
//	registration_type = PARTICIPANT → event_phases.REGISTRATION + events.registration_open/close
//	registration_type = CANDIDATE  → event_phases.CANDIDATE_REGISTRATION + events.candidate_registration_open/close
//	registration_type = BOTH       → both phases + all 4 events columns
//
// Delete behavior:
//
//	If no published phase has registration_type PARTICIPANT, then:
//	  - event_phases.REGISTRATION is nullified (start_at = NULL, end_at = NULL)
//	  - events.registration_open/close are set to NULL
//	Same logic for CANDIDATE.
func (s *timelineSynchronizer) SyncWithinTx(ctx context.Context, tx *sqlx.Tx) error {
	// 1. Get active event ID
	var eventID string
	err := tx.GetContext(ctx, &eventID,
		`SELECT id FROM events WHERE is_default_active = true AND deleted_at IS NULL LIMIT 1`)
	if err != nil {
		// No active event — nothing to sync, not an error
		s.logger.Debug("Timeline sync skipped: no active event")
		return nil
	}

	// 2. Fetch all published website_timeline_phases (within the same tx for consistency)
	type phase struct {
		StartDate        string `db:"start_date"`
		EndDate          string `db:"end_date"`
		RegistrationType string `db:"registration_type"`
	}
	var phases []phase
	err = tx.SelectContext(ctx, &phases, `
		SELECT start_date::text, end_date::text, registration_type
		FROM website_timeline_phases
		WHERE deleted_at IS NULL AND is_published = true
		ORDER BY display_order ASC
	`)
	if err != nil {
		s.logger.Error("Timeline sync: failed to fetch phases", zap.Error(err))
		return err
	}

	// 3. Determine operational dates from current published phases
	var regOpen, regClose *string
	var candOpen, candClose *string

	for _, p := range phases {
		startDate := p.StartDate
		endDate := p.EndDate

		switch p.RegistrationType {
		case "PARTICIPANT":
			regOpen = &startDate
			regClose = &endDate
		case "CANDIDATE":
			candOpen = &startDate
			candClose = &endDate
		case "BOTH":
			regOpen = &startDate
			regClose = &endDate
			candOpen = &startDate
			candClose = &endDate
		}
	}

	// 4. Sync event_phases.REGISTRATION
	if regOpen != nil && regClose != nil {
		_, err = tx.ExecContext(ctx, `
			INSERT INTO event_phases (id, event_id, phase, start_at, end_at, updated_at)
			VALUES (gen_random_uuid(), $1, 'REGISTRATION', $2::timestamptz, $3::timestamptz, NOW())
			ON CONFLICT (event_id, phase) DO UPDATE SET start_at = $2::timestamptz, end_at = $3::timestamptz, updated_at = NOW()
		`, eventID, *regOpen, *regClose)
		if err != nil {
			s.logger.Error("Timeline sync: failed to upsert REGISTRATION phase", zap.Error(err))
			return err
		}
	} else {
		// No PARTICIPANT phase exists — nullify derived data
		_, err = tx.ExecContext(ctx, `
			UPDATE event_phases SET start_at = NULL, end_at = NULL, updated_at = NOW()
			WHERE event_id = $1 AND phase = 'REGISTRATION'
		`, eventID)
		if err != nil {
			s.logger.Error("Timeline sync: failed to nullify REGISTRATION phase", zap.Error(err))
			return err
		}
	}

	// 5. Sync event_phases.CANDIDATE_REGISTRATION
	if candOpen != nil && candClose != nil {
		_, err = tx.ExecContext(ctx, `
			INSERT INTO event_phases (id, event_id, phase, start_at, end_at, updated_at)
			VALUES (gen_random_uuid(), $1, 'CANDIDATE_REGISTRATION', $2::timestamptz, $3::timestamptz, NOW())
			ON CONFLICT (event_id, phase) DO UPDATE SET start_at = $2::timestamptz, end_at = $3::timestamptz, updated_at = NOW()
		`, eventID, *candOpen, *candClose)
		if err != nil {
			s.logger.Error("Timeline sync: failed to upsert CANDIDATE_REGISTRATION phase", zap.Error(err))
			return err
		}
	} else {
		// No CANDIDATE phase exists — nullify derived data
		_, err = tx.ExecContext(ctx, `
			UPDATE event_phases SET start_at = NULL, end_at = NULL, updated_at = NOW()
			WHERE event_id = $1 AND phase = 'CANDIDATE_REGISTRATION'
		`, eventID)
		if err != nil {
			s.logger.Error("Timeline sync: failed to nullify CANDIDATE_REGISTRATION phase", zap.Error(err))
			return err
		}
	}

	// 6. Sync events.registration_open/close columns (NULL if phase removed)
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

	s.logger.Info("Timeline sync completed",
		zap.String("event_id", eventID),
		zap.Int("phases_processed", len(phases)),
		zap.Bool("has_registration", regOpen != nil),
		zap.Bool("has_candidate", candOpen != nil),
	)
	return nil
}

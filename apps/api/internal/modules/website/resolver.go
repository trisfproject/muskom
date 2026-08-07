package website

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type PhaseResolver interface {
	GetCurrentPhase(ctx context.Context) (*WebsiteTimelinePhase, error)
	IsParticipantRegistrationOpen(ctx context.Context) (bool, error)
}

type phaseResolver struct {
	db *sqlx.DB
}

func NewPhaseResolver(db *sqlx.DB) PhaseResolver {
	return &phaseResolver{db: db}
}

func (r *phaseResolver) GetCurrentPhase(ctx context.Context) (*WebsiteTimelinePhase, error) {
	var phase WebsiteTimelinePhase
	// 1. Try explicit current_indicator
	err := r.db.GetContext(ctx, &phase, `SELECT * FROM website_timeline_phases WHERE current_indicator = true AND is_published = true AND deleted_at IS NULL LIMIT 1`)
	if err == nil {
		return &phase, nil
	} else if err != sql.ErrNoRows {
		return nil, err
	}

	// 2. Fallback to time-based active phase
	err = r.db.GetContext(ctx, &phase, `SELECT * FROM website_timeline_phases WHERE is_published = true AND deleted_at IS NULL AND NOW() >= start_date AND NOW() <= end_date ORDER BY display_order ASC LIMIT 1`)
	if err == nil {
		return &phase, nil
	} else if err != sql.ErrNoRows {
		return nil, err
	}

	return nil, nil // No active phase
}

func (r *phaseResolver) IsParticipantRegistrationOpen(ctx context.Context) (bool, error) {
	// 1. Check Website General Settings toggle
	var regEnabled bool
	err := r.db.GetContext(ctx, &regEnabled, `SELECT registration_enabled FROM website_general_settings LIMIT 1`)
	if err == nil && !regEnabled {
		return false, nil
	}

	// 2. Check active timeline phase
	phase, err := r.GetCurrentPhase(ctx)
	if err != nil {
		return false, err
	}
	if phase == nil {
		return false, nil
	}

	return phase.RegistrationType == "PARTICIPANT" || phase.RegistrationType == "BOTH", nil
}

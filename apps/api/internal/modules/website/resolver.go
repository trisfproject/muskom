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
	err := r.db.GetContext(ctx, &phase, `SELECT * FROM website_timeline_phases WHERE current_indicator = true AND deleted_at IS NULL LIMIT 1`)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No active phase
		}
		return nil, err
	}
	return &phase, nil
}

func (r *phaseResolver) IsParticipantRegistrationOpen(ctx context.Context) (bool, error) {
	phase, err := r.GetCurrentPhase(ctx)
	if err != nil {
		return false, err
	}
	if phase == nil {
		return false, nil
	}

	return phase.RegistrationType == "PARTICIPANT" || phase.RegistrationType == "BOTH", nil
}

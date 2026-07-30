package result

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

var (
	ErrEventNotFound = errors.New("event not found")
)

type Service interface {
	GetElectionResults(ctx context.Context, eventID uuid.UUID) (*ElectionResultResponse, error)
}

type service struct {
	repo Repository
	db   *sqlx.DB // Needed just to check if event exists, though normally we'd inject an event repo. We'll query it directly here per module isolation if no shared repo exists.
	log  *zap.Logger
}

func NewService(repo Repository, db *sqlx.DB, log *zap.Logger) Service {
	return &service{
		repo: repo,
		db:   db,
		log:  log,
	}
}

func (s *service) GetElectionResults(ctx context.Context, eventID uuid.UUID) (*ElectionResultResponse, error) {
	// Business Rule: Only count votes when Event exists.
	var exists int
	err := s.db.GetContext(ctx, &exists, `SELECT 1 FROM events WHERE id = $1`, eventID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrEventNotFound
		}
		s.log.Error("failed to check if event exists", zap.Error(err))
		return nil, err
	}

	res, err := s.repo.GetElectionResults(ctx, eventID)
	if err != nil {
		s.log.Error("failed to get election results", zap.Error(err), zap.String("event_id", eventID.String()))
		return nil, err
	}

	return res, nil
}

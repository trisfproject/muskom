package voting

import (
	"context"
	"errors"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
	"github.com/trisfproject/muskom/apps/api/platform/eventbus"
)

var (
	ErrSessionClosed    = errors.New("voting session is closed")
	ErrSessionNotRunning = errors.New("voting session is not running")
	ErrAlreadyVoted     = errors.New("participant has already voted")
	ErrNotCheckedIn     = errors.New("participant is not checked in")
)

type Service interface {
	GetSession(ctx context.Context, eventID string) (*VotingSession, error)
	OpenSession(ctx context.Context, eventID string) error
	PauseSession(ctx context.Context, eventID string) error
	ResumeSession(ctx context.Context, eventID string) error
	CloseSession(ctx context.Context, eventID string) error
	
	GetBallot(ctx context.Context, eventID string) (*Ballot, error)
	CastVote(ctx context.Context, eventID, registrationID, candidateID string) error
	GetSummary(ctx context.Context, eventID string) (*VoteSummary, error)
}

type service struct {
	db   *sqlx.DB
	repo Repository
	bus  eventbus.EventDispatcher
	log  *zap.Logger
}

func NewService(db *sqlx.DB, repo Repository, bus eventbus.EventDispatcher, log *zap.Logger) Service {
	return &service{db: db, repo: repo, bus: bus, log: log}
}

func (s *service) GetSession(ctx context.Context, eventID string) (*VotingSession, error) {
	return s.repo.GetSessionByEvent(ctx, eventID)
}

func (s *service) OpenSession(ctx context.Context, eventID string) error {
	err := s.repo.UpdateSessionStatus(ctx, eventID, SessionRunning)
	if err == nil {
		_ = s.bus.Publish(ctx, eventbus.NewEnvelope(eventID, eventbus.EventVotingStarted, nil))
	}
	return err
}

func (s *service) PauseSession(ctx context.Context, eventID string) error {
	return s.repo.UpdateSessionStatus(ctx, eventID, SessionPaused)
}

func (s *service) ResumeSession(ctx context.Context, eventID string) error {
	return s.repo.UpdateSessionStatus(ctx, eventID, SessionRunning)
}

func (s *service) CloseSession(ctx context.Context, eventID string) error {
	err := s.repo.UpdateSessionStatus(ctx, eventID, SessionClosed)
	if err == nil {
		_ = s.bus.Publish(ctx, eventbus.NewEnvelope(eventID, eventbus.EventVotingStopped, nil))
	}
	return err
}

func (s *service) GetBallot(ctx context.Context, eventID string) (*Ballot, error) {
	session, err := s.GetSession(ctx, eventID)
	if err != nil {
		return nil, err
	}
	if session.Status == SessionClosed {
		return nil, ErrSessionClosed
	}

	candidates, err := s.repo.GetBallotCandidates(ctx, eventID)
	if err != nil {
		return nil, err
	}

	return &Ballot{Candidates: candidates}, nil
}

func (s *service) CastVote(ctx context.Context, eventID, registrationID, candidateID string) error {
	session, err := s.GetSession(ctx, eventID)
	if err != nil {
		return err
	}
	if session.Status != SessionRunning {
		return ErrSessionNotRunning
	}

	hasVoted, err := s.repo.HasVoted(ctx, eventID, registrationID)
	if err != nil {
		return err
	}
	if hasVoted {
		return ErrAlreadyVoted
	}

	// Begin Transaction
	tx, err := s.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	vote := &Vote{
		EventID:        eventID,
		RegistrationID: registrationID,
		CandidateID:    candidateID,
	}

	err = s.repo.CastVote(ctx, tx, vote)
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	// Dispatch Domain Event
	_ = s.bus.Publish(ctx, eventbus.NewEnvelope(eventID, eventbus.EventVoteSubmitted, map[string]string{
		"registration_id": registrationID,
		"candidate_id":    candidateID,
	}))

	return nil
}

func (s *service) GetSummary(ctx context.Context, eventID string) (*VoteSummary, error) {
	totalCheckedIn, err := s.repo.GetTotalCheckedIn(ctx, eventID)
	if err != nil {
		return nil, err
	}

	results, err := s.repo.GetResults(ctx, eventID)
	if err != nil {
		return nil, err
	}

	totalVotesCast := 0
	for _, r := range results {
		totalVotesCast += r.TotalVotes
	}

	pct := 0.0
	if totalCheckedIn > 0 {
		pct = (float64(totalVotesCast) / float64(totalCheckedIn)) * 100
	}

	return &VoteSummary{
		TotalVoters:      totalCheckedIn,
		VotesCast:        totalVotesCast,
		ParticipationPct: pct,
		Results:          results,
	}, nil
}

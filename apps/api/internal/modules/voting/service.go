package voting

import (
	"context"
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/internal/modules/website"
	"github.com/trisfproject/muskom/apps/api/platform/eventbus"
	"go.uber.org/zap"
)

var (
	ErrSessionClosed     = errors.New("voting session is closed")
	ErrSessionNotRunning = errors.New("voting session is not running")
	ErrAlreadyVoted      = errors.New("participant has already voted")
	ErrNotCheckedIn      = errors.New("participant is not checked in")
)

type Service interface {
	GetBallot(ctx context.Context, eventID string) (*Ballot, error)
	CastVote(ctx context.Context, eventID, participantID, candidateID string) error
	GetSummary(ctx context.Context, eventID string) (*VoteSummary, error)
}

type service struct {
	db       *sqlx.DB
	repo     Repository
	bus      eventbus.EventDispatcher
	log      *zap.Logger
	resolver website.PhaseResolver
}

func NewService(db *sqlx.DB, repo Repository, bus eventbus.EventDispatcher, log *zap.Logger) Service {
	return &service{db: db, repo: repo, bus: bus, log: log, resolver: website.NewPhaseResolver(db)}
}

func (s *service) GetBallot(ctx context.Context, eventID string) (*Ballot, error) {
	phase, err := s.resolver.GetCurrentPhase(ctx)
	if err != nil || phase == nil || phase.Title != "VOTING" {
		return nil, ErrSessionClosed
	}

	candidates, err := s.repo.GetBallotCandidates(ctx, eventID)
	if err != nil {
		return nil, err
	}

	return &Ballot{Candidates: candidates}, nil
}

func (s *service) CastVote(ctx context.Context, eventID, participantID, candidateID string) error {
	phase, err := s.resolver.GetCurrentPhase(ctx)
	if err != nil || phase == nil || phase.Title != "VOTING" {
		return ErrSessionNotRunning
	}

	hasVoted, err := s.repo.HasVoted(ctx, eventID, participantID)
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
		EventID:       eventID,
		ParticipantID: participantID,
		CandidateID:   candidateID,
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
		"participant_id": participantID,
		"candidate_id":   candidateID,
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

package voting

import (
	"context"
	"errors"


	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/internal/modules/notification"
	"github.com/trisfproject/muskom/apps/api/internal/modules/website"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/eventbus"
	"go.uber.org/zap"
)


type Service interface {
	GetBallot(ctx context.Context, eventID string) (*Ballot, error)
	CastVote(ctx context.Context, eventID, participantID, candidateID string) error
	GetSummary(ctx context.Context, eventID string) (*VoteSummary, error)
	GetSession(ctx context.Context, eventID string) (*VotingSession, error)
	UpdateSessionStatus(ctx context.Context, eventID string, action string) (*VotingSession, error)
	CheckParticipantEligibilityByRegNumber(ctx context.Context, eventID, regNum string) (*ParticipantEligibility, error)

	BroadcastVotingInvitation(ctx context.Context, eventID string) error
	SendVotingReminder(ctx context.Context, eventID string) error
}

type service struct {
	db       *sqlx.DB
	repo     Repository
	bus      eventbus.EventDispatcher
	log      *zap.Logger
	resolver website.PhaseResolver
	notifSvc notification.Service
	cfg      *config.Config
}

func NewService(db *sqlx.DB, repo Repository, bus eventbus.EventDispatcher, log *zap.Logger, notifSvc notification.Service, cfg *config.Config) Service {
	return &service{db: db, repo: repo, bus: bus, log: log, resolver: website.NewPhaseResolver(db), notifSvc: notifSvc, cfg: cfg}
}

func (s *service) GetBallot(ctx context.Context, eventID string) (*Ballot, error) {
	status, err := s.repo.GetSessionStatus(ctx)
	if err != nil || status != SessionRunning {
		return nil, ErrSessionClosed
	}

	candidates, err := s.repo.GetBallotCandidates(ctx, eventID)
	if err != nil {
		return nil, err
	}

	for i := range candidates {
		if candidates[i].PhotoURL != "" {
			candidates[i].PhotoURL = s.cfg.StorageBaseURL + "/" + candidates[i].PhotoURL
		}
	}

	return &Ballot{Candidates: candidates}, nil
}

func (s *service) CastVote(ctx context.Context, eventID, participantID, candidateID string) error {
	status, err := s.repo.GetSessionStatus(ctx)
	if err != nil || status != SessionRunning {
		return ErrSessionNotRunning
	}

	eligible, err := s.repo.IsParticipantEligible(ctx, eventID, participantID)
	if err != nil {
		return err
	}
	if !eligible {
		return ErrParticipantNotEligible
	}

	hasVoted, err := s.repo.HasVoted(ctx, eventID, participantID)
	if err != nil {
		return err
	}
	if hasVoted {
		return ErrAlreadyVoted
	}

	validCandidate, err := s.repo.IsCandidateValid(ctx, candidateID)
	if err != nil {
		return err
	}
	if !validCandidate {
		return ErrCandidateInvalid
	}

	// Begin Transaction
	tx, err := s.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	err = s.repo.CastVote(ctx, tx, participantID, candidateID)
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	// Dispatch Domain Event
	_ = s.bus.Publish(ctx, eventbus.NewEnvelope(eventID, eventbus.EventVoteSubmitted, map[string]string{
		"participant_id": participantID,
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

func (s *service) GetSession(ctx context.Context, eventID string) (*VotingSession, error) {
	status, err := s.repo.GetSessionStatus(ctx)
	if err != nil {
		status = SessionNotStarted
	}

	return &VotingSession{
		ID:      "active-session",
		EventID: eventID,
		Status:  status,
	}, nil
}

func (s *service) UpdateSessionStatus(ctx context.Context, eventID string, action string) (*VotingSession, error) {
	currentStatus, err := s.repo.GetSessionStatus(ctx)
	if err != nil {
		currentStatus = SessionNotStarted
	}

	var status SessionStatus
	switch action {
	case "start":
		if currentStatus != SessionNotStarted {
			return nil, errors.New("cannot start session: session has already been started or closed")
		}
		status = SessionRunning
	case "pause":
		if currentStatus != SessionRunning {
			return nil, errors.New("cannot pause session: session is not running")
		}
		status = SessionPaused
	case "resume":
		if currentStatus != SessionPaused {
			return nil, errors.New("cannot resume session: session is not paused")
		}
		status = SessionRunning
	case "stop", "close":
		if currentStatus == SessionClosed || currentStatus == SessionNotStarted {
			return nil, errors.New("cannot close session: invalid current state")
		}
		status = SessionClosed
	default:
		return nil, errors.New("invalid action")
	}

	if err := s.repo.UpdateSessionStatus(ctx, status); err != nil {
		return nil, err
	}

	return &VotingSession{
		ID:      "active-session",
		EventID: eventID,
		Status:  status,
	}, nil
}

func (s *service) CheckParticipantEligibilityByRegNumber(ctx context.Context, eventID, regNum string) (*ParticipantEligibility, error) {
	participant, err := s.repo.GetParticipantByRegNumber(ctx, regNum)
	if err != nil {
		return nil, err
	}
	if participant == nil {
		return nil, errors.New("participant not found")
	}

	isEligible, err := s.repo.IsParticipantEligible(ctx, eventID, participant.ParticipantID)
	if err != nil {
		return nil, err
	}

	if !isEligible {
		participant.IsEligible = false
		participant.Reason = "Peserta belum check-in atau status belum diverifikasi"
		return participant, nil
	}

	hasVoted, err := s.repo.HasVoted(ctx, eventID, participant.ParticipantID)
	if err != nil {
		return nil, err
	}

	if hasVoted {
		participant.IsEligible = false
		participant.Reason = "Peserta sudah memberikan suara sebelumnya"
		return participant, nil
	}

	participant.IsEligible = true
	participant.Reason = "Peserta memenuhi syarat untuk memberikan suara"
	return participant, nil
}

func (s *service) BroadcastVotingInvitation(ctx context.Context, eventID string) error {
	emails, err := s.repo.GetVerifiedVoterEmails(ctx, eventID)
	if err != nil {
		return err
	}
	payload := map[string]interface{}{
		"event_name": "MUSKOM 2026",
		"voting_url": "/voting",
	}
	return s.notifSvc.Broadcast(ctx, notification.ChannelEmail, "voting_invitation", emails, payload)
}

func (s *service) SendVotingReminder(ctx context.Context, eventID string) error {
	emails, err := s.repo.GetUnvotedVerifiedVoterEmails(ctx, eventID)
	if err != nil {
		return err
	}
	payload := map[string]interface{}{
		"event_name": "MUSKOM 2026",
		"voting_url": "/voting",
	}
	return s.notifSvc.Broadcast(ctx, notification.ChannelEmail, "voting_reminder", emails, payload)
}

package voting

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type Service interface {
	SubmitVote(ctx context.Context, userID uuid.UUID, req *SubmitVoteRequest) error
	GetMyVoteStatus(ctx context.Context, userID, eventID uuid.UUID) (*MyVoteStatusResponse, error)
}

type service struct {
	repo Repository
	log  *zap.Logger
}

func NewService(repo Repository, log *zap.Logger) Service {
	return &service{
		repo: repo,
		log:  log,
	}
}

func (s *service) SubmitVote(ctx context.Context, userID uuid.UUID, req *SubmitVoteRequest) error {
	s.log.Info("processing vote submission", zap.String("user_id", userID.String()), zap.String("event_id", req.EventID.String()))

	// 1. Get and validate registration
	regID, err := s.repo.GetParticipantRegistration(ctx, userID, req.EventID)
	if err != nil {
		s.log.Warn("failed to get participant registration", zap.Error(err))
		return ErrParticipantNotFound
	}

	// 2. Check Event Phase (must be VOTING and active)
	isVotingActive, err := s.repo.CheckEventPhase(ctx, req.EventID, "VOTING")
	if err != nil {
		s.log.Error("failed to check event phase", zap.Error(err))
		return err
	}
	if !isVotingActive {
		s.log.Warn("voting phase is not active", zap.String("event_id", req.EventID.String()))
		return ErrVotingClosed
	}

	// 3. Check Attendance
	hasCheckedIn, err := s.repo.CheckAttendance(ctx, regID)
	if err != nil {
		s.log.Error("failed to check attendance", zap.Error(err))
		return err
	}
	if !hasCheckedIn {
		s.log.Warn("participant has not checked in", zap.String("registration_id", regID.String()))
		return ErrNotCheckedIn
	}

	// 4. Check Candidate Eligibility
	isCandidateEligible, err := s.repo.CheckCandidateEligibility(ctx, req.CandidateID, req.EventID)
	if err != nil {
		s.log.Error("failed to check candidate eligibility", zap.Error(err))
		return err
	}
	if !isCandidateEligible {
		s.log.Warn("invalid candidate for event", zap.String("candidate_id", req.CandidateID.String()), zap.String("event_id", req.EventID.String()))
		return ErrInvalidCandidate
	}

	// 5. Submit Vote
	metadata := fmt.Sprintf(`{"action":"cast_vote", "event_id":"%s"}`, req.EventID.String())
	err = s.repo.SubmitVote(ctx, req.EventID, regID, req.CandidateID, metadata)
	if err != nil {
		if strings.Contains(err.Error(), "uq_votes_event_registration") || strings.Contains(err.Error(), "23505") {
			s.log.Warn("duplicate vote attempt detected", zap.String("registration_id", regID.String()))
			return ErrAlreadyVoted
		}
		s.log.Error("failed to submit vote", zap.Error(err))
		return err
	}

	s.log.Info("vote submitted successfully", zap.String("registration_id", regID.String()))
	return nil
}

func (s *service) GetMyVoteStatus(ctx context.Context, userID, eventID uuid.UUID) (*MyVoteStatusResponse, error) {
	regID, err := s.repo.GetParticipantRegistration(ctx, userID, eventID)
	if err != nil {
		if err == ErrParticipantNotFound {
			return &MyVoteStatusResponse{
				EventID:  eventID,
				HasVoted: false,
			}, nil
		}
		return nil, err
	}

	return s.repo.GetMyVoteStatus(ctx, regID, eventID)
}

package voting

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

// Service defines the voting service interface
type Service interface {
	SubmitVote(ctx context.Context, userID uuid.UUID, req *SubmitVoteRequest) error
	GetMyVoteStatus(ctx context.Context, userID, eventID uuid.UUID) (*MyVoteStatusResponse, error)

	// Admin Methods
	AdminListVotes(ctx context.Context, req AdminListVotesRequest) (*AdminListVotesResponse, error)
	AdminGetVote(ctx context.Context, id uuid.UUID) (*AdminVoteResponse, error)
	AdminGetVoteStatistics(ctx context.Context, eventID uuid.UUID) (*AdminVoteStatisticsResponse, error)
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

func (s *service) AdminListVotes(ctx context.Context, req AdminListVotesRequest) (*AdminListVotesResponse, error) {
	if req.Limit <= 0 {
		req.Limit = 10
	}
	if req.Page <= 0 {
		req.Page = 1
	}

	votes, total, err := s.repo.AdminListVotes(ctx, req)
	if err != nil {
		s.log.Error("failed to get admin vote list", zap.Error(err))
		return nil, err
	}

	totalPages := total / req.Limit
	if total%req.Limit != 0 {
		totalPages++
	}

	return &AdminListVotesResponse{
		Data:       votes,
		Total:      total,
		Page:       req.Page,
		Limit:      req.Limit,
		TotalPages: totalPages,
	}, nil
}

func (s *service) AdminGetVote(ctx context.Context, id uuid.UUID) (*AdminVoteResponse, error) {
	vote, err := s.repo.AdminGetVote(ctx, id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return nil, ErrVoteNotFound
		}
		s.log.Error("failed to get vote details", zap.Error(err), zap.String("vote_id", id.String()))
		return nil, err
	}
	return vote, nil
}

func (s *service) AdminGetVoteStatistics(ctx context.Context, eventID uuid.UUID) (*AdminVoteStatisticsResponse, error) {
	stats, err := s.repo.AdminGetVoteStatistics(ctx, eventID)
	if err != nil {
		s.log.Error("failed to get vote statistics", zap.Error(err), zap.String("event_id", eventID.String()))
		return nil, err
	}
	return stats, nil
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

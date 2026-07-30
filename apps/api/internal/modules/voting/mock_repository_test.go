package voting

import (
	"context"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
)

type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) GetParticipantRegistration(ctx context.Context, userID, eventID uuid.UUID) (uuid.UUID, error) {
	args := m.Called(ctx, userID, eventID)
	return args.Get(0).(uuid.UUID), args.Error(1)
}

func (m *MockRepository) CheckEventPhase(ctx context.Context, eventID uuid.UUID, phase string) (bool, error) {
	args := m.Called(ctx, eventID, phase)
	return args.Bool(0), args.Error(1)
}

func (m *MockRepository) CheckAttendance(ctx context.Context, registrationID uuid.UUID) (bool, error) {
	args := m.Called(ctx, registrationID)
	return args.Bool(0), args.Error(1)
}

func (m *MockRepository) CheckCandidateEligibility(ctx context.Context, candidateID, eventID uuid.UUID) (bool, error) {
	args := m.Called(ctx, candidateID, eventID)
	return args.Bool(0), args.Error(1)
}

func (m *MockRepository) GetMyVoteStatus(ctx context.Context, registrationID, eventID uuid.UUID) (*MyVoteStatusResponse, error) {
	args := m.Called(ctx, registrationID, eventID)
	if args.Get(0) != nil {
		return args.Get(0).(*MyVoteStatusResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) SubmitVote(ctx context.Context, eventID, registrationID, candidateID uuid.UUID, metadata string) error {
	args := m.Called(ctx, eventID, registrationID, candidateID, metadata)
	return args.Error(0)
}

func (m *MockRepository) AdminListVotes(ctx context.Context, req AdminListVotesRequest) ([]AdminVoteResponse, int, error) {
	args := m.Called(ctx, req)
	if args.Get(0) != nil {
		return args.Get(0).([]AdminVoteResponse), args.Int(1), args.Error(2)
	}
	return nil, 0, args.Error(2)
}

func (m *MockRepository) AdminGetVote(ctx context.Context, id uuid.UUID) (*AdminVoteResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*AdminVoteResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) AdminGetVoteStatistics(ctx context.Context, eventID uuid.UUID) (*AdminVoteStatisticsResponse, error) {
	args := m.Called(ctx, eventID)
	if args.Get(0) != nil {
		return args.Get(0).(*AdminVoteStatisticsResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

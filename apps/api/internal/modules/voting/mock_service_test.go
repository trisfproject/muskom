package voting

import (
	"context"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
)

type MockService struct {
	mock.Mock
}

func (m *MockService) SubmitVote(ctx context.Context, userID uuid.UUID, req *SubmitVoteRequest) error {
	args := m.Called(ctx, userID, req)
	return args.Error(0)
}

func (m *MockService) GetMyVoteStatus(ctx context.Context, userID, eventID uuid.UUID) (*MyVoteStatusResponse, error) {
	args := m.Called(ctx, userID, eventID)
	if args.Get(0) != nil {
		return args.Get(0).(*MyVoteStatusResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) AdminListVotes(ctx context.Context, req AdminListVotesRequest) (*AdminListVotesResponse, error) {
	args := m.Called(ctx, req)
	if args.Get(0) != nil {
		return args.Get(0).(*AdminListVotesResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) AdminGetVote(ctx context.Context, id uuid.UUID) (*AdminVoteResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*AdminVoteResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) AdminGetVoteStatistics(ctx context.Context, eventID uuid.UUID) (*AdminVoteStatisticsResponse, error) {
	args := m.Called(ctx, eventID)
	if args.Get(0) != nil {
		return args.Get(0).(*AdminVoteStatisticsResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

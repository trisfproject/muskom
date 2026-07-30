package voting

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

func TestService_AdminListVotes(t *testing.T) {
	mockRepo := new(MockRepository)
	logger, _ := zap.NewDevelopment()
	svc := NewService(mockRepo, logger)

	ctx := context.Background()
	req := AdminListVotesRequest{
		Page:  1,
		Limit: 10,
	}

	expectedVotes := []AdminVoteResponse{
		{
			ID:              uuid.New(),
			EventID:         uuid.New(),
			ParticipantName: "John Doe",
			CandidateName:   "Jane Doe",
			CreatedAt:       time.Now(),
		},
	}

	mockRepo.On("AdminListVotes", ctx, req).Return(expectedVotes, 1, nil)

	res, err := svc.AdminListVotes(ctx, req)
	assert.NoError(t, err)
	assert.NotNil(t, res)
	assert.Equal(t, 1, res.Total)
	assert.Equal(t, 1, res.TotalPages)
	assert.Len(t, res.Data, 1)

	mockRepo.AssertExpectations(t)
}

func TestService_AdminGetVote(t *testing.T) {
	mockRepo := new(MockRepository)
	logger, _ := zap.NewDevelopment()
	svc := NewService(mockRepo, logger)

	ctx := context.Background()
	voteID := uuid.New()

	expectedVote := &AdminVoteResponse{
		ID:              voteID,
		EventID:         uuid.New(),
		ParticipantName: "John Doe",
		CandidateName:   "Jane Doe",
		CreatedAt:       time.Now(),
	}

	mockRepo.On("AdminGetVote", ctx, voteID).Return(expectedVote, nil)

	res, err := svc.AdminGetVote(ctx, voteID)
	assert.NoError(t, err)
	assert.NotNil(t, res)
	assert.Equal(t, voteID, res.ID)

	mockRepo.AssertExpectations(t)
}

func TestService_AdminGetVote_NotFound(t *testing.T) {
	mockRepo := new(MockRepository)
	logger, _ := zap.NewDevelopment()
	svc := NewService(mockRepo, logger)

	ctx := context.Background()
	voteID := uuid.New()

	mockRepo.On("AdminGetVote", ctx, voteID).Return(nil, errors.New("vote not found"))

	res, err := svc.AdminGetVote(ctx, voteID)
	assert.Error(t, err)
	assert.Nil(t, res)
	assert.Equal(t, ErrVoteNotFound, err)

	mockRepo.AssertExpectations(t)
}

func TestService_AdminGetVoteStatistics(t *testing.T) {
	mockRepo := new(MockRepository)
	logger, _ := zap.NewDevelopment()
	svc := NewService(mockRepo, logger)

	ctx := context.Background()
	eventID := uuid.New()

	expectedStats := &AdminVoteStatisticsResponse{
		EventID:    eventID,
		TotalVotes: 10,
		Candidates: []CandidateStatistic{
			{
				CandidateID:   uuid.New(),
				CandidateName: "Candidate A",
				VoteCount:     6,
				Percentage:    60.0,
			},
			{
				CandidateID:   uuid.New(),
				CandidateName: "Candidate B",
				VoteCount:     4,
				Percentage:    40.0,
			},
		},
	}

	mockRepo.On("AdminGetVoteStatistics", ctx, eventID).Return(expectedStats, nil)

	res, err := svc.AdminGetVoteStatistics(ctx, eventID)
	assert.NoError(t, err)
	assert.NotNil(t, res)
	assert.Equal(t, 10, res.TotalVotes)
	assert.Len(t, res.Candidates, 2)
	assert.Equal(t, 60.0, res.Candidates[0].Percentage)

	mockRepo.AssertExpectations(t)
}

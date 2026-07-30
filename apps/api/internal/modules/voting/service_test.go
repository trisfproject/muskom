package voting

import (
	"context"
	"errors"
	"sync"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.uber.org/zap"
)

func TestService_SubmitVote_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	logger, _ := zap.NewDevelopment()
	svc := NewService(mockRepo, logger)

	ctx := context.Background()
	userID := uuid.New()
	eventID := uuid.New()
	regID := uuid.New()
	candidateID := uuid.New()
	req := &SubmitVoteRequest{
		EventID:     eventID,
		CandidateID: candidateID,
	}

	mockRepo.On("GetParticipantRegistration", ctx, userID, eventID).Return(regID, nil)
	mockRepo.On("CheckEventPhase", ctx, eventID, "VOTING").Return(true, nil)
	mockRepo.On("CheckAttendance", ctx, regID).Return(true, nil)
	mockRepo.On("CheckCandidateEligibility", ctx, candidateID, eventID).Return(true, nil)
	mockRepo.On("SubmitVote", ctx, eventID, regID, candidateID, mock.Anything).Return(nil)

	err := svc.SubmitVote(ctx, userID, req)
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestService_SubmitVote_InvalidPhase(t *testing.T) {
	mockRepo := new(MockRepository)
	logger, _ := zap.NewDevelopment()
	svc := NewService(mockRepo, logger)

	ctx := context.Background()
	userID := uuid.New()
	eventID := uuid.New()
	regID := uuid.New()
	candidateID := uuid.New()
	req := &SubmitVoteRequest{
		EventID:     eventID,
		CandidateID: candidateID,
	}

	mockRepo.On("GetParticipantRegistration", ctx, userID, eventID).Return(regID, nil)
	mockRepo.On("CheckEventPhase", ctx, eventID, "VOTING").Return(false, nil)

	err := svc.SubmitVote(ctx, userID, req)
	assert.Error(t, err)
	assert.Equal(t, ErrVotingClosed, err)
	mockRepo.AssertExpectations(t)
}

func TestService_SubmitVote_NotCheckedIn(t *testing.T) {
	mockRepo := new(MockRepository)
	logger, _ := zap.NewDevelopment()
	svc := NewService(mockRepo, logger)

	ctx := context.Background()
	userID := uuid.New()
	eventID := uuid.New()
	regID := uuid.New()
	candidateID := uuid.New()
	req := &SubmitVoteRequest{
		EventID:     eventID,
		CandidateID: candidateID,
	}

	mockRepo.On("GetParticipantRegistration", ctx, userID, eventID).Return(regID, nil)
	mockRepo.On("CheckEventPhase", ctx, eventID, "VOTING").Return(true, nil)
	mockRepo.On("CheckAttendance", ctx, regID).Return(false, nil)

	err := svc.SubmitVote(ctx, userID, req)
	assert.Error(t, err)
	assert.Equal(t, ErrNotCheckedIn, err)
	mockRepo.AssertExpectations(t)
}

func TestService_SubmitVote_InvalidCandidate(t *testing.T) {
	mockRepo := new(MockRepository)
	logger, _ := zap.NewDevelopment()
	svc := NewService(mockRepo, logger)

	ctx := context.Background()
	userID := uuid.New()
	eventID := uuid.New()
	regID := uuid.New()
	candidateID := uuid.New()
	req := &SubmitVoteRequest{
		EventID:     eventID,
		CandidateID: candidateID,
	}

	mockRepo.On("GetParticipantRegistration", ctx, userID, eventID).Return(regID, nil)
	mockRepo.On("CheckEventPhase", ctx, eventID, "VOTING").Return(true, nil)
	mockRepo.On("CheckAttendance", ctx, regID).Return(true, nil)
	mockRepo.On("CheckCandidateEligibility", ctx, candidateID, eventID).Return(false, nil)

	err := svc.SubmitVote(ctx, userID, req)
	assert.Error(t, err)
	assert.Equal(t, ErrInvalidCandidate, err)
	mockRepo.AssertExpectations(t)
}

func TestService_SubmitVote_DuplicateVote(t *testing.T) {
	mockRepo := new(MockRepository)
	logger, _ := zap.NewDevelopment()
	svc := NewService(mockRepo, logger)

	ctx := context.Background()
	userID := uuid.New()
	eventID := uuid.New()
	regID := uuid.New()
	candidateID := uuid.New()
	req := &SubmitVoteRequest{
		EventID:     eventID,
		CandidateID: candidateID,
	}

	mockRepo.On("GetParticipantRegistration", ctx, userID, eventID).Return(regID, nil)
	mockRepo.On("CheckEventPhase", ctx, eventID, "VOTING").Return(true, nil)
	mockRepo.On("CheckAttendance", ctx, regID).Return(true, nil)
	mockRepo.On("CheckCandidateEligibility", ctx, candidateID, eventID).Return(true, nil)

	// Simulate unique constraint violation error from database
	mockRepo.On("SubmitVote", ctx, eventID, regID, candidateID, mock.Anything).Return(errors.New("uq_votes_event_registration violates unique constraint"))

	err := svc.SubmitVote(ctx, userID, req)
	assert.Error(t, err)
	assert.Equal(t, ErrAlreadyVoted, err)
	mockRepo.AssertExpectations(t)
}

func TestService_SubmitVote_ConcurrentAttempts(t *testing.T) {
	// Optimistic handling of concurrent vote requests
	// Two goroutines attempt to vote exactly at the same time.
	// One will succeed, the other will hit the unique constraint error from the DB (simulated via mock).

	mockRepo := new(MockRepository)
	logger, _ := zap.NewDevelopment()
	svc := NewService(mockRepo, logger)

	ctx := context.Background()
	userID := uuid.New()
	eventID := uuid.New()
	regID := uuid.New()
	candidateID := uuid.New()
	req := &SubmitVoteRequest{
		EventID:     eventID,
		CandidateID: candidateID,
	}

	// We'll mock the calls such that it can handle two concurrent calls
	mockRepo.On("GetParticipantRegistration", ctx, userID, eventID).Return(regID, nil).Twice()
	mockRepo.On("CheckEventPhase", ctx, eventID, "VOTING").Return(true, nil).Twice()
	mockRepo.On("CheckAttendance", ctx, regID).Return(true, nil).Twice()
	mockRepo.On("CheckCandidateEligibility", ctx, candidateID, eventID).Return(true, nil).Twice()

	// The first submit will return nil (success), the second will return a unique constraint error.
	mockRepo.On("SubmitVote", ctx, eventID, regID, candidateID, mock.Anything).Return(nil).Once()
	mockRepo.On("SubmitVote", ctx, eventID, regID, candidateID, mock.Anything).Return(errors.New("ERROR: duplicate key value violates unique constraint \"uq_votes_event_registration\" (SQLSTATE 23505)")).Once()

	var wg sync.WaitGroup
	errs := make(chan error, 2)

	wg.Add(2)
	go func() {
		defer wg.Done()
		errs <- svc.SubmitVote(ctx, userID, req)
	}()
	go func() {
		defer wg.Done()
		errs <- svc.SubmitVote(ctx, userID, req)
	}()

	wg.Wait()
	close(errs)

	var successCount int
	var duplicateCount int

	for err := range errs {
		if err == nil {
			successCount++
		} else if err == ErrAlreadyVoted {
			duplicateCount++
		}
	}

	assert.Equal(t, 1, successCount, "Exactly one vote should succeed")
	assert.Equal(t, 1, duplicateCount, "Exactly one vote should be rejected as duplicate")
	mockRepo.AssertExpectations(t)
}

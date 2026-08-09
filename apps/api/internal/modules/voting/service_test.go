package voting

import (
	"context"
	"testing"

	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.uber.org/zap"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/eventbus"
)

// MockRepository is a mock implementation of Repository
type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) HasVoted(ctx context.Context, eventID, participantID string) (bool, error) {
	args := m.Called(ctx, eventID, participantID)
	return args.Bool(0), args.Error(1)
}

func (m *MockRepository) CastVote(ctx context.Context, tx *sqlx.Tx, vote *Vote) error {
	args := m.Called(ctx, tx, vote)
	return args.Error(0)
}

func (m *MockRepository) GetBallotCandidates(ctx context.Context, eventID string) ([]CandidateSnapshot, error) {
	args := m.Called(ctx, eventID)
	return args.Get(0).([]CandidateSnapshot), args.Error(1)
}

func (m *MockRepository) GetResults(ctx context.Context, eventID string) ([]VoteResult, error) {
	args := m.Called(ctx, eventID)
	return args.Get(0).([]VoteResult), args.Error(1)
}

func (m *MockRepository) GetTotalCheckedIn(ctx context.Context, eventID string) (int, error) {
	args := m.Called(ctx, eventID)
	return args.Int(0), args.Error(1)
}

func (m *MockRepository) GetVerifiedVoterEmails(ctx context.Context, eventID string) ([]string, error) {
	args := m.Called(ctx, eventID)
	return args.Get(0).([]string), args.Error(1)
}

func (m *MockRepository) GetUnvotedVerifiedVoterEmails(ctx context.Context, eventID string) ([]string, error) {
	args := m.Called(ctx, eventID)
	return args.Get(0).([]string), args.Error(1)
}

func (m *MockRepository) IsParticipantEligible(ctx context.Context, eventID, participantID string) (bool, error) {
	args := m.Called(ctx, eventID, participantID)
	return args.Bool(0), args.Error(1)
}

func (m *MockRepository) GetParticipantByRegNumber(ctx context.Context, regNum string) (*ParticipantEligibility, error) {
	args := m.Called(ctx, regNum)
	var res *ParticipantEligibility
	if args.Get(0) != nil {
		res = args.Get(0).(*ParticipantEligibility)
	}
	return res, args.Error(1)
}

func (m *MockRepository) UpdateSessionStatus(ctx context.Context, status SessionStatus) error {
	args := m.Called(ctx, status)
	return args.Error(0)
}

func (m *MockRepository) GetSessionStatus(ctx context.Context) (SessionStatus, error) {
	args := m.Called(ctx)
	return args.Get(0).(SessionStatus), args.Error(1)
}

// MockEventDispatcher is a mock implementation of eventbus.EventDispatcher
type MockEventDispatcher struct {
	mock.Mock
}

func (m *MockEventDispatcher) Publish(ctx context.Context, envelope *eventbus.EventEnvelope) error {
	args := m.Called(ctx, envelope)
	return args.Error(0)
}

func (m *MockEventDispatcher) Subscribe(eventType eventbus.EventType, handler eventbus.EventHandler) {
	m.Called(eventType, handler)
}

func TestService_CastVote_EligibilityAndDuplicate(t *testing.T) {
	db, dbMock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "sqlmock")
	repo := new(MockRepository)
	bus := new(MockEventDispatcher)
	log := zap.NewNop()

	// Initialize service with mocked DB (for PhaseResolver and Transactions) and mocked Repo
	svc := NewService(sqlxDB, repo, bus, log, nil, &config.Config{})

	ctx := context.Background()
	eventID := "evt-1"
	participantID := "part-1"
	candidateID := "cand-1"

	// Removed PhaseResolver query mock
	t.Run("Eligible participant can vote", func(t *testing.T) {
		// Mock SessionStatus
		repo.On("GetSessionStatus", ctx).Return(SessionRunning, nil).Once()
		
		// Mock Eligibility
		repo.On("IsParticipantEligible", ctx, eventID, participantID).Return(true, nil).Once()
		
		// Mock HasVoted
		repo.On("HasVoted", ctx, eventID, participantID).Return(false, nil).Once()
		
		// Mock DB Transaction
		dbMock.ExpectBegin()
		repo.On("CastVote", ctx, mock.AnythingOfType("*sqlx.Tx"), mock.AnythingOfType("*voting.Vote")).Return(nil).Once()
		dbMock.ExpectCommit()
		
		// Mock EventBus Publish
		bus.On("Publish", ctx, mock.AnythingOfType("*eventbus.EventEnvelope")).Return(nil).Once()

		err := svc.CastVote(ctx, eventID, participantID, candidateID)
		assert.NoError(t, err)
		repo.AssertExpectations(t)
		bus.AssertExpectations(t)
	})

	t.Run("Ineligible participant is rejected", func(t *testing.T) {
		// Mock SessionStatus
		repo.On("GetSessionStatus", ctx).Return(SessionRunning, nil).Once()

		
		// Mock Eligibility
		repo.On("IsParticipantEligible", ctx, eventID, participantID).Return(false, nil).Once() // Ineligible!

		err := svc.CastVote(ctx, eventID, participantID, candidateID)
		assert.ErrorIs(t, err, ErrParticipantNotEligible)
		repo.AssertExpectations(t)
	})

	t.Run("Double vote is rejected", func(t *testing.T) {
		// Mock SessionStatus
		repo.On("GetSessionStatus", ctx).Return(SessionRunning, nil).Once()
		
		// Mock Eligibility
		repo.On("IsParticipantEligible", ctx, eventID, participantID).Return(true, nil).Once()
		
		// Mock HasVoted
		repo.On("HasVoted", ctx, eventID, participantID).Return(true, nil).Once() // Already Voted!

		err := svc.CastVote(ctx, eventID, participantID, candidateID)
		assert.ErrorIs(t, err, ErrAlreadyVoted)
		repo.AssertExpectations(t)
	})
}

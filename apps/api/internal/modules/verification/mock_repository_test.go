package verification

import (
	"context"

	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/mock"
)

type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) GetVerifications(ctx context.Context, filter VerificationListRequest) ([]VerificationItemResponse, int, error) {
	args := m.Called(ctx, filter)
	if args.Get(0) != nil {
		return args.Get(0).([]VerificationItemResponse), args.Int(1), args.Error(2)
	}
	return nil, args.Int(1), args.Error(2)
}

func (m *MockRepository) GetVerificationSummary(ctx context.Context) (*VerificationSummaryResponse, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).(*VerificationSummaryResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) GetParticipantDetail(ctx context.Context, registrationID string) (*ParticipantDetailResponse, error) {
	args := m.Called(ctx, registrationID)
	if args.Get(0) != nil {
		return args.Get(0).(*ParticipantDetailResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) BeginTx(ctx context.Context) (*sqlx.Tx, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).(*sqlx.Tx), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) LogAudit(ctx context.Context, tx *sqlx.Tx, module, action, entity, entityID string, metadata string) error {
	args := m.Called(ctx, tx, module, action, entity, entityID, metadata)
	return args.Error(0)
}

func (m *MockRepository) UpdateParticipantStatus(ctx context.Context, tx *sqlx.Tx, registrationID string, status string, verifierID string, rejectionReason *string, regNumber *string) error {
	args := m.Called(ctx, tx, registrationID, status, verifierID, rejectionReason, regNumber)
	return args.Error(0)
}

func (m *MockRepository) GetCandidateDetail(ctx context.Context, candidateID string) (*CandidateDetailResponse, error) {
	args := m.Called(ctx, candidateID)
	if args.Get(0) != nil {
		return args.Get(0).(*CandidateDetailResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) GetParticipantLimitAndLockTx(ctx context.Context, tx *sqlx.Tx) (int, error) {
	args := m.Called(ctx, tx)
	return args.Int(0), args.Error(1)
}

func (m *MockRepository) CountVerifiedInTx(ctx context.Context, tx *sqlx.Tx) (int, error) {
	args := m.Called(ctx, tx)
	return args.Int(0), args.Error(1)
}

func (m *MockRepository) UpdateCandidateStatus(ctx context.Context, tx *sqlx.Tx, candidateID string, status string, verifierID string) error {
	args := m.Called(ctx, tx, candidateID, status, verifierID)
	return args.Error(0)
}

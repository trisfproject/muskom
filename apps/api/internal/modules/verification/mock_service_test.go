package verification

import (
	"context"

	"github.com/stretchr/testify/mock"
)

type MockService struct {
	mock.Mock
}

func (m *MockService) ListVerifications(ctx context.Context, filter VerificationListRequest) ([]VerificationItemResponse, int, error) {
	args := m.Called(ctx, filter)
	if args.Get(0) != nil {
		return args.Get(0).([]VerificationItemResponse), args.Int(1), args.Error(2)
	}
	return nil, args.Int(1), args.Error(2)
}

func (m *MockService) GetSummary(ctx context.Context) (*VerificationSummaryResponse, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).(*VerificationSummaryResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) GetParticipantVerification(ctx context.Context, id string) (*ParticipantDetailResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*ParticipantDetailResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) VerifyParticipant(ctx context.Context, id string, req *VerifyParticipantRequest, verifierID string) error {
	args := m.Called(ctx, id, req, verifierID)
	return args.Error(0)
}

func (m *MockService) GetCandidateVerification(ctx context.Context, id string) (*CandidateDetailResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*CandidateDetailResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) VerifyCandidate(ctx context.Context, id string, req *VerifyCandidateRequest, verifierID string) error {
	args := m.Called(ctx, id, req, verifierID)
	return args.Error(0)
}

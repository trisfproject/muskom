package result

import (
	"context"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
)

type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) GetElectionResults(ctx context.Context, eventID uuid.UUID) (*ElectionResultResponse, error) {
	args := m.Called(ctx, eventID)
	if args.Get(0) != nil {
		return args.Get(0).(*ElectionResultResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) GetElectionOverview(ctx context.Context, eventID uuid.UUID) (*ElectionOverviewResponse, error) {
	args := m.Called(ctx, eventID)
	if args.Get(0) != nil {
		return args.Get(0).(*ElectionOverviewResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) GetAuditLogs(ctx context.Context, eventID uuid.UUID, req AdminListAuditRequest) ([]AuditLogResponse, int, error) {
	args := m.Called(ctx, eventID, req)
	if args.Get(0) != nil {
		return args.Get(0).([]AuditLogResponse), args.Int(1), args.Error(2)
	}
	return nil, 0, args.Error(2)
}

package attendance

import (
	"context"

	"github.com/stretchr/testify/mock"
)

type MockService struct {
	mock.Mock
}

func (m *MockService) CheckIn(ctx context.Context, req *CheckInRequest, operatorID string) (*CheckInResponse, error) {
	args := m.Called(ctx, req, operatorID)
	if args.Get(0) != nil {
		return args.Get(0).(*CheckInResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) GetAttendance(ctx context.Context, registrationID string) (*AttendanceDetailResponse, error) {
	args := m.Called(ctx, registrationID)
	if args.Get(0) != nil {
		return args.Get(0).(*AttendanceDetailResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) ListAttendances(ctx context.Context, filter AttendanceListRequest) ([]AttendanceItemResponse, int, error) {
	args := m.Called(ctx, filter)
	if args.Get(0) != nil {
		return args.Get(0).([]AttendanceItemResponse), args.Int(1), args.Error(2)
	}
	return nil, args.Int(1), args.Error(2)
}

func (m *MockService) GetAttendanceByID(ctx context.Context, id string) (*AttendanceDetailResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*AttendanceDetailResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) CorrectAttendance(ctx context.Context, id string, req *CorrectAttendanceRequest, operatorID string) error {
	args := m.Called(ctx, id, req, operatorID)
	return args.Error(0)
}

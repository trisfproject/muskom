package attendance

import (
	"context"

	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/mock"
)

type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) GetParticipantStatus(ctx context.Context, registrationID string) (string, error) {
	args := m.Called(ctx, registrationID)
	return args.String(0), args.Error(1)
}

func (m *MockRepository) GetAttendanceDetail(ctx context.Context, registrationID string) (*AttendanceDetailResponse, error) {
	args := m.Called(ctx, registrationID)
	if args.Get(0) != nil {
		return args.Get(0).(*AttendanceDetailResponse), args.Error(1)
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

func (m *MockRepository) CreateAttendance(ctx context.Context, tx *sqlx.Tx, registrationID string, operatorID string) (bool, error) {
	args := m.Called(ctx, tx, registrationID, operatorID)
	return args.Bool(0), args.Error(1)
}

func (m *MockRepository) LogAudit(ctx context.Context, tx *sqlx.Tx, module, action, entity, entityID string, metadata string) error {
	args := m.Called(ctx, tx, module, action, entity, entityID, metadata)
	return args.Error(0)
}

func (m *MockRepository) ListAttendances(ctx context.Context, filter AttendanceListRequest) ([]AttendanceItemResponse, int, error) {
	args := m.Called(ctx, filter)
	if args.Get(0) != nil {
		return args.Get(0).([]AttendanceItemResponse), args.Int(1), args.Error(2)
	}
	return nil, args.Int(1), args.Error(2)
}

func (m *MockRepository) GetAttendanceByID(ctx context.Context, attendanceID string) (*AttendanceDetailResponse, error) {
	args := m.Called(ctx, attendanceID)
	if args.Get(0) != nil {
		return args.Get(0).(*AttendanceDetailResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) UndoCheckIn(ctx context.Context, tx *sqlx.Tx, checkInID string, operatorID string, reason string) error {
	args := m.Called(ctx, tx, checkInID, operatorID, reason)
	return args.Error(0)
}

func (m *MockRepository) GetSummaryByEvent(ctx context.Context, eventID string) (*AttendanceSummary, error) {
	args := m.Called(ctx, eventID)
	if args.Get(0) != nil {
		return args.Get(0).(*AttendanceSummary), args.Error(1)
	}
	return nil, args.Error(1)
}

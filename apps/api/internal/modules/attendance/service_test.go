package attendance

import (
	"context"
	"errors"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap/zaptest"
)

func setupTestService(t *testing.T) (*sqlmock.Sqlmock, *MockRepository, Service, *sqlx.DB) {
	db, mockDB, err := sqlmock.New()
	assert.NoError(t, err)

	sqlxDB := sqlx.NewDb(db, "postgres")

	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)

	svc := NewService(mockRepo, log, val)
	return &mockDB, mockRepo, svc, sqlxDB
}

func TestService_CheckIn(t *testing.T) {
	mockDB, mockRepo, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("ValidationFailed", func(t *testing.T) {
		req := &CheckInRequest{}
		res, err := svc.CheckIn(ctx, req, "op1")
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("ParticipantNotFound", func(t *testing.T) {
		req := &CheckInRequest{ParticipantID: "00000000-0000-0000-0000-000000000000"}
		mockRepo.On("GetParticipantStatus", mock.Anything, "00000000-0000-0000-0000-000000000000").Return("", errors.New("db err")).Once()

		res, err := svc.CheckIn(ctx, req, "op1")
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("NotApproved", func(t *testing.T) {
		req := &CheckInRequest{ParticipantID: "00000000-0000-0000-0000-000000000000"}
		mockRepo.On("GetParticipantStatus", mock.Anything, "00000000-0000-0000-0000-000000000000").Return("PENDING", nil).Once()

		res, err := svc.CheckIn(ctx, req, "op1")
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("BeginTxFailed", func(t *testing.T) {
		req := &CheckInRequest{ParticipantID: "00000000-0000-0000-0000-000000000000"}
		mockRepo.On("GetParticipantStatus", mock.Anything, "00000000-0000-0000-0000-000000000000").Return("APPROVED", nil).Once()
		mockRepo.On("BeginTx", mock.Anything).Return((*sqlx.Tx)(nil), errors.New("tx err")).Once()

		res, err := svc.CheckIn(ctx, req, "op1")
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("CreateAttendanceFailed", func(t *testing.T) {
		req := &CheckInRequest{ParticipantID: "00000000-0000-0000-0000-000000000000"}
		mockRepo.On("GetParticipantStatus", mock.Anything, "00000000-0000-0000-0000-000000000000").Return("APPROVED", nil).Once()

		(*mockDB).ExpectBegin()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("CreateAttendance", mock.Anything, tx, req.ParticipantID, "op1").Return(false, errors.New("db err")).Once()

		res, err := svc.CheckIn(ctx, req, "op1")
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("Success_Existing", func(t *testing.T) {
		req := &CheckInRequest{ParticipantID: "00000000-0000-0000-0000-000000000000"}
		mockRepo.On("GetParticipantStatus", mock.Anything, "00000000-0000-0000-0000-000000000000").Return("APPROVED", nil).Once()

		(*mockDB).ExpectBegin()
		(*mockDB).ExpectCommit()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("CreateAttendance", mock.Anything, tx, req.ParticipantID, "op1").Return(false, nil).Once()
		mockRepo.On("GetAttendanceDetail", mock.Anything, req.ParticipantID).Return(&AttendanceDetailResponse{FullName: "John", RegistrationNumber: "MK-001"}, nil).Once()

		res, err := svc.CheckIn(ctx, req, "op1")
		assert.NoError(t, err)
		assert.False(t, res.IsNew)
	})

	t.Run("Success_New", func(t *testing.T) {
		req := &CheckInRequest{ParticipantID: "00000000-0000-0000-0000-000000000000"}
		mockRepo.On("GetParticipantStatus", mock.Anything, "00000000-0000-0000-0000-000000000000").Return("APPROVED", nil).Once()

		(*mockDB).ExpectBegin()
		(*mockDB).ExpectCommit()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("CreateAttendance", mock.Anything, tx, req.ParticipantID, "op1").Return(true, nil).Once()
		mockRepo.On("LogAudit", mock.Anything, tx, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()
		mockRepo.On("GetAttendanceDetail", mock.Anything, req.ParticipantID).Return(&AttendanceDetailResponse{FullName: "John", RegistrationNumber: "MK-001"}, nil).Once()

		res, err := svc.CheckIn(ctx, req, "op1")
		assert.NoError(t, err)
		assert.True(t, res.IsNew)
	})
}

func TestService_GetAttendance(t *testing.T) {
	_, mockRepo, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mockRepo.On("GetAttendanceDetail", mock.Anything, "reg1").Return(&AttendanceDetailResponse{}, nil).Once()
		res, err := svc.GetAttendance(ctx, "reg1")
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})
}

func TestService_Search(t *testing.T) {
	_, mockRepo, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		filter := AttendanceListRequest{Page: 1, Limit: 10}
		mockRepo.On("ListAttendances", mock.Anything, filter).Return([]AttendanceItemResponse{}, 0, nil).Once()
		res, total, err := svc.Search(ctx, filter)
		assert.NoError(t, err)
		assert.Equal(t, 0, total)
		assert.NotNil(t, res)
	})

	t.Run("ValidationFailed", func(t *testing.T) {
		// filter without valid validation logic, wait actually list request doesn't have validate tags
		// but let's test if validation struct is checked
	})
}

func TestService_GetAttendanceByID(t *testing.T) {
	_, mockRepo, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mockRepo.On("GetAttendanceByID", mock.Anything, "att1").Return(&AttendanceDetailResponse{}, nil).Once()
		res, err := svc.GetAttendanceByID(ctx, "att1")
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})
}

func TestService_UndoCheckIn(t *testing.T) {
	mockDB, mockRepo, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("ValidationFailed", func(t *testing.T) {
		req := &UndoCheckInRequest{}
		err := svc.UndoCheckIn(ctx, "att1", "op1", req)
		assert.Error(t, err)
	})

	t.Run("BeginTxFailed", func(t *testing.T) {
		req := &UndoCheckInRequest{Notes: "test"}
		mockRepo.On("BeginTx", mock.Anything).Return((*sqlx.Tx)(nil), errors.New("tx err")).Once()
		err := svc.UndoCheckIn(ctx, "att1", "op1", req)
		assert.Error(t, err)
	})

	t.Run("Success_Rejected", func(t *testing.T) {
		req := &UndoCheckInRequest{Notes: "test"}

		(*mockDB).ExpectBegin()
		(*mockDB).ExpectCommit()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("UndoCheckIn", mock.Anything, tx, mock.Anything, mock.Anything, mock.Anything).Return(errors.New("not supported by the current database schema")).Once()

		err := svc.UndoCheckIn(ctx, "att1", "op1", req)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "not supported by the current database schema")
	})
}

func TestValidationError_Error(t *testing.T) {
	err := &ValidationError{}
	assert.Equal(t, "validation failed", err.Error())
}

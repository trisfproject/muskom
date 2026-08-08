package verification

import (
	"context"
	"errors"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/trisfproject/muskom/apps/api/platform/config"
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

	svc := NewService(mockRepo, log, val, nil, &config.Config{})
	return &mockDB, mockRepo, svc, sqlxDB
}

func TestService_ListVerifications(t *testing.T) {
	_, mockRepo, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		filter := VerificationListRequest{QueueType: "participant"}
		mockRepo.On("GetVerifications", mock.Anything, filter).Return([]VerificationItemResponse{}, 0, nil).Once()

		list, total, err := svc.ListVerifications(ctx, filter)
		assert.NoError(t, err)
		assert.Equal(t, 0, total)
		assert.NotNil(t, list)
	})

	t.Run("ValidationError", func(t *testing.T) {
		filter := VerificationListRequest{QueueType: "invalid"}
		list, total, err := svc.ListVerifications(ctx, filter)
		assert.Error(t, err)
		assert.Nil(t, list)
		assert.Equal(t, 0, total)
	})
}

func TestService_GetSummary(t *testing.T) {
	_, mockRepo, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mockRepo.On("GetVerificationSummary", mock.Anything).Return(&VerificationSummaryResponse{}, nil).Once()
		res, err := svc.GetSummary(ctx)
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})
}

func TestService_GetParticipantVerification(t *testing.T) {
	_, mockRepo, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mockRepo.On("GetParticipantDetail", mock.Anything, "reg1").Return(&ParticipantDetailResponse{}, nil).Once()
		res, err := svc.GetParticipantVerification(ctx, "reg1")
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})
}

func TestService_VerifyParticipant(t *testing.T) {
	mockDB, mockRepo, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("ValidationError", func(t *testing.T) {
		req := &VerifyParticipantRequest{Status: "INVALID"}
		err := svc.VerifyParticipant(ctx, "reg1", req, "u1")
		assert.Error(t, err)
	})

	t.Run("GetDetailError", func(t *testing.T) {
		req := &VerifyParticipantRequest{Status: "APPROVED"}
		mockRepo.On("GetParticipantDetail", mock.Anything, "reg1").Return((*ParticipantDetailResponse)(nil), errors.New("not found")).Once()

		err := svc.VerifyParticipant(ctx, "reg1", req, "u1")
		assert.Error(t, err)
	})

	t.Run("InvalidTransition", func(t *testing.T) {
		req := &VerifyParticipantRequest{Status: "APPROVED"}
		mockRepo.On("GetParticipantDetail", mock.Anything, "reg1").Return(&ParticipantDetailResponse{Status: "APPROVED"}, nil).Once()

		err := svc.VerifyParticipant(ctx, "reg1", req, "u1")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid state transition")
	})

	t.Run("BeginTxError", func(t *testing.T) {
		req := &VerifyParticipantRequest{Status: "APPROVED"}
		mockRepo.On("GetParticipantDetail", mock.Anything, "reg1").Return(&ParticipantDetailResponse{Status: "PENDING"}, nil).Once()
		mockRepo.On("BeginTx", mock.Anything).Return((*sqlx.Tx)(nil), errors.New("tx err")).Once()

		err := svc.VerifyParticipant(ctx, "reg1", req, "u1")
		assert.Error(t, err)
	})

	t.Run("Success_Approved", func(t *testing.T) {
		req := &VerifyParticipantRequest{Status: "APPROVED"}
		mockRepo.On("GetParticipantDetail", mock.Anything, "reg1").Return(&ParticipantDetailResponse{Status: "PENDING"}, nil).Once()

		(*mockDB).ExpectBegin()
		(*mockDB).ExpectCommit()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()
		mockRepo.On("GetParticipantLimitAndLockTx", mock.Anything, tx).Return(0, nil).Once()

		mockRepo.On("UpdateParticipantStatus", mock.Anything, tx, "reg1", "APPROVED", "u1", (*string)(nil), mock.Anything).Return(nil).Once()
		mockRepo.On("LogAudit", mock.Anything, tx, "verification", "VERIFY_PARTICIPANT", "registrations", "reg1", "").Return(nil).Once()

		err := svc.VerifyParticipant(ctx, "reg1", req, "u1")
		assert.NoError(t, err)
	})

	t.Run("QuotaExceeded_Approved", func(t *testing.T) {
		req := &VerifyParticipantRequest{Status: "APPROVED"}
		mockRepo.On("GetParticipantDetail", mock.Anything, "reg1").Return(&ParticipantDetailResponse{Status: "PENDING"}, nil).Once()

		(*mockDB).ExpectBegin()
		(*mockDB).ExpectRollback()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()
		mockRepo.On("GetParticipantLimitAndLockTx", mock.Anything, tx).Return(100, nil).Once()
		mockRepo.On("CountVerifiedInTx", mock.Anything, tx).Return(100, nil).Once()

		err := svc.VerifyParticipant(ctx, "reg1", req, "u1")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Participant capacity has reached its limit")
	})

	t.Run("Success_Rejected", func(t *testing.T) {
		reason := "reason"
		req := &VerifyParticipantRequest{Status: "REJECTED", RejectionReason: &reason}
		mockRepo.On("GetParticipantDetail", mock.Anything, "reg1").Return(&ParticipantDetailResponse{Status: "PENDING"}, nil).Once()

		(*mockDB).ExpectBegin()
		(*mockDB).ExpectCommit()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("UpdateParticipantStatus", mock.Anything, tx, "reg1", "REJECTED", "u1", &reason, mock.Anything).Return(nil).Once()
		mockRepo.On("LogAudit", mock.Anything, tx, "verification", "VERIFY_PARTICIPANT", "registrations", "reg1", "reason").Return(nil).Once()

		err := svc.VerifyParticipant(ctx, "reg1", req, "u1")
		assert.NoError(t, err)
	})

	t.Run("UpdateStatusError", func(t *testing.T) {
		req := &VerifyParticipantRequest{Status: "APPROVED"}
		mockRepo.On("GetParticipantDetail", mock.Anything, "reg1").Return(&ParticipantDetailResponse{Status: "PENDING"}, nil).Once()

		(*mockDB).ExpectBegin()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()
		mockRepo.On("GetParticipantLimitAndLockTx", mock.Anything, tx).Return(0, nil).Once()

		mockRepo.On("UpdateParticipantStatus", mock.Anything, tx, "reg1", "APPROVED", "u1", (*string)(nil), mock.Anything).Return(errors.New("db err")).Once()

		err := svc.VerifyParticipant(ctx, "reg1", req, "u1")
		assert.Error(t, err)
	})

	t.Run("LogAuditError", func(t *testing.T) {
		req := &VerifyParticipantRequest{Status: "APPROVED"}
		mockRepo.On("GetParticipantDetail", mock.Anything, "reg1").Return(&ParticipantDetailResponse{Status: "PENDING"}, nil).Once()

		(*mockDB).ExpectBegin()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()
		mockRepo.On("GetParticipantLimitAndLockTx", mock.Anything, tx).Return(0, nil).Once()

		mockRepo.On("UpdateParticipantStatus", mock.Anything, tx, "reg1", "APPROVED", "u1", (*string)(nil), mock.Anything).Return(nil).Once()
		mockRepo.On("LogAudit", mock.Anything, tx, "verification", "VERIFY_PARTICIPANT", "registrations", "reg1", "").Return(errors.New("db err")).Once()

		err := svc.VerifyParticipant(ctx, "reg1", req, "u1")
		assert.Error(t, err)
	})
}

func TestService_GetCandidateVerification(t *testing.T) {
	_, mockRepo, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mockRepo.On("GetCandidateDetail", mock.Anything, "ca1").Return(&CandidateDetailResponse{}, nil).Once()
		res, err := svc.GetCandidateVerification(ctx, "ca1")
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})
}

func TestService_VerifyCandidate(t *testing.T) {
	mockDB, mockRepo, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("ValidationError", func(t *testing.T) {
		req := &VerifyCandidateRequest{Status: "INVALID"}
		err := svc.VerifyCandidate(ctx, "ca1", req, "u1")
		assert.Error(t, err)
	})

	t.Run("GetDetailError", func(t *testing.T) {
		req := &VerifyCandidateRequest{Status: "REVIEWING"}
		mockRepo.On("GetCandidateDetail", mock.Anything, "ca1").Return((*CandidateDetailResponse)(nil), errors.New("not found")).Once()

		err := svc.VerifyCandidate(ctx, "ca1", req, "u1")
		assert.Error(t, err)
	})

	t.Run("InvalidTransition", func(t *testing.T) {
		req := &VerifyCandidateRequest{Status: "ACCEPTED"}
		mockRepo.On("GetCandidateDetail", mock.Anything, "ca1").Return(&CandidateDetailResponse{Status: "SUBMITTED"}, nil).Once()

		err := svc.VerifyCandidate(ctx, "ca1", req, "u1")
		assert.Error(t, err)
	})

	t.Run("BeginTxError", func(t *testing.T) {
		req := &VerifyCandidateRequest{Status: "REVIEWING"}
		mockRepo.On("GetCandidateDetail", mock.Anything, "ca1").Return(&CandidateDetailResponse{Status: "SUBMITTED"}, nil).Once()
		mockRepo.On("BeginTx", mock.Anything).Return((*sqlx.Tx)(nil), errors.New("tx err")).Once()

		err := svc.VerifyCandidate(ctx, "ca1", req, "u1")
		assert.Error(t, err)
	})

	t.Run("Success_Reviewing", func(t *testing.T) {
		req := &VerifyCandidateRequest{Status: "REVIEWING"}
		mockRepo.On("GetCandidateDetail", mock.Anything, "ca1").Return(&CandidateDetailResponse{Status: "SUBMITTED"}, nil).Once()

		(*mockDB).ExpectBegin()
		(*mockDB).ExpectCommit()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("UpdateCandidateStatus", mock.Anything, tx, "ca1", "REVIEWING", "u1").Return(nil).Once()
		mockRepo.On("LogAudit", mock.Anything, tx, "verification", "VERIFY_CANDIDATE", "candidate_applications", "ca1", "").Return(nil).Once()

		err := svc.VerifyCandidate(ctx, "ca1", req, "u1")
		assert.NoError(t, err)
	})

	t.Run("Success_Rejected", func(t *testing.T) {
		reason := "reason"
		req := &VerifyCandidateRequest{Status: "REJECTED", Notes: &reason}
		mockRepo.On("GetCandidateDetail", mock.Anything, "ca1").Return(&CandidateDetailResponse{Status: "REVIEWING"}, nil).Once()

		(*mockDB).ExpectBegin()
		(*mockDB).ExpectCommit()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("UpdateCandidateStatus", mock.Anything, tx, "ca1", "REJECTED", "u1").Return(nil).Once()
		mockRepo.On("LogAudit", mock.Anything, tx, "verification", "VERIFY_CANDIDATE", "candidate_applications", "ca1", "reason").Return(nil).Once()

		err := svc.VerifyCandidate(ctx, "ca1", req, "u1")
		assert.NoError(t, err)
	})

	t.Run("UpdateStatusError", func(t *testing.T) {
		req := &VerifyCandidateRequest{Status: "REVIEWING"}
		mockRepo.On("GetCandidateDetail", mock.Anything, "ca1").Return(&CandidateDetailResponse{Status: "SUBMITTED"}, nil).Once()

		(*mockDB).ExpectBegin()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("UpdateCandidateStatus", mock.Anything, tx, "ca1", "REVIEWING", "u1").Return(errors.New("db err")).Once()

		err := svc.VerifyCandidate(ctx, "ca1", req, "u1")
		assert.Error(t, err)
	})

	t.Run("LogAuditError", func(t *testing.T) {
		req := &VerifyCandidateRequest{Status: "REVIEWING"}
		mockRepo.On("GetCandidateDetail", mock.Anything, "ca1").Return(&CandidateDetailResponse{Status: "SUBMITTED"}, nil).Once()

		(*mockDB).ExpectBegin()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("UpdateCandidateStatus", mock.Anything, tx, "ca1", "REVIEWING", "u1").Return(nil).Once()
		mockRepo.On("LogAudit", mock.Anything, tx, "verification", "VERIFY_CANDIDATE", "candidate_applications", "ca1", "").Return(errors.New("db err")).Once()

		err := svc.VerifyCandidate(ctx, "ca1", req, "u1")
		assert.Error(t, err)
	})
}

func TestValidateTransition(t *testing.T) {
	svc := &service{}

	assert.Error(t, svc.validateTransition("invalid", "a", "b"))

	assert.Error(t, svc.validateTransition("participant", "APPROVED", "REJECTED"))
	assert.Error(t, svc.validateTransition("participant", "PENDING", "INVALID"))
	assert.NoError(t, svc.validateTransition("participant", "PENDING", "APPROVED"))

	assert.Error(t, svc.validateTransition("candidate", "ACCEPTED", "REVIEWING"))
	assert.Error(t, svc.validateTransition("candidate", "SUBMITTED", "ACCEPTED"))
	assert.Error(t, svc.validateTransition("candidate", "REVIEWING", "INVALID"))
	assert.NoError(t, svc.validateTransition("candidate", "SUBMITTED", "REVIEWING"))
	assert.NoError(t, svc.validateTransition("candidate", "REVIEWING", "ACCEPTED"))
}

func TestValidationError_Error(t *testing.T) {
	err := &ValidationError{}
	assert.Equal(t, "validation failed", err.Error())
}

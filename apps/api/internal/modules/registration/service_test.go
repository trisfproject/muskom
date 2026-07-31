package registration

import (
	"context"
	"database/sql"
	"errors"
	"mime/multipart"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.uber.org/zap/zaptest"

	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

type MockStorage struct {
	storage.Storage
}

func TestService_RegisterParticipant(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)

	t.Run("Event Not Found", func(t *testing.T) {
		req := &PublicRegistrationRequest{
			FullName:            "John Doe",
			Email:               "john@example.com",
			ParticipantCategory: "DELEGATE",
		}
		
		mockRepo.On("GetActiveEventContext", mock.Anything).Return(nil, sql.ErrNoRows).Once()
		
		res, err := svc.RegisterParticipant(ctx, req)
		assert.ErrorIs(t, err, ErrEventNotFound)
		assert.Nil(t, res)
	})

	t.Run("Event Not Open", func(t *testing.T) {
		req := &PublicRegistrationRequest{
			FullName:            "John Doe",
			Email:               "john@example.com",
			ParticipantCategory: "DELEGATE",
		}
		
		evt := &MusyawarahActiveContext{
			EventID: "evt1",
			Status:  "COMPLETED",
		}
		mockRepo.On("GetActiveEventContext", mock.Anything).Return(evt, nil).Once()
		
		res, err := svc.RegisterParticipant(ctx, req)
		assert.ErrorIs(t, err, ErrEventNotOpen)
		assert.Nil(t, res)
	})
	
	t.Run("Registration Closed", func(t *testing.T) {
		req := &PublicRegistrationRequest{
			FullName:            "John Doe",
			Email:               "john@example.com",
			ParticipantCategory: "DELEGATE",
		}
		
		evt := &MusyawarahActiveContext{
			EventID: "evt1",
			Status:  "ONGOING",
		}
		mockRepo.On("GetActiveEventContext", mock.Anything).Return(evt, nil).Once()
		mockRepo.On("IsPhaseActive", mock.Anything, "evt1", "REGISTRATION").Return(false, nil).Once()
		
		res, err := svc.RegisterParticipant(ctx, req)
		assert.ErrorIs(t, err, ErrRegistrationClosed)
		assert.Nil(t, res)
	})

	t.Run("EventContextError", func(t *testing.T) {
		req := &PublicRegistrationRequest{FullName: "John", Email: "test@test.com", ParticipantCategory: "DELEGATE"}
		mockRepo.On("GetActiveEventContext", mock.Anything).Return((*MusyawarahActiveContext)(nil), errors.New("db error")).Once()
		
		res, err := svc.RegisterParticipant(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("PhaseActiveError", func(t *testing.T) {
		req := &PublicRegistrationRequest{FullName: "John", Email: "test@test.com", ParticipantCategory: "DELEGATE"}
		evt := &MusyawarahActiveContext{EventID: "evt1", Status: "ONGOING"}
		mockRepo.On("GetActiveEventContext", mock.Anything).Return(evt, nil).Once()
		mockRepo.On("IsPhaseActive", mock.Anything, "evt1", "REGISTRATION").Return(false, errors.New("db error")).Once()
		
		res, err := svc.RegisterParticipant(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("AlreadyRegistered", func(t *testing.T) {
		req := &PublicRegistrationRequest{FullName: "John", Email: "test@test.com", ParticipantCategory: "DELEGATE"}
		evt := &MusyawarahActiveContext{EventID: "evt1", Status: "ONGOING"}
		mockRepo.On("GetActiveEventContext", mock.Anything).Return(evt, nil).Once()
		mockRepo.On("IsPhaseActive", mock.Anything, "evt1", "REGISTRATION").Return(true, nil).Once()
		mockRepo.On("CheckExistingRegistration", mock.Anything, "evt1", "test@test.com").Return(true, nil).Once()
		
		res, err := svc.RegisterParticipant(ctx, req)
		assert.ErrorIs(t, err, ErrAlreadyRegistered)
		assert.Nil(t, res)
	})

	t.Run("BeginTxError", func(t *testing.T) {
		req := &PublicRegistrationRequest{FullName: "John", Email: "test@test.com", ParticipantCategory: "DELEGATE"}
		evt := &MusyawarahActiveContext{EventID: "evt1", Status: "ONGOING"}
		mockRepo.On("GetActiveEventContext", mock.Anything).Return(evt, nil).Once()
		mockRepo.On("IsPhaseActive", mock.Anything, "evt1", "REGISTRATION").Return(true, nil).Once()
		mockRepo.On("CheckExistingRegistration", mock.Anything, "evt1", "test@test.com").Return(false, nil).Once()
		mockRepo.On("BeginTx", mock.Anything).Return(nil, errors.New("tx error")).Once()
		
		res, err := svc.RegisterParticipant(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

func TestService_CheckRegistrationStatus(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)
	
	t.Run("Success", func(t *testing.T) {
		mockRepo.On("GetRegistrationStatus", mock.Anything, "reg1").Return("APPROVED", nil).Once()
		res, err := svc.CheckRegistrationStatus(ctx, "reg1")
		assert.NoError(t, err)
		assert.Equal(t, "APPROVED", res.Status)
	})

	t.Run("Not Found", func(t *testing.T) {
		mockRepo.On("GetRegistrationStatus", mock.Anything, "reg1").Return("", sql.ErrNoRows).Once()
		res, err := svc.CheckRegistrationStatus(ctx, "reg1")
		assert.ErrorIs(t, err, ErrRegistrationNotFound)
		assert.Nil(t, res)
	})

	t.Run("Error", func(t *testing.T) {
		mockRepo.On("GetRegistrationStatus", mock.Anything, "reg1").Return("", errors.New("db error")).Once()
		res, err := svc.CheckRegistrationStatus(ctx, "reg1")
		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

func TestService_GetRegistrationConfirmation(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)
	
	t.Run("Success", func(t *testing.T) {
		data := &RegistrationConfirmationData{
			RegistrationCode: "reg1",
			Status:           "APPROVED",
			RegistrationDate: "2023-01-01",
			MusyawarahName:   "Musyawarah 1",
			ParticipantName:  "John Doe",
		}
		mockRepo.On("GetRegistrationConfirmation", mock.Anything, "reg1").Return(data, nil).Once()
		res, err := svc.GetRegistrationConfirmation(ctx, "reg1")
		assert.NoError(t, err)
		assert.Equal(t, "reg1", res.RegistrationCode)
		assert.Equal(t, "J**n D*e", res.ParticipantName)
	})
}

func TestService_AdminListRegistrations(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)
	
	t.Run("Success", func(t *testing.T) {
		req := &AdminListRegistrationsRequest{
			Page:  1,
			Limit: 10,
		}
		res := []AdminRegistrationResponse{
			{ID: "reg1"},
		}
		mockRepo.On("ListRegistrations", mock.Anything, *req).Return(res, 1, nil).Once()
		
		list, err := svc.AdminListRegistrations(ctx, req)
		assert.NoError(t, err)
		assert.Equal(t, 1, list.Total)
		assert.Len(t, list.Data, 1)
	})

	t.Run("Error", func(t *testing.T) {
		req := &AdminListRegistrationsRequest{}
		mockRepo.On("ListRegistrations", mock.Anything, *req).Return(([]AdminRegistrationResponse)(nil), 0, errors.New("db err")).Once()
		
		list, err := svc.AdminListRegistrations(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, list)
	})
}

func TestService_AdminGetRegistration(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)
	
	t.Run("Success", func(t *testing.T) {
		reg := &AdminRegistrationResponse{ID: "reg1"}
		mockRepo.On("GetRegistrationAdminByID", mock.Anything, "reg1").Return(reg, nil).Once()
		
		res, err := svc.AdminGetRegistration(ctx, "reg1")
		assert.NoError(t, err)
		assert.Equal(t, "reg1", res.ID)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockRepo.On("GetRegistrationAdminByID", mock.Anything, "reg1").Return((*AdminRegistrationResponse)(nil), sql.ErrNoRows).Once()
		
		res, err := svc.AdminGetRegistration(ctx, "reg1")
		assert.ErrorIs(t, err, ErrRegistrationNotFound)
		assert.Nil(t, res)
	})

	t.Run("Error", func(t *testing.T) {
		mockRepo.On("GetRegistrationAdminByID", mock.Anything, "reg1").Return((*AdminRegistrationResponse)(nil), errors.New("db err")).Once()
		
		res, err := svc.AdminGetRegistration(ctx, "reg1")
		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

func TestService_GetAttachments(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)
	
	t.Run("Success", func(t *testing.T) {
		reg := &Registration{ID: "reg1"}
		mockRepo.On("GetRegistrationByID", mock.Anything, "reg1").Return(reg, nil).Once()

		atts := []AttachmentResponse{
			{ID: "att1", FileName: "test.pdf"},
		}
		mockRepo.On("GetAttachments", mock.Anything, "reg1").Return(atts, nil).Once()
		res, err := svc.GetAttachments(ctx, "reg1")
		assert.NoError(t, err)
		assert.Len(t, res, 1)
	})

	t.Run("RegistrationNotFound", func(t *testing.T) {
		mockRepo.On("GetRegistrationByID", mock.Anything, "reg1").Return((*Registration)(nil), sql.ErrNoRows).Once()
		
		res, err := svc.GetAttachments(ctx, "reg1")
		assert.ErrorIs(t, err, ErrRegistrationNotFound)
		assert.Nil(t, res)
	})

	t.Run("Error", func(t *testing.T) {
		reg := &Registration{ID: "reg1"}
		mockRepo.On("GetRegistrationByID", mock.Anything, "reg1").Return(reg, nil).Once()
		mockRepo.On("GetAttachments", mock.Anything, "reg1").Return(([]AttachmentResponse)(nil), errors.New("db err")).Once()
		
		res, err := svc.GetAttachments(ctx, "reg1")
		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

func TestService_UploadAttachment(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)

	t.Run("NotFound", func(t *testing.T) {
		mockRepo.On("GetRegistrationByID", mock.Anything, "reg1").Return((*Registration)(nil), sql.ErrNoRows).Once()
		
		res, err := svc.UploadAttachment(ctx, "reg1", nil)
		assert.ErrorIs(t, err, ErrRegistrationNotFound)
		assert.Nil(t, res)
	})

	t.Run("StatusError", func(t *testing.T) {
		reg := &Registration{ID: "reg1", Status: "REJECTED"}
		mockRepo.On("GetRegistrationByID", mock.Anything, "reg1").Return(reg, nil).Once()
		
		res, err := svc.UploadAttachment(ctx, "reg1", nil)
		assert.ErrorIs(t, err, ErrStatusNotPending)
		assert.Nil(t, res)
	})

	t.Run("FileSizeExceeded", func(t *testing.T) {
		reg := &Registration{ID: "reg1", Status: "PENDING"}
		mockRepo.On("GetRegistrationByID", mock.Anything, "reg1").Return(reg, nil).Once()
		
		file := &multipart.FileHeader{Size: 2048 * 1024}
		res, err := svc.UploadAttachment(ctx, "reg1", file)
		assert.ErrorIs(t, err, ErrFileSizeExceeded)
		assert.Nil(t, res)
	})
}

func TestService_DeleteAttachment(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)
	
	t.Run("Success", func(t *testing.T) {
		reg := &Registration{ID: "reg1"}
		mockRepo.On("GetRegistrationByID", mock.Anything, "reg1").Return(reg, nil).Once()
		mockRepo.On("DeleteAttachmentMetadata", mock.Anything, "att1").Return(nil).Once()
		
		err := svc.DeleteAttachment(ctx, "reg1", "att1")
		assert.NoError(t, err)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockRepo.On("GetRegistrationByID", mock.Anything, "reg1").Return((*Registration)(nil), sql.ErrNoRows).Once()
		
		err := svc.DeleteAttachment(ctx, "reg1", "att1")
		assert.ErrorIs(t, err, ErrRegistrationNotFound)
	})

	t.Run("Error", func(t *testing.T) {
		reg := &Registration{ID: "reg1"}
		mockRepo.On("GetRegistrationByID", mock.Anything, "reg1").Return(reg, nil).Once()
		mockRepo.On("DeleteAttachmentMetadata", mock.Anything, "att1").Return(errors.New("db err")).Once()
		
		err := svc.DeleteAttachment(ctx, "reg1", "att1")
		assert.Error(t, err)
	})
}

func TestService_AdminUpdateRegistrationStatus(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)
	
	t.Run("TxError", func(t *testing.T) {
		req := &AdminUpdateRegistrationStatusRequest{
			Status: "APPROVED",
		}
		
		reg := &AdminRegistrationResponse{
			ID: "reg1",
			Status: "PENDING",
		}
		mockRepo.On("GetRegistrationAdminByID", mock.Anything, "reg1").Return(reg, nil).Once()
		mockRepo.On("BeginTx", mock.Anything).Return(nil, errors.New("tx error")).Once()
		
		err := svc.AdminUpdateRegistrationStatus(ctx, "reg1", req, "admin")
		assert.Error(t, err)
	})

	t.Run("ValidationError", func(t *testing.T) {
		req := &AdminUpdateRegistrationStatusRequest{}
		err := svc.AdminUpdateRegistrationStatus(ctx, "reg1", req, "admin")
		assert.Error(t, err)
	})

	t.Run("NotFound", func(t *testing.T) {
		req := &AdminUpdateRegistrationStatusRequest{Status: "APPROVED"}
		mockRepo.On("GetRegistrationAdminByID", mock.Anything, "reg1").Return((*AdminRegistrationResponse)(nil), sql.ErrNoRows).Once()
		err := svc.AdminUpdateRegistrationStatus(ctx, "reg1", req, "admin")
		assert.ErrorIs(t, err, ErrRegistrationNotFound)
	})

	t.Run("NoChange", func(t *testing.T) {
		req := &AdminUpdateRegistrationStatusRequest{Status: "APPROVED"}
		reg := &AdminRegistrationResponse{
			ID: "reg1",
			Status: "APPROVED",
		}
		mockRepo.On("GetRegistrationAdminByID", mock.Anything, "reg1").Return(reg, nil).Once()
		err := svc.AdminUpdateRegistrationStatus(ctx, "reg1", req, "admin")
		assert.NoError(t, err)
	})
}

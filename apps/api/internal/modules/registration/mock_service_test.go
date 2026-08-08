package registration

import (
	"context"
	"mime/multipart"

	"github.com/stretchr/testify/mock"
)

type MockService struct {
	mock.Mock
}

func (m *MockService) RegisterParticipant(ctx context.Context, req *PublicRegistrationRequest) (*PublicRegistrationResponse, error) {
	args := m.Called(ctx, req)
	if args.Get(0) != nil {
		return args.Get(0).(*PublicRegistrationResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) CheckRegistrationStatus(ctx context.Context, registrationCode string) (*RegistrationStatusResponse, error) {
	args := m.Called(ctx, registrationCode)
	if args.Get(0) != nil {
		return args.Get(0).(*RegistrationStatusResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) GetRegistrationConfirmation(ctx context.Context, registrationCode string) (*RegistrationConfirmationResponse, error) {
	args := m.Called(ctx, registrationCode)
	if args.Get(0) != nil {
		return args.Get(0).(*RegistrationConfirmationResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) UploadAttachment(ctx context.Context, registrationID string, file *multipart.FileHeader) (*AttachmentResponse, error) {
	args := m.Called(ctx, registrationID, file)
	if args.Get(0) != nil {
		return args.Get(0).(*AttachmentResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) GetAttachments(ctx context.Context, registrationID string) ([]AttachmentResponse, error) {
	args := m.Called(ctx, registrationID)
	if args.Get(0) != nil {
		return args.Get(0).([]AttachmentResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) DeleteAttachment(ctx context.Context, registrationID, attachmentID string) error {
	args := m.Called(ctx, registrationID, attachmentID)
	return args.Error(0)
}

func (m *MockService) AdminListRegistrations(ctx context.Context, req *AdminListRegistrationsRequest) (*AdminListRegistrationsResponse, error) {
	args := m.Called(ctx, req)
	if args.Get(0) != nil {
		return args.Get(0).(*AdminListRegistrationsResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) AdminGetRegistration(ctx context.Context, id string) (*AdminRegistrationResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*AdminRegistrationResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) AdminUpdateRegistrationStatus(ctx context.Context, id string, req *AdminUpdateRegistrationStatusRequest, adminUserID string) error {
	args := m.Called(ctx, id, req, adminUserID)
	return args.Error(0)
}

func (m *MockService) GetEmailHistory(ctx context.Context, registrationID string) ([]EmailLogResponse, error) {
	args := m.Called(ctx, registrationID)
	if args.Get(0) != nil {
		return args.Get(0).([]EmailLogResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) ResendEmail(ctx context.Context, registrationID string, req *ResendEmailRequest, adminUserID string) error {
	args := m.Called(ctx, registrationID, req, adminUserID)
	return args.Error(0)
}

func (m *MockService) LookupParticipant(ctx context.Context, registrationNumber string) (*AdminRegistrationResponse, error) {
	args := m.Called(ctx, registrationNumber)
	if args.Get(0) != nil {
		return args.Get(0).(*AdminRegistrationResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) AdminRetryEmail(ctx context.Context, logID string) error {
	args := m.Called(ctx, logID)
	return args.Error(0)
}

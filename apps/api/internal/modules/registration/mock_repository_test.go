package registration

import (
	"context"

	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/mock"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
)

type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) GetActiveEventContext(ctx context.Context) (*MusyawarahActiveContext, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahActiveContext), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) IsPhaseActive(ctx context.Context, eventID string, phaseName string) (bool, error) {
	args := m.Called(ctx, eventID, phaseName)
	return args.Bool(0), args.Error(1)
}

func (m *MockRepository) CountRegistrations(ctx context.Context, eventID string) (int, error) {
	args := m.Called(ctx, eventID)
	return args.Int(0), args.Error(1)
}

func (m *MockRepository) CheckExistingRegistration(ctx context.Context, eventID string, email string) (bool, error) {
	args := m.Called(ctx, eventID, email)
	return args.Bool(0), args.Error(1)
}

func (m *MockRepository) CheckExistingPhone(ctx context.Context, eventID string, phone string) (bool, error) {
	args := m.Called(ctx, eventID, phone)
	return args.Bool(0), args.Error(1)
}

func (m *MockRepository) BeginTx(ctx context.Context) (*sqlx.Tx, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).(*sqlx.Tx), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) FindOrCreatePerson(ctx context.Context, tx *sqlx.Tx, p *Person) error {
	args := m.Called(ctx, tx, p)
	return args.Error(0)
}

func (m *MockRepository) CreateRegistration(ctx context.Context, tx *sqlx.Tx, r *Registration) error {
	args := m.Called(ctx, tx, r)
	return args.Error(0)
}

func (m *MockRepository) LogAudit(ctx context.Context, tx *sqlx.Tx, module, action, entity, entityID string, metadata string) error {
	args := m.Called(ctx, tx, module, action, entity, entityID, metadata)
	return args.Error(0)
}

func (m *MockRepository) GetRegistrationStatus(ctx context.Context, registrationID string) (string, error) {
	args := m.Called(ctx, registrationID)
	return args.String(0), args.Error(1)
}

func (m *MockRepository) GetRegistrationByID(ctx context.Context, registrationID string) (*Registration, error) {
	args := m.Called(ctx, registrationID)
	if args.Get(0) != nil {
		return args.Get(0).(*Registration), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) SaveAttachmentMetadata(ctx context.Context, registrationID string, fileInfo *storage.FileInfo) (string, error) {
	args := m.Called(ctx, registrationID, fileInfo)
	return args.String(0), args.Error(1)
}

func (m *MockRepository) GetAttachments(ctx context.Context, registrationID string) ([]AttachmentResponse, error) {
	args := m.Called(ctx, registrationID)
	if args.Get(0) != nil {
		return args.Get(0).([]AttachmentResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) DeleteAttachmentMetadata(ctx context.Context, attachmentID string) error {
	args := m.Called(ctx, attachmentID)
	return args.Error(0)
}

func (m *MockRepository) GetRegistrationConfirmation(ctx context.Context, registrationID string) (*RegistrationConfirmationData, error) {
	args := m.Called(ctx, registrationID)
	if args.Get(0) != nil {
		return args.Get(0).(*RegistrationConfirmationData), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) ListRegistrations(ctx context.Context, filter AdminListRegistrationsRequest) ([]AdminRegistrationResponse, int, error) {
	args := m.Called(ctx, filter)
	if args.Get(0) != nil {
		return args.Get(0).([]AdminRegistrationResponse), args.Int(1), args.Error(2)
	}
	return nil, args.Int(1), args.Error(2)
}

func (m *MockRepository) GetRegistrationAdminByID(ctx context.Context, id string) (*AdminRegistrationResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*AdminRegistrationResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) UpdateRegistrationStatus(ctx context.Context, tx *sqlx.Tx, id string, status string, adminID string) error {
	args := m.Called(ctx, tx, id, status, adminID)
	return args.Error(0)
}

func (m *MockRepository) CountResendAttempts(ctx context.Context, registrationID string, sinceMinutes int) (int, error) {
	args := m.Called(ctx, registrationID, sinceMinutes)
	return args.Int(0), args.Error(1)
}

func (m *MockRepository) GetPortalTitle(ctx context.Context) (string, error) {
	args := m.Called(ctx)
	return args.String(0), args.Error(1)
}

func (m *MockRepository) CreateEmailLog(ctx context.Context, tx *sqlx.Tx, log *EmailLog) error {
	args := m.Called(ctx, tx, log)
	return args.Error(0)
}

func (m *MockRepository) GetEmailLogsByRegistration(ctx context.Context, registrationID string) ([]EmailLog, error) {
	args := m.Called(ctx, registrationID)
	if args.Get(0) != nil {
		return args.Get(0).([]EmailLog), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) GetMaxRegistrationNumberTx(ctx context.Context, tx *sqlx.Tx) (int, error) {
	args := m.Called(ctx, tx)
	return args.Int(0), args.Error(1)
}

func (m *MockRepository) UpdateRegistrationStatusAndNumberTx(ctx context.Context, tx *sqlx.Tx, id string, status string, regNum string, adminID string) error {
	args := m.Called(ctx, tx, id, status, regNum, adminID)
	return args.Error(0)
}

func (m *MockRepository) GetPendingEmails(ctx context.Context, limit int) ([]EmailLog, error) {
	args := m.Called(ctx, limit)
	if args.Get(0) != nil {
		return args.Get(0).([]EmailLog), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) UpdateEmailLogStatus(ctx context.Context, logID string, status string, errorMsg *string) error {
	args := m.Called(ctx, logID, status, errorMsg)
	return args.Error(0)
}

func (m *MockRepository) LookupParticipant(ctx context.Context, query string) (*AdminRegistrationResponse, error) {
	args := m.Called(ctx, query)
	if args.Get(0) != nil {
		return args.Get(0).(*AdminRegistrationResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

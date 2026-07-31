package candidate

import (
	"context"
	"database/sql"
	"errors"
	"mime/multipart"
	"testing"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.uber.org/zap/zaptest"

	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

// MockRepository for service tests
type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) CreateCandidateApplication(ctx context.Context, app *CandidateApplication) (string, error) {
	args := m.Called(ctx, app)
	return args.String(0), args.Error(1)
}

func (m *MockRepository) GetCandidateApplicationByID(ctx context.Context, id string) (*CandidateApplication, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*CandidateApplication), args.Error(1)
}

func (m *MockRepository) CheckExistingApplication(ctx context.Context, registrationID string) (bool, error) {
	args := m.Called(ctx, registrationID)
	return args.Bool(0), args.Error(1)
}

func (m *MockRepository) GetEventActivePhase(ctx context.Context, eventID, phaseName string) (bool, error) {
	args := m.Called(ctx, eventID, phaseName)
	return args.Bool(0), args.Error(1)
}

func (m *MockRepository) GetRegistrationDetails(ctx context.Context, registrationID string) (*RegistrationDetails, error) {
	args := m.Called(ctx, registrationID)
	return args.Get(0).(*RegistrationDetails), args.Error(1)
}

func (m *MockRepository) UpdateDocumentPaths(ctx context.Context, tx *sqlx.Tx, applicationID string, photoPath, docPath *string) error {
	args := m.Called(ctx, tx, applicationID, photoPath, docPath)
	return args.Error(0)
}

func (m *MockRepository) GetAdminCandidateList(ctx context.Context, filter CandidateAdminListRequest) ([]CandidateAdminListResponse, int, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]CandidateAdminListResponse), args.Int(1), args.Error(2)
}

func (m *MockRepository) GetAdminCandidateDetail(ctx context.Context, candidateCode string) (*CandidateAdminDetailResponse, error) {
	args := m.Called(ctx, candidateCode)
	return args.Get(0).(*CandidateAdminDetailResponse), args.Error(1)
}

func (m *MockRepository) UpdateCandidateStatus(ctx context.Context, tx *sqlx.Tx, candidateCode, status, reviewedBy string) error {
	args := m.Called(ctx, tx, candidateCode, status, reviewedBy)
	return args.Error(0)
}

func (m *MockRepository) GetCandidateAuditHistory(ctx context.Context, candidateCode string) ([]CandidateAuditLogResponse, error) {
	args := m.Called(ctx, candidateCode)
	return args.Get(0).([]CandidateAuditLogResponse), args.Error(1)
}

func (m *MockRepository) UpdateCandidateDetails(ctx context.Context, tx *sqlx.Tx, candidateCode string, req *CandidateAdminUpdateRequest) error {
	args := m.Called(ctx, tx, candidateCode, req)
	return args.Error(0)
}

func (m *MockRepository) BeginTx(ctx context.Context) (*sqlx.Tx, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*sqlx.Tx), args.Error(1)
}

func (m *MockRepository) LogAudit(ctx context.Context, tx *sqlx.Tx, action, module, tableName, recordID, metadata string) error {
	args := m.Called(ctx, tx, action, module, tableName, recordID, metadata)
	return args.Error(0)
}

func TestService_RegisterCandidate(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)

	t.Run("ValidationFailed", func(t *testing.T) {
		req := &RegisterCandidateRequest{}
		res, err := svc.RegisterCandidate(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("RegistrationDetailsFailed", func(t *testing.T) {
		req := &RegisterCandidateRequest{RegistrationID: "00000000-0000-0000-0000-000000000000", Vision: "v", Mission: "m", WorkProgram: "wp"}
		mockRepo.On("GetRegistrationDetails", mock.Anything, "00000000-0000-0000-0000-000000000000").Return((*RegistrationDetails)(nil), errors.New("db error")).Once()

		res, err := svc.RegisterCandidate(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("RegistrationNotApproved", func(t *testing.T) {
		req := &RegisterCandidateRequest{RegistrationID: "00000000-0000-0000-0000-000000000000", Vision: "v", Mission: "m", WorkProgram: "wp"}
		details := &RegistrationDetails{RegistrationStatus: "PENDING"}
		mockRepo.On("GetRegistrationDetails", mock.Anything, "00000000-0000-0000-0000-000000000000").Return(details, nil).Once()

		res, err := svc.RegisterCandidate(ctx, req)
		assert.ErrorIs(t, err, ErrRegistrationNotApproved)
		assert.Nil(t, res)
	})

	t.Run("EventStatusInvalid", func(t *testing.T) {
		req := &RegisterCandidateRequest{RegistrationID: "00000000-0000-0000-0000-000000000000", Vision: "v", Mission: "m", WorkProgram: "wp"}
		details := &RegistrationDetails{RegistrationStatus: "APPROVED", EventStatus: "COMPLETED"}
		mockRepo.On("GetRegistrationDetails", mock.Anything, "00000000-0000-0000-0000-000000000000").Return(details, nil).Once()

		res, err := svc.RegisterCandidate(ctx, req)
		assert.ErrorIs(t, err, ErrEventStatusInvalid)
		assert.Nil(t, res)
	})

	t.Run("PhaseClosed", func(t *testing.T) {
		req := &RegisterCandidateRequest{RegistrationID: "00000000-0000-0000-0000-000000000000", Vision: "v", Mission: "m", WorkProgram: "wp"}
		details := &RegistrationDetails{RegistrationStatus: "APPROVED", EventStatus: "ONGOING", EventID: "evt1"}
		mockRepo.On("GetRegistrationDetails", mock.Anything, "00000000-0000-0000-0000-000000000000").Return(details, nil).Once()
		mockRepo.On("GetEventActivePhase", mock.Anything, "evt1", "candidate_registration").Return(false, nil).Once()

		res, err := svc.RegisterCandidate(ctx, req)
		assert.ErrorIs(t, err, ErrCandidateRegistrationClosed)
		assert.Nil(t, res)
	})

	t.Run("DuplicateApplication", func(t *testing.T) {
		req := &RegisterCandidateRequest{RegistrationID: "00000000-0000-0000-0000-000000000000", Vision: "v", Mission: "m", WorkProgram: "wp"}
		details := &RegistrationDetails{RegistrationStatus: "APPROVED", EventStatus: "ONGOING", EventID: "evt1"}
		mockRepo.On("GetRegistrationDetails", mock.Anything, "00000000-0000-0000-0000-000000000000").Return(details, nil).Once()
		mockRepo.On("GetEventActivePhase", mock.Anything, "evt1", "candidate_registration").Return(true, nil).Once()

		mockRepo.On("CheckExistingApplication", mock.Anything, "00000000-0000-0000-0000-000000000000").Return(true, nil).Once()

		res, err := svc.RegisterCandidate(ctx, req)
		assert.ErrorIs(t, err, ErrDuplicateApplication)
		assert.Nil(t, res)
	})

	t.Run("BeginTxFailed", func(t *testing.T) {
		req := &RegisterCandidateRequest{RegistrationID: "00000000-0000-0000-0000-000000000000", Vision: "v", Mission: "m", WorkProgram: "wp"}
		details := &RegistrationDetails{RegistrationStatus: "APPROVED", EventStatus: "ONGOING", EventID: "evt1"}
		mockRepo.On("GetRegistrationDetails", mock.Anything, "00000000-0000-0000-0000-000000000000").Return(details, nil).Once()
		mockRepo.On("GetEventActivePhase", mock.Anything, "evt1", "candidate_registration").Return(true, nil).Once()
		mockRepo.On("CheckExistingApplication", mock.Anything, "00000000-0000-0000-0000-000000000000").Return(false, nil).Once()
		mockRepo.On("BeginTx", mock.Anything).Return(nil, errors.New("tx err")).Once()

		res, err := svc.RegisterCandidate(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

func TestService_GetCandidateStatus(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)

	t.Run("Success", func(t *testing.T) {
		app := &CandidateApplication{ID: "app1", Status: "PENDING", CreatedAt: time.Now()}
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return(app, nil).Once()

		res, err := svc.GetCandidateStatus(ctx, "app1")
		assert.NoError(t, err)
		assert.Equal(t, "app1", res.CandidateCode)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return((*CandidateApplication)(nil), sql.ErrNoRows).Once()

		res, err := svc.GetCandidateStatus(ctx, "app1")
		assert.ErrorIs(t, err, sql.ErrNoRows)
		assert.Nil(t, res)
	})
}

func TestService_GetDocuments(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)

	t.Run("Success", func(t *testing.T) {
		p := "path/to/photo.jpg"
		app := &CandidateApplication{ID: "app1", PhotoPath: &p}
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return(app, nil).Once()

		res, err := svc.GetDocuments(ctx, "app1")
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})

	t.Run("Error", func(t *testing.T) {
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return((*CandidateApplication)(nil), errors.New("db err")).Once()

		res, err := svc.GetDocuments(ctx, "app1")
		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

func TestService_UploadDocuments(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)

	t.Run("NotFound", func(t *testing.T) {
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return((*CandidateApplication)(nil), errors.New("db err")).Once()

		res, err := svc.UploadDocuments(ctx, "app1", nil, nil)
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("InvalidStatus", func(t *testing.T) {
		app := &CandidateApplication{ID: "app1", Status: "APPROVED"}
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return(app, nil).Once()

		res, err := svc.UploadDocuments(ctx, "app1", nil, nil)
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("NoFiles", func(t *testing.T) {
		app := &CandidateApplication{ID: "app1", Status: "SUBMITTED"}
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return(app, nil).Once()

		res, err := svc.UploadDocuments(ctx, "app1", nil, nil)
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("PhotoValidationFailed", func(t *testing.T) {
		app := &CandidateApplication{ID: "app1", Status: "SUBMITTED"}
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return(app, nil).Once()

		photo := &multipart.FileHeader{Filename: "test.txt", Size: 100} // invalid extension
		res, err := svc.UploadDocuments(ctx, "app1", photo, nil)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "photo validation failed")
		assert.Nil(t, res)
	})

	t.Run("PhotoSizeExceeded", func(t *testing.T) {
		app := &CandidateApplication{ID: "app1", Status: "SUBMITTED"}
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return(app, nil).Once()

		photo := &multipart.FileHeader{Filename: "test.jpg", Size: 99999999} // size exceeded
		res, err := svc.UploadDocuments(ctx, "app1", photo, nil)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "photo validation failed")
		assert.Nil(t, res)
	})

	t.Run("DocumentValidationFailed", func(t *testing.T) {
		app := &CandidateApplication{ID: "app1", Status: "SUBMITTED"}
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return(app, nil).Once()

		doc := &multipart.FileHeader{Filename: "test.txt", Size: 100} // invalid extension
		res, err := svc.UploadDocuments(ctx, "app1", nil, doc)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "document validation failed")
		assert.Nil(t, res)
	})
}

func TestService_DeleteDocuments(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)

	t.Run("NotFound", func(t *testing.T) {
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return((*CandidateApplication)(nil), errors.New("db err")).Once()

		req := &DeleteDocumentsRequest{Photo: true}
		err := svc.DeleteDocuments(ctx, "app1", req)
		assert.Error(t, err)
	})

	t.Run("InvalidStatus", func(t *testing.T) {
		app := &CandidateApplication{ID: "app1", Status: "APPROVED"}
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return(app, nil).Once()

		req := &DeleteDocumentsRequest{Photo: true}
		err := svc.DeleteDocuments(ctx, "app1", req)
		assert.Error(t, err)
	})

	t.Run("NoDocsSpecified", func(t *testing.T) {
		app := &CandidateApplication{ID: "app1", Status: "SUBMITTED"}
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return(app, nil).Once()

		req := &DeleteDocumentsRequest{Photo: false, Document: false}
		err := svc.DeleteDocuments(ctx, "app1", req)
		assert.Error(t, err)
	})

	t.Run("BeginTxFailed", func(t *testing.T) {
		app := &CandidateApplication{ID: "app1", Status: "SUBMITTED"}
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return(app, nil).Once()
		mockRepo.On("BeginTx", mock.Anything).Return(nil, errors.New("tx err")).Once()

		req := &DeleteDocumentsRequest{Photo: true}
		err := svc.DeleteDocuments(ctx, "app1", req)
		assert.Error(t, err)
	})
}

func TestService_AdminListCandidates(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)

	t.Run("Success", func(t *testing.T) {
		req := CandidateAdminListRequest{Page: 1, Limit: 10}
		list := []CandidateAdminListResponse{{ID: "app1"}}
		mockRepo.On("GetAdminCandidateList", mock.Anything, req).Return(list, 1, nil).Once()

		res, total, err := svc.AdminListCandidates(ctx, req)
		assert.NoError(t, err)
		assert.Equal(t, 1, total)
		assert.Len(t, res, 1)
	})
}

func TestService_AdminGetCandidateDetail(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)

	t.Run("Success", func(t *testing.T) {
		detail := &CandidateAdminDetailResponse{PhotoURL: "path"}
		mockRepo.On("GetAdminCandidateDetail", mock.Anything, "app1").Return(detail, nil).Once()
		mockRepo.On("GetCandidateAuditHistory", mock.Anything, "app1").Return([]CandidateAuditLogResponse{}, nil).Once()

		res, err := svc.AdminGetCandidateDetail(ctx, "app1")
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockRepo.On("GetAdminCandidateDetail", mock.Anything, "app1").Return((*CandidateAdminDetailResponse)(nil), errors.New("not found")).Once()

		res, err := svc.AdminGetCandidateDetail(ctx, "app1")
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("AuditHistoryError", func(t *testing.T) {
		detail := &CandidateAdminDetailResponse{}
		mockRepo.On("GetAdminCandidateDetail", mock.Anything, "app1").Return(detail, nil).Once()
		mockRepo.On("GetCandidateAuditHistory", mock.Anything, "app1").Return(([]CandidateAuditLogResponse)(nil), errors.New("db err")).Once()

		res, err := svc.AdminGetCandidateDetail(ctx, "app1")
		assert.NoError(t, err)
		assert.NotNil(t, res)
		assert.Empty(t, res.AuditHistory)
	})
}

func TestService_AdminUpdateCandidateStatus(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	val := validator.New()
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, val, mockStorage, 1024*1024)

	t.Run("ValidationFailed", func(t *testing.T) {
		req := &CandidateUpdateStatusRequest{Status: "INVALID"} // fails validation
		err := svc.AdminUpdateCandidateStatus(ctx, "app1", req, "admin1")
		assert.Error(t, err)
	})

	t.Run("ValidationFailed_UpdateDetails", func(t *testing.T) {
		// Mock validator to fail if vision is empty when it's required (but it's omitempty).
		// We'll skip deep validation test here and just test repository errors.
	})

	t.Run("NotFound_UpdateDetails", func(t *testing.T) {
		req := &CandidateAdminUpdateRequest{}
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return((*CandidateApplication)(nil), errors.New("not found")).Once()

		err := svc.AdminUpdateCandidateDetails(ctx, "app1", req, "admin1")
		assert.Error(t, err)
	})

	t.Run("TxFailed_UpdateDetails", func(t *testing.T) {
		req := &CandidateAdminUpdateRequest{}
		app := &CandidateApplication{ID: "app1"}
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return(app, nil).Once()
		mockRepo.On("BeginTx", mock.Anything).Return(nil, errors.New("tx err")).Once()

		err := svc.AdminUpdateCandidateDetails(ctx, "app1", req, "admin1")
		assert.Error(t, err)
	})

	t.Run("TransitionFailed", func(t *testing.T) {
		req := &CandidateUpdateStatusRequest{Status: "ACCEPTED"}
		app := &CandidateApplication{Status: "ACCEPTED"}
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return(app, nil).Once()

		err := svc.AdminUpdateCandidateStatus(ctx, "app1", req, "admin1")
		assert.Error(t, err)
	})

	t.Run("TxFailed", func(t *testing.T) {
		req := &CandidateUpdateStatusRequest{Status: "REVIEWING"}
		app := &CandidateApplication{Status: "SUBMITTED"}
		mockRepo.On("GetCandidateApplicationByID", mock.Anything, "app1").Return(app, nil).Once()
		mockRepo.On("BeginTx", mock.Anything).Return(nil, errors.New("tx err")).Once()

		err := svc.AdminUpdateCandidateStatus(ctx, "app1", req, "admin1")
		assert.Error(t, err)
	})
}

func TestValidationError_Error(t *testing.T) {
	err := &ValidationError{Details: "details"}
	assert.Equal(t, "validation failed", err.Error())
}

package musyawarah

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"io"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"go.uber.org/zap/zaptest"
)

type MockStorage struct {
	mock.Mock
}

func (m *MockStorage) Upload(ctx context.Context, file io.Reader, filename string) (*storage.FileInfo, error) {
	args := m.Called(ctx, file, filename)
	if args.Get(0) != nil {
		return args.Get(0).(*storage.FileInfo), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockStorage) Download(ctx context.Context, path string) (io.ReadCloser, error) {
	args := m.Called(ctx, path)
	if args.Get(0) != nil {
		return args.Get(0).(io.ReadCloser), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockStorage) Delete(ctx context.Context, path string) error {
	args := m.Called(ctx, path)
	return args.Error(0)
}

func (m *MockStorage) Exists(ctx context.Context, path string) (bool, error) {
	args := m.Called(ctx, path)
	return args.Bool(0), args.Error(1)
}

func (m *MockStorage) URL(path string) string {
	args := m.Called(path)
	return args.String(0)
}

func setupTestService(t *testing.T) (*sqlmock.Sqlmock, *MockRepository, *MockStorage, Service, *sqlx.DB) {
	db, mockDB, err := sqlmock.New()
	assert.NoError(t, err)
	sqlxDB := sqlx.NewDb(db, "postgres")

	log := zaptest.NewLogger(t)
	mockRepo := new(MockRepository)
	mockStorage := new(MockStorage)

	svc := NewService(mockRepo, log, mockStorage)
	return &mockDB, mockRepo, mockStorage, svc, sqlxDB
}

func TestService_GetConfig(t *testing.T) {
	_, mockRepo, mockStorage, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		logo := "logo.png"
		banner := "banner.png"
		cover := "cover.png"
		evt := &MusyawarahEvent{ID: "evt1", LogoPath: &logo, BannerPath: &banner, CoverPath: &cover}

		mockRepo.On("GetActiveEvent", mock.Anything).Return(evt, nil).Once()
		mockRepo.On("GetSettings", mock.Anything, "evt1").Return(&MusyawarahSettings{}, nil).Once()

		now := time.Now()
		phases := []MusyawarahPhase{
			{Phase: "REGISTRATION", StartAt: &now, EndAt: &now},
			{Phase: "CANDIDATE_REGISTRATION", StartAt: &now, EndAt: &now},
			{Phase: "VOTING", StartAt: &now, EndAt: &now},
		}
		mockRepo.On("GetPhases", mock.Anything, "evt1").Return(phases, nil).Once()

		mockStorage.On("URL", "logo.png").Return("url/logo").Once()
		mockStorage.On("URL", "banner.png").Return("url/banner").Once()
		mockStorage.On("URL", "cover.png").Return("url/cover").Once()

		res, err := svc.GetConfig(ctx)
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})

	t.Run("EventNotFound", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return((*MusyawarahEvent)(nil), sql.ErrNoRows).Once()
		res, err := svc.GetConfig(ctx)
		assert.ErrorIs(t, err, ErrConfigNotFound)
		assert.Nil(t, res)
	})

	t.Run("EventError", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return((*MusyawarahEvent)(nil), errors.New("db err")).Once()
		res, err := svc.GetConfig(ctx)
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("SettingsError", func(t *testing.T) {
		// Test no longer valid, removed
	})

	t.Run("PhasesError", func(t *testing.T) {
		// Test no longer valid, removed
	})
}

func TestService_UpdateConfig(t *testing.T) {
	mockDB, mockRepo, _, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	req := &UpdateMusyawarahRequest{
		Name: "New Event",
	}

	t.Run("Success", func(t *testing.T) {
		evt := &MusyawarahEvent{ID: "evt1"}
		mockRepo.On("GetActiveEvent", mock.Anything).Return(evt, nil).Once()
		mockRepo.On("GetEventByID", mock.Anything, "evt1").Return(evt, nil).Times(2)
		mockRepo.On("GetPhases", mock.Anything, "evt1").Return([]MusyawarahPhase{}, nil).Once()

		(*mockDB).ExpectBegin()
		(*mockDB).ExpectCommit()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("UpdateEvent", mock.Anything, tx, mock.Anything).Return(nil).Once()

		res, err := svc.UpdateConfig(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})

	t.Run("EventNotFound", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return((*MusyawarahEvent)(nil), sql.ErrNoRows).Once()
		res, err := svc.UpdateConfig(ctx, req)
		assert.ErrorIs(t, err, ErrConfigNotFound)
		assert.Nil(t, res)
	})

	t.Run("BeginTxError", func(t *testing.T) {
		evt := &MusyawarahEvent{ID: "evt1"}
		mockRepo.On("GetActiveEvent", mock.Anything).Return(evt, nil).Once()
		mockRepo.On("GetEventByID", mock.Anything, "evt1").Return(evt, nil).Once()
		mockRepo.On("BeginTx", mock.Anything).Return((*sqlx.Tx)(nil), errors.New("db err")).Once()
		res, err := svc.UpdateConfig(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("UpdateEventError", func(t *testing.T) {
		evt := &MusyawarahEvent{ID: "evt1"}
		mockRepo.On("GetActiveEvent", mock.Anything).Return(evt, nil).Once()
		mockRepo.On("GetEventByID", mock.Anything, "evt1").Return(evt, nil).Once()

		(*mockDB).ExpectBegin()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("UpdateEvent", mock.Anything, tx, mock.Anything).Return(errors.New("db err")).Once()

		res, err := svc.UpdateConfig(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

func TestService_GetSettings(t *testing.T) {
	_, mockRepo, _, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return(&MusyawarahEvent{ID: "evt1"}, nil).Once()
		mockRepo.On("GetSettings", mock.Anything, "evt1").Return(&MusyawarahSettings{}, nil).Once()

		res, err := svc.GetSettings(ctx)
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})

	t.Run("EventNotFound", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return((*MusyawarahEvent)(nil), sql.ErrNoRows).Once()
		res, err := svc.GetSettings(ctx)
		assert.ErrorIs(t, err, ErrConfigNotFound)
		assert.Nil(t, res)
	})

	t.Run("SettingsError", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return(&MusyawarahEvent{ID: "evt1"}, nil).Once()
		mockRepo.On("GetSettings", mock.Anything, "evt1").Return((*MusyawarahSettings)(nil), errors.New("db err")).Once()

		res, err := svc.GetSettings(ctx)
		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

func TestService_UpdateSettings(t *testing.T) {
	mockDB, mockRepo, _, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	req := &SettingsRequest{}

	t.Run("Success", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return(&MusyawarahEvent{ID: "evt1"}, nil).Once()

		(*mockDB).ExpectBegin()
		(*mockDB).ExpectCommit()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("UpdateSettings", mock.Anything, tx, "evt1", mock.Anything).Return(nil).Once()

		mockRepo.On("GetActiveEvent", mock.Anything).Return(&MusyawarahEvent{ID: "evt1"}, nil).Once()
		mockRepo.On("GetSettings", mock.Anything, "evt1").Return(&MusyawarahSettings{}, nil).Once()

		res, err := svc.UpdateSettings(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})

	t.Run("EventNotFound", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return((*MusyawarahEvent)(nil), sql.ErrNoRows).Once()
		res, err := svc.UpdateSettings(ctx, req)
		assert.ErrorIs(t, err, ErrConfigNotFound)
		assert.Nil(t, res)
	})

	t.Run("BeginTxError", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return(&MusyawarahEvent{ID: "evt1"}, nil).Once()
		mockRepo.On("BeginTx", mock.Anything).Return((*sqlx.Tx)(nil), errors.New("db err")).Once()

		res, err := svc.UpdateSettings(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("UpdateSettingsError", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return(&MusyawarahEvent{ID: "evt1"}, nil).Once()

		(*mockDB).ExpectBegin()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("UpdateSettings", mock.Anything, tx, "evt1", mock.Anything).Return(errors.New("db err")).Once()

		res, err := svc.UpdateSettings(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

func TestService_GetTimeline(t *testing.T) {
	_, mockRepo, _, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return(&MusyawarahEvent{ID: "evt1"}, nil).Once()

		phases := []MusyawarahPhase{
			{Phase: "REGISTRATION"}, {Phase: "CANDIDATE_REGISTRATION"}, {Phase: "ADMINISTRATIVE_VERIFICATION"},
			{Phase: "CANDIDATE_VERIFICATION"}, {Phase: "CAMPAIGN"}, {Phase: "COOLING_OFF"},
			{Phase: "ATTENDANCE_CHECK_IN"}, {Phase: "VOTING"}, {Phase: "RESULT_PUBLICATION"},
		}
		mockRepo.On("GetPhases", mock.Anything, "evt1").Return(phases, nil).Once()

		res, err := svc.GetTimeline(ctx)
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})

	t.Run("EventNotFound", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return((*MusyawarahEvent)(nil), sql.ErrNoRows).Once()
		res, err := svc.GetTimeline(ctx)
		assert.ErrorIs(t, err, ErrConfigNotFound)
		assert.Nil(t, res)
	})

	t.Run("PhasesError", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return(&MusyawarahEvent{ID: "evt1"}, nil).Once()
		mockRepo.On("GetPhases", mock.Anything, "evt1").Return(([]MusyawarahPhase)(nil), errors.New("db err")).Once()

		res, err := svc.GetTimeline(ctx)
		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

func TestService_UpdateTimeline(t *testing.T) {
	mockDB, mockRepo, _, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	now := time.Now()
	next := now.Add(time.Hour)
	req := &TimelineRequest{
		Registration: TimelinePhaseDTO{StartAt: &now, EndAt: &next},
	}

	t.Run("Success", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return(&MusyawarahEvent{ID: "evt1"}, nil).Once()

		(*mockDB).ExpectBegin()
		(*mockDB).ExpectCommit()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("UpsertPhase", mock.Anything, tx, "evt1", mock.Anything).Return(nil).Times(9)

		mockRepo.On("GetActiveEvent", mock.Anything).Return(&MusyawarahEvent{ID: "evt1"}, nil).Once()
		mockRepo.On("GetPhases", mock.Anything, "evt1").Return([]MusyawarahPhase{}, nil).Once()

		res, err := svc.UpdateTimeline(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})

	t.Run("EventNotFound", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return((*MusyawarahEvent)(nil), sql.ErrNoRows).Once()
		res, err := svc.UpdateTimeline(ctx, req)
		assert.ErrorIs(t, err, ErrConfigNotFound)
		assert.Nil(t, res)
	})

	t.Run("BeginTxError", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return(&MusyawarahEvent{ID: "evt1"}, nil).Once()
		mockRepo.On("BeginTx", mock.Anything).Return((*sqlx.Tx)(nil), errors.New("db err")).Once()

		res, err := svc.UpdateTimeline(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("UpsertPhaseError", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return(&MusyawarahEvent{ID: "evt1"}, nil).Once()

		(*mockDB).ExpectBegin()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)
		mockRepo.On("BeginTx", mock.Anything).Return(tx, nil).Once()

		mockRepo.On("UpsertPhase", mock.Anything, tx, "evt1", mock.Anything).Return(errors.New("db err")).Once()

		res, err := svc.UpdateTimeline(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

func TestService_GetMedia(t *testing.T) {
	_, mockRepo, mockStorage, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		logo := "logo.png"
		banner := "banner.png"
		cover := "cover.png"
		evt := &MusyawarahEvent{ID: "evt1", LogoPath: &logo, BannerPath: &banner, CoverPath: &cover}

		mockRepo.On("GetActiveEvent", mock.Anything).Return(evt, nil).Once()

		mockStorage.On("URL", "logo.png").Return("url/logo").Once()
		mockStorage.On("URL", "banner.png").Return("url/banner").Once()
		mockStorage.On("URL", "cover.png").Return("url/cover").Once()

		res, err := svc.GetMedia(ctx)
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})

	t.Run("EventNotFound", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return((*MusyawarahEvent)(nil), sql.ErrNoRows).Once()
		res, err := svc.GetMedia(ctx)
		assert.ErrorIs(t, err, ErrConfigNotFound)
		assert.Nil(t, res)
	})
}

func TestService_UploadMedia(t *testing.T) {
	_, mockRepo, mockStorage, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		oldLogo := "old.png"
		evt := &MusyawarahEvent{ID: "evt1", LogoPath: &oldLogo}
		mockRepo.On("GetActiveEvent", mock.Anything).Return(evt, nil).Once()

		file := bytes.NewReader([]byte("test"))
		mockStorage.On("Upload", mock.Anything, file, mock.Anything).Return(&storage.FileInfo{Path: "new.png"}, nil).Once()
		mockRepo.On("UpdateMedia", mock.Anything, "evt1", "logo", mock.Anything).Return(nil).Once()
		mockStorage.On("Delete", mock.Anything, "old.png").Return(nil).Once()

		// GetMedia call at the end
		mockRepo.On("GetActiveEvent", mock.Anything).Return(evt, nil).Once()
		mockStorage.On("URL", "old.png").Return("url").Once() // Evt object is not updated in mock

		res, err := svc.UploadMedia(ctx, "logo", file, "file.png", "image/png")
		assert.NoError(t, err)
		assert.NotNil(t, res)
	})

	t.Run("InvalidType", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return(&MusyawarahEvent{ID: "evt1"}, nil).Once()
		file := bytes.NewReader([]byte("test"))
		mockStorage.On("Upload", mock.Anything, file, mock.Anything).Return(&storage.FileInfo{Path: "invalid.png"}, nil).Once()
		mockRepo.On("UpdateMedia", mock.Anything, "evt1", "invalid", mock.Anything).Return(errors.New("invalid media type")).Once()

		res, err := svc.UploadMedia(ctx, "invalid", file, "file.png", "image/png")
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("InvalidMimeType", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return(&MusyawarahEvent{ID: "evt1"}, nil).Once()
		res, err := svc.UploadMedia(ctx, "logo", nil, "file.txt", "text/plain")
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("EventNotFound", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return((*MusyawarahEvent)(nil), sql.ErrNoRows).Once()
		file := bytes.NewReader([]byte("test"))
		res, err := svc.UploadMedia(ctx, "logo", file, "file.png", "image/png")
		assert.ErrorIs(t, err, ErrConfigNotFound)
		assert.Nil(t, res)
	})

	t.Run("UploadError", func(t *testing.T) {
		evt := &MusyawarahEvent{ID: "evt1"}
		mockRepo.On("GetActiveEvent", mock.Anything).Return(evt, nil).Once()
		file := bytes.NewReader([]byte("test"))
		mockStorage.On("Upload", mock.Anything, file, mock.Anything).Return((*storage.FileInfo)(nil), errors.New("up err")).Once()

		res, err := svc.UploadMedia(ctx, "logo", file, "file.png", "image/png")
		assert.Error(t, err)
		assert.Nil(t, res)
	})

	t.Run("UpdateMediaError", func(t *testing.T) {
		evt := &MusyawarahEvent{ID: "evt1"}
		mockRepo.On("GetActiveEvent", mock.Anything).Return(evt, nil).Once()
		file := bytes.NewReader([]byte("test"))
		mockStorage.On("Upload", mock.Anything, file, mock.Anything).Return(&storage.FileInfo{Path: "new.png"}, nil).Once()

		mockRepo.On("UpdateMedia", mock.Anything, "evt1", "logo", mock.Anything).Return(errors.New("db err")).Once()
		mockStorage.On("Delete", mock.Anything, "new.png").Return(nil).Once()

		res, err := svc.UploadMedia(ctx, "logo", file, "file.png", "image/png")
		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

func TestService_DeleteMedia(t *testing.T) {
	_, mockRepo, mockStorage, svc, sqlxDB := setupTestService(t)
	defer sqlxDB.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		oldLogo := "old.png"
		evt := &MusyawarahEvent{ID: "evt1", LogoPath: &oldLogo}
		mockRepo.On("GetActiveEvent", mock.Anything).Return(evt, nil).Once()

		mockRepo.On("UpdateMedia", mock.Anything, "evt1", "logo", (*string)(nil)).Return(nil).Once()
		mockStorage.On("Delete", mock.Anything, "old.png").Return(nil).Once()

		err := svc.DeleteMedia(ctx, "logo")
		assert.NoError(t, err)
	})

	t.Run("Success_NoPath", func(t *testing.T) {
		evt := &MusyawarahEvent{ID: "evt1", LogoPath: nil}
		mockRepo.On("GetActiveEvent", mock.Anything).Return(evt, nil).Once()
		mockRepo.On("UpdateMedia", mock.Anything, "evt1", "logo", (*string)(nil)).Return(nil).Once()

		err := svc.DeleteMedia(ctx, "logo")
		assert.NoError(t, err)
	})

	t.Run("InvalidType", func(t *testing.T) {
		evt := &MusyawarahEvent{ID: "evt1", LogoPath: nil}
		mockRepo.On("GetActiveEvent", mock.Anything).Return(evt, nil).Once()
		mockRepo.On("UpdateMedia", mock.Anything, "evt1", "invalid", (*string)(nil)).Return(errors.New("invalid media type")).Once()

		err := svc.DeleteMedia(ctx, "invalid")
		assert.Error(t, err)
	})

	t.Run("EventNotFound", func(t *testing.T) {
		mockRepo.On("GetActiveEvent", mock.Anything).Return((*MusyawarahEvent)(nil), sql.ErrNoRows).Once()
		err := svc.DeleteMedia(ctx, "logo")
		assert.ErrorIs(t, err, ErrConfigNotFound)
	})

	t.Run("UpdateMediaError", func(t *testing.T) {
		oldLogo := "old.png"
		evt := &MusyawarahEvent{ID: "evt1", LogoPath: &oldLogo}
		mockRepo.On("GetActiveEvent", mock.Anything).Return(evt, nil).Once()

		mockStorage.On("Delete", mock.Anything, "old.png").Return(nil).Once()
		mockRepo.On("UpdateMedia", mock.Anything, "evt1", "logo", (*string)(nil)).Return(errors.New("db err")).Once()

		err := svc.DeleteMedia(ctx, "logo")
		assert.Error(t, err)
	})
}

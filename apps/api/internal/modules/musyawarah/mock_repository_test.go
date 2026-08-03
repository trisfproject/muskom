package musyawarah

import (
	"context"

	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/mock"
)

type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) SoftDeleteEvent(ctx context.Context, id string, deletedBy string) error {
	args := m.Called(ctx, id, deletedBy)
	return args.Error(0)
}

func (m *MockRepository) ListEvents(ctx context.Context) ([]MusyawarahEvent, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).([]MusyawarahEvent), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) GetEventByID(ctx context.Context, id string) (*MusyawarahEvent, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahEvent), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) GetEventBySlug(ctx context.Context, slug string) (*MusyawarahEvent, error) {
	args := m.Called(ctx, slug)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahEvent), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) CreateEvent(ctx context.Context, e *MusyawarahEvent) (*MusyawarahEvent, error) {
	args := m.Called(ctx, e)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahEvent), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) DeactivateAll(ctx context.Context, tx *sqlx.Tx) error {
	args := m.Called(ctx, tx)
	return args.Error(0)
}

func (m *MockRepository) GetActiveEvent(ctx context.Context) (*MusyawarahEvent, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahEvent), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) GetSettings(ctx context.Context, eventID string) (*MusyawarahSettings, error) {
	args := m.Called(ctx, eventID)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahSettings), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) GetPhases(ctx context.Context, eventID string) ([]MusyawarahPhase, error) {
	args := m.Called(ctx, eventID)
	if args.Get(0) != nil {
		return args.Get(0).([]MusyawarahPhase), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) SetActive(ctx context.Context, tx *sqlx.Tx, id string) error {
	args := m.Called(ctx, tx, id)
	return args.Error(0)
}

func (m *MockRepository) ArchiveEvent(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockRepository) UpdateEvent(ctx context.Context, tx *sqlx.Tx, e *MusyawarahEvent) error {
	args := m.Called(ctx, tx, e)
	return args.Error(0)
}

func (m *MockRepository) UpdateSettings(ctx context.Context, tx *sqlx.Tx, eventID string, s *MusyawarahSettings) error {
	args := m.Called(ctx, tx, eventID, s)
	return args.Error(0)
}

func (m *MockRepository) UpdateMedia(ctx context.Context, eventID string, mediaType string, path *string) error {
	args := m.Called(ctx, eventID, mediaType, path)
	return args.Error(0)
}

func (m *MockRepository) UpsertPhase(ctx context.Context, tx *sqlx.Tx, eventID string, p *MusyawarahPhase) error {
	args := m.Called(ctx, tx, eventID, p)
	return args.Error(0)
}

func (m *MockRepository) BeginTx(ctx context.Context) (*sqlx.Tx, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).(*sqlx.Tx), args.Error(1)
	}
	return nil, args.Error(1)
}

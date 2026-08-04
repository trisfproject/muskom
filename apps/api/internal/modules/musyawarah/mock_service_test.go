package musyawarah

import (
	"context"
	"io"

	"github.com/stretchr/testify/mock"
)

type MockService struct {
	mock.Mock
}

func (m *MockService) GetConfig(ctx context.Context) (*MusyawarahResponse, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) UpdateConfig(ctx context.Context, req *UpdateMusyawarahRequest) (*MusyawarahResponse, error) {
	args := m.Called(ctx, req)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) GetSettings(ctx context.Context) (*SettingsResponse, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).(*SettingsResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) UpdateSettings(ctx context.Context, req *SettingsRequest) (*SettingsResponse, error) {
	args := m.Called(ctx, req)
	if args.Get(0) != nil {
		return args.Get(0).(*SettingsResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) GetTimeline(ctx context.Context) (*TimelineResponse, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).(*TimelineResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) UpdateTimeline(ctx context.Context, req *TimelineRequest) (*TimelineResponse, error) {
	args := m.Called(ctx, req)
	if args.Get(0) != nil {
		return args.Get(0).(*TimelineResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) GetMedia(ctx context.Context) (*MediaResponse, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).(*MediaResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) UploadMedia(ctx context.Context, mediaType string, file io.Reader, filename string, contentType string) (*MediaResponse, error) {
	args := m.Called(ctx, mediaType, file, filename, contentType)
	if args.Get(0) != nil {
		return args.Get(0).(*MediaResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) DeleteMedia(ctx context.Context, mediaType string) error {
	args := m.Called(ctx, mediaType)
	return args.Error(0)
}

func (m *MockService) ListAll(ctx context.Context) ([]MusyawarahListItem, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).([]MusyawarahListItem), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) GetByID(ctx context.Context, id string) (*MusyawarahResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) Create(ctx context.Context, req *CreateMusyawarahRequest) (*MusyawarahResponse, error) {
	args := m.Called(ctx, req)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) UpdateByID(ctx context.Context, id string, req *UpdateMusyawarahRequest) (*MusyawarahResponse, error) {
	args := m.Called(ctx, id, req)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) Activate(ctx context.Context, id string) (*MusyawarahResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) Deactivate(ctx context.Context, id string) (*MusyawarahResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) Archive(ctx context.Context, id string) (*MusyawarahResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) Publish(ctx context.Context, id string) (*MusyawarahResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockService) Clone(ctx context.Context, id string) (*MusyawarahResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*MusyawarahResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

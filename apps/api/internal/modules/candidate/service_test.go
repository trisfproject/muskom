package candidate

import (
	"context"
	"io"
	"testing"
	"time"

	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"go.uber.org/zap"
)

// mockAuditService implements audit.AuditService
type mockAuditService struct {
	LogActivityAsyncFunc func(ctx context.Context, entry audit.AuditEntry)
	SearchFunc           func(ctx context.Context, filter audit.AuditFilter, operatorID string) ([]audit.AuditEntry, int, error)
	GetByIDFunc          func(ctx context.Context, id string, operatorID string) (*audit.AuditEntry, error)
}

func (m *mockAuditService) LogActivityAsync(ctx context.Context, entry audit.AuditEntry) {
	if m.LogActivityAsyncFunc != nil {
		m.LogActivityAsyncFunc(ctx, entry)
	}
}

func (m *mockAuditService) Search(ctx context.Context, filter audit.AuditFilter, operatorID string) ([]audit.AuditEntry, int, error) {
	if m.SearchFunc != nil {
		return m.SearchFunc(ctx, filter, operatorID)
	}
	return nil, 0, nil
}

func (m *mockAuditService) GetByID(ctx context.Context, id string, operatorID string) (*audit.AuditEntry, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, id, operatorID)
	}
	return nil, nil
}

// mockStorage implements storage.Storage
type mockStorage struct {
	UploadFunc   func(ctx context.Context, r io.Reader, path string) (*storage.FileInfo, error)
	DownloadFunc func(ctx context.Context, path string) (io.ReadCloser, error)
	DeleteFunc   func(ctx context.Context, path string) error
	ExistsFunc   func(ctx context.Context, path string) (bool, error)
	URLFunc      func(path string) string
}

func (m *mockStorage) Upload(ctx context.Context, r io.Reader, path string) (*storage.FileInfo, error) {
	if m.UploadFunc != nil {
		return m.UploadFunc(ctx, r, path)
	}
	return &storage.FileInfo{Path: path, Size: 100, MimeType: "application/pdf"}, nil
}

func (m *mockStorage) Download(ctx context.Context, path string) (io.ReadCloser, error) {
	if m.DownloadFunc != nil {
		return m.DownloadFunc(ctx, path)
	}
	return nil, nil
}

func (m *mockStorage) Delete(ctx context.Context, path string) error {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(ctx, path)
	}
	return nil
}

func (m *mockStorage) Exists(ctx context.Context, path string) (bool, error) {
	if m.ExistsFunc != nil {
		return m.ExistsFunc(ctx, path)
	}
	return true, nil
}

func (m *mockStorage) URL(path string) string {
	if m.URLFunc != nil {
		return m.URLFunc(path)
	}
	return "http://mock/" + path
}

func TestService_Create(t *testing.T) {
	repo := &MockRepository{
		CreateFunc: func(ctx context.Context, c *Candidate) error {
			c.ID = "test-uuid"
			c.CreatedAt = time.Now()
			return nil
		},
		GetByIDFunc: func(ctx context.Context, id string) (*Candidate, error) {
			return &Candidate{
				ID:                 "test-uuid",
				MusyawarahID:       "c1a25176-0bf1-477c-9b55-d36cda7a7605",
				RegistrationNumber: "CAN-M-1-ABC",
				FullName:           "John Doe",
				Email:              "john@example.com",
				Phone:              "123",

				Status: StatusDraft,
			}, nil
		},
	}
	auditSvc := &mockAuditService{}
	st := &mockStorage{}
	cfg := &config.Config{JWTSecret: "secret"}
	log := zap.NewNop()

	svc := NewService(repo, auditSvc, st, 5*1024*1024, cfg, log)

	req := CreateCandidateRequest{
		MusyawarahID: "c1a25176-0bf1-477c-9b55-d36cda7a7605",
		FullName:     "John Doe",
		Email:        "john@example.com",
		Phone:        "123",
	}

	res, err := svc.Create(context.Background(), req)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if res == nil {
		t.Fatalf("expected result, got nil")
	}
	if res.ID != "test-uuid" {
		t.Errorf("expected id 'test-uuid', got %s", res.ID)
	}
}

func TestService_Update(t *testing.T) {
	repo := &MockRepository{
		GetByIDFunc: func(ctx context.Context, id string) (*Candidate, error) {
			return &Candidate{
				ID:     id,
				Status: StatusDraft,
			}, nil
		},
		UpdateFunc: func(ctx context.Context, c *Candidate) error {
			return nil
		},
	}
	auditSvc := &mockAuditService{}
	st := &mockStorage{}
	cfg := &config.Config{}
	log := zap.NewNop()

	svc := NewService(repo, auditSvc, st, 5*1024*1024, cfg, log)

	req := UpdateCandidateRequest{
		FullName: "Jane Doe",
	}

	res, err := svc.Update(context.Background(), "test-uuid", req)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if res == nil {
		t.Fatalf("expected result, got nil")
	}
}

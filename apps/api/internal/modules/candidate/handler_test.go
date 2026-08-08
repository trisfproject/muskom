package candidate

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

// mockService implements Service interface for Handler tests
type mockService struct {
	Service
	CreateFunc              func(req CreateCandidateRequest) (*CandidateResponse, error)
	GetByIDFunc             func(id string) (*CandidateResponse, error)
	AdminListCandidatesFunc func(status, search string) ([]CandidateResponse, error)
}

func (m *mockService) Create(ctx context.Context, req CreateCandidateRequest) (*CandidateResponse, error) {
	if m.CreateFunc != nil {
		return m.CreateFunc(req)
	}
	return nil, nil
}

func (m *mockService) GetByID(ctx context.Context, id string) (*CandidateResponse, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(id)
	}
	return nil, nil
}

func (m *mockService) AdminListCandidates(ctx context.Context, status, search string) ([]CandidateResponse, error) {
	if m.AdminListCandidatesFunc != nil {
		return m.AdminListCandidatesFunc(status, search)
	}
	return nil, nil
}

func setupTestApp(svc Service) *fiber.App {
	app := fiber.New()
	val := validator.New()
	log := zap.NewNop()
	h := NewAdminHandler(svc, val, log)

	app.Post("/candidates", h.CreateCandidate)
	app.Get("/candidates/export/csv", h.ExportCSV)
	app.Get("/candidates/:id", h.GetCandidateDetail)
	return app
}

func TestHandler_Create_Success(t *testing.T) {
	svc := &mockService{
		CreateFunc: func(req CreateCandidateRequest) (*CandidateResponse, error) {
			return &CandidateResponse{
				ID:    "123",
				Email: req.Email,
			}, nil
		},
	}
	app := setupTestApp(svc)

	reqBody := CreateCandidateRequest{
		FullName: "John Doe",
		Email:    "test@test.com",
		Phone:    "123",
	}
	bodyBytes, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/candidates", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != fiber.StatusCreated {
		t.Errorf("expected status 201, got %d", resp.StatusCode)
	}
}

func TestHandler_Create_ValidationError(t *testing.T) {
	svc := &mockService{}
	app := setupTestApp(svc)

	reqBody := CreateCandidateRequest{
		// Missing required fields
		Email: "invalid-email",
	}
	bodyBytes, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/candidates", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != fiber.StatusBadRequest {
		t.Errorf("expected status 400, got %d", resp.StatusCode)
	}
}

func TestHandler_ExportCSV(t *testing.T) {
	num := 1
	nick := "John"
	company := "Tech Corp"
	title := "CTO"
	vision := "Vision"
	mission := "Mission"

	svc := &mockService{
		AdminListCandidatesFunc: func(status, search string) ([]CandidateResponse, error) {
			return []CandidateResponse{
				{
					CandidateNumber: &num,
					FullName:        "John Doe",
					Nickname:        &nick,
					Email:           "john@example.com",
					Phone:           "08123456789",
					CompanyName:     &company,
					JobTitle:        &title,
					Vision:          &vision,
					Mission:         &mission,
					Status:          "Verified",
					CreatedAt:       time.Date(2026, 1, 1, 10, 0, 0, 0, time.UTC),
				},
			}, nil
		},
	}
	app := setupTestApp(svc)

	req := httptest.NewRequest("GET", "/candidates/export/csv?status=Verified&search=John", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != fiber.StatusOK {
		t.Errorf("expected status 200, got %d", resp.StatusCode)
	}
	if ct := resp.Header.Get("Content-Type"); ct != "text/csv; charset=utf-8" {
		t.Errorf("expected content type text/csv; charset=utf-8, got %s", ct)
	}
	if cd := resp.Header.Get("Content-Disposition"); cd != "attachment; filename=\"data-kandidat.csv\"" {
		t.Errorf("expected content disposition attachment; filename=\"data-kandidat.csv\", got %s", cd)
	}
}

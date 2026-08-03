package candidate

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

// mockService implements Service interface for Handler tests
type mockService struct {
	Service
	CreateFunc  func(req CreateCandidateRequest) (*CandidateResponse, error)
	GetByIDFunc func(id string) (*CandidateResponse, error)
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

func setupTestApp(svc Service) *fiber.App {
	app := fiber.New()
	val := validator.New()
	log := zap.NewNop()
	h := NewHandler(svc, val, log)

	app.Post("/candidates", h.Create)
	app.Get("/candidates/:id", h.GetByID)
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
		MusyawarahID: "c1a25176-0bf1-477c-9b55-d36cda7a7605",
		FullName:     "John Doe",
		Email:        "test@test.com",
		Phone:        "123",
		Gender:       "MALE",
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

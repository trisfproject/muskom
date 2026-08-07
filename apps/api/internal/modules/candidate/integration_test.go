package candidate

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

func TestIntegration_CandidateFlow(t *testing.T) {
	// Simple in-memory state for mock
	mockCandidate := &Candidate{
		MusyawarahID:       "c1a25176-0bf1-477c-9b55-d36cda7a7605",
		RegistrationNumber: "CAN-M-1-ABC",
		FullName:           "John Doe",
		Email:              "john@example.com",
		Phone:              "123",

		Status: StatusDraft,
	}

	// Setup dependencies
	repo := &MockRepository{
		CreateFunc: func(ctx context.Context, c *Candidate) error {
			c.ID = "test-candidate-id"
			c.RegistrationNumber = "CAN-M-1-ABC"
			c.Status = StatusDraft
			c.CreatedAt = time.Now()
			mockCandidate.ID = c.ID
			return nil
		},
		GetByIDFunc: func(ctx context.Context, id string) (*Candidate, error) {
			return mockCandidate, nil
		},
		UpdateFunc: func(ctx context.Context, c *Candidate) error {
			mockCandidate.FullName = c.FullName
			mockCandidate.Status = c.Status
			return nil
		},
		AdminUpdateStatusFunc: func(ctx context.Context, id string, status string, notes *string) error {
			mockCandidate.Status = status
			return nil
		},
		AdminUpdatePublicationStatusFunc: func(ctx context.Context, id string, status string) error {
			mockCandidate.PublicationStatus = status
			return nil
		},
	}
	auditSvc := &mockAuditService{}
	st := &mockStorage{}
	cfg := &config.Config{JWTSecret: "secret"}
	log := zap.NewNop()

	svc := NewService(repo, auditSvc, st, 5*1024*1024, cfg, log)

	val := validator.New()
	adminHandler := NewAdminHandler(svc, val, log)

	app := fiber.New()

	// Simulate auth context for all routes
	app.Use(func(c fiber.Ctx) error {
		c.Locals("user_id", "admin-1")
		return c.Next()
	})

	app.Post("/candidates", adminHandler.CreateCandidate)
	app.Put("/candidates/:id", adminHandler.UpdateCandidate)
	app.Patch("/admin/candidates/:id/verify", adminHandler.VerifyCandidate)
	app.Post("/admin/candidates/:id/publish", adminHandler.PublishCandidate)

	// 1. Create Candidate
	reqBody := CreateCandidateRequest{
		MusyawarahID: "c1a25176-0bf1-477c-9b55-d36cda7a7605",
		FullName:     "John Doe",
		Email:        "john@example.com",
		Phone:        "123",
	}
	bodyBytes, _ := json.Marshal(reqBody)
	req1 := httptest.NewRequest("POST", "/candidates", bytes.NewReader(bodyBytes))
	req1.Header.Set("Content-Type", "application/json")
	resp1, err := app.Test(req1)
	if err != nil || resp1.StatusCode != fiber.StatusCreated {
		t.Fatalf("step 1 create failed: %v", resp1.StatusCode)
	}

	// 2. Submit Candidate
	statusSubmit := StatusSubmitted
	reqUpdate := UpdateCandidateRequest{
		FullName: "John Doe Updated",
		Email:    "john@example.com",
		Phone:    "123",

		Status: &statusSubmit,
	}
	bodyBytes2, _ := json.Marshal(reqUpdate)
	req2 := httptest.NewRequest("PUT", "/candidates/test-candidate-id", bytes.NewReader(bodyBytes2))
	req2.Header.Set("Content-Type", "application/json")
	resp2, err := app.Test(req2)
	if err != nil || resp2.StatusCode != fiber.StatusOK {
		t.Fatalf("step 2 update failed: %v", resp2.StatusCode)
	}

	// 3a. Admin Verify - Under Review
	reqVerify1 := AdminVerifyCandidateRequest{
		Status: StatusUnderReview,
	}
	bodyBytes3a, _ := json.Marshal(reqVerify1)
	req3a := httptest.NewRequest("PATCH", "/admin/candidates/test-candidate-id/verify", bytes.NewReader(bodyBytes3a))
	req3a.Header.Set("Content-Type", "application/json")

	resp3a, err := app.Test(req3a)
	if err != nil || resp3a.StatusCode != fiber.StatusOK {
		var buf bytes.Buffer
		buf.ReadFrom(resp3a.Body)
		t.Fatalf("step 3a verify failed: %v body: %s", resp3a.StatusCode, buf.String())
	}

	// 3b. Admin Verify - Verified
	reqVerify2 := AdminVerifyCandidateRequest{
		Status: StatusVerified,
	}
	bodyBytes3b, _ := json.Marshal(reqVerify2)
	req3b := httptest.NewRequest("PATCH", "/admin/candidates/test-candidate-id/verify", bytes.NewReader(bodyBytes3b))
	req3b.Header.Set("Content-Type", "application/json")

	resp3b, err := app.Test(req3b)
	if err != nil || resp3b.StatusCode != fiber.StatusOK {
		var buf bytes.Buffer
		buf.ReadFrom(resp3b.Body)
		t.Fatalf("step 3b verify failed: %v body: %s", resp3b.StatusCode, buf.String())
	}

	// 4. Admin Publish
	req4 := httptest.NewRequest("POST", "/admin/candidates/test-candidate-id/publish", nil)
	resp4, err := app.Test(req4)
	if err != nil || resp4.StatusCode != fiber.StatusOK {
		var buf bytes.Buffer
		buf.ReadFrom(resp4.Body)
		t.Fatalf("step 4 publish failed: %v body: %s", resp4.StatusCode, buf.String())
	}
}

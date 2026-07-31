package verification

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestHandler_ListVerifications(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Get("/verification", handler.ListVerifications)

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("ListVerifications", mock.Anything, mock.Anything).Return([]VerificationItemResponse{}, 0, nil).Once()
		req := httptest.NewRequest("GET", "/verification", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InvalidQuery", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/verification?page=invalid", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("ValidationError", func(t *testing.T) {
		mockSvc.On("ListVerifications", mock.Anything, mock.Anything).Return(([]VerificationItemResponse)(nil), 0, &ValidationError{}).Once()
		req := httptest.NewRequest("GET", "/verification", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		mockSvc.On("ListVerifications", mock.Anything, mock.Anything).Return(([]VerificationItemResponse)(nil), 0, errors.New("db err")).Once()
		req := httptest.NewRequest("GET", "/verification", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_GetSummary(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Get("/verification/summary", handler.GetSummary)

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("GetSummary", mock.Anything).Return(&VerificationSummaryResponse{}, nil).Once()
		req := httptest.NewRequest("GET", "/verification/summary", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		mockSvc.On("GetSummary", mock.Anything).Return((*VerificationSummaryResponse)(nil), errors.New("db err")).Once()
		req := httptest.NewRequest("GET", "/verification/summary", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_GetParticipant(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Get("/verification/participant/:id", handler.GetParticipant)
	app.Get("/verification/participant/", handler.GetParticipant)

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("GetParticipantVerification", mock.Anything, "reg1").Return(&ParticipantDetailResponse{}, nil).Once()
		req := httptest.NewRequest("GET", "/verification/participant/reg1", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockSvc.On("GetParticipantVerification", mock.Anything, "reg1").Return((*ParticipantDetailResponse)(nil), errors.New("not found")).Once()
		req := httptest.NewRequest("GET", "/verification/participant/reg1", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("MissingID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/verification/participant/", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})
}

func TestHandler_VerifyParticipant(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Use(func(c fiber.Ctx) error {
		c.Locals("user_id", "admin1")
		return c.Next()
	})
	app.Patch("/verification/participant/:id", handler.VerifyParticipant)
	app.Patch("/verification/participant/", handler.VerifyParticipant)

	t.Run("Success", func(t *testing.T) {
		reqBody := VerifyParticipantRequest{Status: "APPROVED"}
		body, _ := json.Marshal(reqBody)
		mockSvc.On("VerifyParticipant", mock.Anything, "reg1", &reqBody, "admin1").Return(nil).Once()

		req := httptest.NewRequest("PATCH", "/verification/participant/reg1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InvalidBody", func(t *testing.T) {
		req := httptest.NewRequest("PATCH", "/verification/participant/reg1", bytes.NewReader([]byte("{invalid}")))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("MissingID", func(t *testing.T) {
		req := httptest.NewRequest("PATCH", "/verification/participant/", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("ValidationError", func(t *testing.T) {
		reqBody := VerifyParticipantRequest{Status: "APPROVED"}
		body, _ := json.Marshal(reqBody)
		mockSvc.On("VerifyParticipant", mock.Anything, "reg1", &reqBody, "admin1").Return(&ValidationError{}).Once()

		req := httptest.NewRequest("PATCH", "/verification/participant/reg1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("Conflict", func(t *testing.T) {
		reqBody := VerifyParticipantRequest{Status: "APPROVED"}
		body, _ := json.Marshal(reqBody)
		mockSvc.On("VerifyParticipant", mock.Anything, "reg1", &reqBody, "admin1").Return(errors.New("cannot verify participant: invalid state transition, status is not PENDING")).Once()

		req := httptest.NewRequest("PATCH", "/verification/participant/reg1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 409, resp.StatusCode)
	})
	
	t.Run("InternalError", func(t *testing.T) {
		reqBody := VerifyParticipantRequest{Status: "APPROVED"}
		body, _ := json.Marshal(reqBody)
		mockSvc.On("VerifyParticipant", mock.Anything, "reg1", &reqBody, "admin1").Return(errors.New("db err")).Once()

		req := httptest.NewRequest("PATCH", "/verification/participant/reg1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_VerifyParticipant_Unauthorized(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Patch("/verification/participant/:id", handler.VerifyParticipant)

	t.Run("Unauthorized", func(t *testing.T) {
		reqBody := VerifyParticipantRequest{Status: "APPROVED"}
		body, _ := json.Marshal(reqBody)
		req := httptest.NewRequest("PATCH", "/verification/participant/reg1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 401, resp.StatusCode)
	})
}

func TestHandler_GetCandidate(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Get("/verification/candidate/:id", handler.GetCandidate)
	app.Get("/verification/candidate/", handler.GetCandidate)

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("GetCandidateVerification", mock.Anything, "ca1").Return(&CandidateDetailResponse{}, nil).Once()
		req := httptest.NewRequest("GET", "/verification/candidate/ca1", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockSvc.On("GetCandidateVerification", mock.Anything, "ca1").Return((*CandidateDetailResponse)(nil), errors.New("not found")).Once()
		req := httptest.NewRequest("GET", "/verification/candidate/ca1", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("MissingID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/verification/candidate/", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})
}

func TestHandler_VerifyCandidate(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Use(func(c fiber.Ctx) error {
		c.Locals("user_id", "admin1")
		return c.Next()
	})
	app.Patch("/verification/candidate/:id", handler.VerifyCandidate)
	app.Patch("/verification/candidate/", handler.VerifyCandidate)

	t.Run("Success", func(t *testing.T) {
		reqBody := VerifyCandidateRequest{Status: "REVIEWING"}
		body, _ := json.Marshal(reqBody)
		mockSvc.On("VerifyCandidate", mock.Anything, "ca1", &reqBody, "admin1").Return(nil).Once()

		req := httptest.NewRequest("PATCH", "/verification/candidate/ca1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InvalidBody", func(t *testing.T) {
		req := httptest.NewRequest("PATCH", "/verification/candidate/ca1", bytes.NewReader([]byte("{invalid}")))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("MissingID", func(t *testing.T) {
		req := httptest.NewRequest("PATCH", "/verification/candidate/", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})
	
	t.Run("ValidationError", func(t *testing.T) {
		reqBody := VerifyCandidateRequest{Status: "REVIEWING"}
		body, _ := json.Marshal(reqBody)
		mockSvc.On("VerifyCandidate", mock.Anything, "ca1", &reqBody, "admin1").Return(&ValidationError{}).Once()

		req := httptest.NewRequest("PATCH", "/verification/candidate/ca1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})
	
	t.Run("Conflict", func(t *testing.T) {
		reqBody := VerifyCandidateRequest{Status: "REVIEWING"}
		body, _ := json.Marshal(reqBody)
		mockSvc.On("VerifyCandidate", mock.Anything, "ca1", &reqBody, "admin1").Return(errors.New("cannot verify candidate: SUBMITTED must transition to REVIEWING first")).Once()

		req := httptest.NewRequest("PATCH", "/verification/candidate/ca1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 409, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		reqBody := VerifyCandidateRequest{Status: "REVIEWING"}
		body, _ := json.Marshal(reqBody)
		mockSvc.On("VerifyCandidate", mock.Anything, "ca1", &reqBody, "admin1").Return(errors.New("db err")).Once()

		req := httptest.NewRequest("PATCH", "/verification/candidate/ca1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_VerifyCandidate_Unauthorized(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Patch("/verification/candidate/:id", handler.VerifyCandidate)

	t.Run("Unauthorized", func(t *testing.T) {
		reqBody := VerifyCandidateRequest{Status: "REVIEWING"}
		body, _ := json.Marshal(reqBody)
		req := httptest.NewRequest("PATCH", "/verification/candidate/ca1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 401, resp.StatusCode)
	})
}

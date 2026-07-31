package candidate

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"mime/multipart"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockService for handler tests
type MockService struct {
	mock.Mock
}

func (m *MockService) RegisterCandidate(ctx context.Context, req *RegisterCandidateRequest) (*RegisterCandidateResponse, error) {
	args := m.Called(ctx, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*RegisterCandidateResponse), args.Error(1)
}

func (m *MockService) GetCandidateStatus(ctx context.Context, candidateCode string) (*CandidateStatusResponse, error) {
	args := m.Called(ctx, candidateCode)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*CandidateStatusResponse), args.Error(1)
}

func (m *MockService) UploadDocuments(ctx context.Context, candidateCode string, photo, document *multipart.FileHeader) (*CandidateDocumentsResponse, error) {
	args := m.Called(ctx, candidateCode, photo, document)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*CandidateDocumentsResponse), args.Error(1)
}

func (m *MockService) GetDocuments(ctx context.Context, candidateCode string) (*CandidateDocumentsResponse, error) {
	args := m.Called(ctx, candidateCode)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*CandidateDocumentsResponse), args.Error(1)
}

func (m *MockService) DeleteDocuments(ctx context.Context, candidateCode string, req *DeleteDocumentsRequest) error {
	args := m.Called(ctx, candidateCode, req)
	return args.Error(0)
}

func (m *MockService) AdminListCandidates(ctx context.Context, filter CandidateAdminListRequest) ([]CandidateAdminListResponse, int, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]CandidateAdminListResponse), args.Int(1), args.Error(2)
}

func (m *MockService) AdminGetCandidateDetail(ctx context.Context, candidateCode string) (*CandidateAdminDetailResponse, error) {
	args := m.Called(ctx, candidateCode)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*CandidateAdminDetailResponse), args.Error(1)
}

func (m *MockService) AdminUpdateCandidateDetails(ctx context.Context, candidateCode string, req *CandidateAdminUpdateRequest, reviewerID string) error {
	args := m.Called(ctx, candidateCode, req, reviewerID)
	return args.Error(0)
}

func (m *MockService) AdminUpdateCandidateStatus(ctx context.Context, candidateCode string, req *CandidateUpdateStatusRequest, reviewerID string) error {
	args := m.Called(ctx, candidateCode, req, reviewerID)
	return args.Error(0)
}

func TestHandler_RegisterCandidate(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Post("/candidates", handler.RegisterCandidate)

	t.Run("Success", func(t *testing.T) {
		reqBody := RegisterCandidateRequest{RegistrationID: "req1", Vision: "v", Mission: "m", WorkProgram: "w"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("RegisterCandidate", mock.Anything, &reqBody).Return(&RegisterCandidateResponse{CandidateCode: "app1"}, nil).Once()

		req := httptest.NewRequest("POST", "/candidates", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 201, resp.StatusCode)
	})

	t.Run("InvalidBody", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/candidates", bytes.NewReader([]byte("{invalid}")))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("DuplicateApplication", func(t *testing.T) {
		reqBody := RegisterCandidateRequest{RegistrationID: "req1", Vision: "v", Mission: "m", WorkProgram: "w"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("RegisterCandidate", mock.Anything, &reqBody).Return((*RegisterCandidateResponse)(nil), ErrDuplicateApplication).Once()

		req := httptest.NewRequest("POST", "/candidates", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 409, resp.StatusCode)
	})

	t.Run("RegistrationNotApproved", func(t *testing.T) {
		reqBody := RegisterCandidateRequest{RegistrationID: "req1", Vision: "v", Mission: "m", WorkProgram: "w"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("RegisterCandidate", mock.Anything, &reqBody).Return((*RegisterCandidateResponse)(nil), ErrRegistrationNotApproved).Once()

		req := httptest.NewRequest("POST", "/candidates", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 403, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		reqBody := RegisterCandidateRequest{RegistrationID: "req1", Vision: "v", Mission: "m", WorkProgram: "w"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("RegisterCandidate", mock.Anything, &reqBody).Return((*RegisterCandidateResponse)(nil), errors.New("db error")).Once()

		req := httptest.NewRequest("POST", "/candidates", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_GetCandidateStatus(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Get("/candidates/:id/status", handler.GetCandidateStatus)

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("GetCandidateStatus", mock.Anything, "app1").Return(&CandidateStatusResponse{CandidateCode: "app1"}, nil).Once()

		req := httptest.NewRequest("GET", "/candidates/app1/status", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockSvc.On("GetCandidateStatus", mock.Anything, "app1").Return((*CandidateStatusResponse)(nil), ErrCandidateApplicationNotFound).Once()

		req := httptest.NewRequest("GET", "/candidates/app1/status", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 404, resp.StatusCode)
	})
}

func TestHandler_UploadDocuments(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Post("/candidates/:id/documents", handler.UploadDocuments)

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("UploadDocuments", mock.Anything, "app1", mock.Anything, mock.Anything).Return(&CandidateDocumentsResponse{PhotoURL: "path"}, nil).Once()

		body := new(bytes.Buffer)
		writer := multipart.NewWriter(body)

		part, _ := writer.CreateFormFile("photo", "test.jpg")
		part.Write([]byte("image content"))
		writer.Close()

		req := httptest.NewRequest("POST", "/candidates/app1/documents", body)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		resp, _ := app.Test(req)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("Error", func(t *testing.T) {
		mockSvc.On("UploadDocuments", mock.Anything, "app1", mock.Anything, mock.Anything).Return((*CandidateDocumentsResponse)(nil), errors.New("err")).Once()

		body := new(bytes.Buffer)
		writer := multipart.NewWriter(body)

		part, _ := writer.CreateFormFile("photo", "test.jpg")
		part.Write([]byte("image content"))
		writer.Close()

		req := httptest.NewRequest("POST", "/candidates/app1/documents", body)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})
}

func TestHandler_GetDocuments(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Get("/candidates/:id/documents", handler.GetDocuments)

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("GetDocuments", mock.Anything, "app1").Return(&CandidateDocumentsResponse{PhotoURL: "path"}, nil).Once()

		req := httptest.NewRequest("GET", "/candidates/app1/documents", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockSvc.On("GetDocuments", mock.Anything, "app1").Return((*CandidateDocumentsResponse)(nil), errors.New("not found")).Once()

		req := httptest.NewRequest("GET", "/candidates/app1/documents", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 404, resp.StatusCode)
	})
}

func TestHandler_DeleteDocuments(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Delete("/candidates/:id/documents", handler.DeleteDocuments)

	t.Run("Success", func(t *testing.T) {
		reqBody := DeleteDocumentsRequest{Photo: true}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("DeleteDocuments", mock.Anything, "app1", &reqBody).Return(nil).Once()

		req := httptest.NewRequest("DELETE", "/candidates/app1/documents", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("ServiceError", func(t *testing.T) {
		reqBody := DeleteDocumentsRequest{Photo: true}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("DeleteDocuments", mock.Anything, "app1", &reqBody).Return(errors.New("svc err")).Once()

		req := httptest.NewRequest("DELETE", "/candidates/app1/documents", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("InvalidBody", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/candidates/app1/documents", bytes.NewReader([]byte("{invalid}")))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})
}

func TestHandler_AdminList(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Get("/admin/candidates", handler.AdminList)

	t.Run("Success", func(t *testing.T) {
		list := []CandidateAdminListResponse{{ID: "app1"}}
		mockSvc.On("AdminListCandidates", mock.Anything, mock.Anything).Return(list, 1, nil).Once()

		req := httptest.NewRequest("GET", "/admin/candidates", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InvalidQuery", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/admin/candidates?page=invalid", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		mockSvc.On("AdminListCandidates", mock.Anything, mock.Anything).Return(([]CandidateAdminListResponse)(nil), 0, errors.New("db error")).Once()

		req := httptest.NewRequest("GET", "/admin/candidates", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_AdminGet(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Get("/admin/candidates/:id", handler.AdminGet)

	t.Run("Success", func(t *testing.T) {
		detail := &CandidateAdminDetailResponse{CandidateAdminListResponse: CandidateAdminListResponse{ID: "app1"}}
		mockSvc.On("AdminGetCandidateDetail", mock.Anything, "app1").Return(detail, nil).Once()

		req := httptest.NewRequest("GET", "/admin/candidates/app1", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockSvc.On("AdminGetCandidateDetail", mock.Anything, "app1").Return((*CandidateAdminDetailResponse)(nil), errors.New("not found")).Once()

		req := httptest.NewRequest("GET", "/admin/candidates/app1", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("ServiceError", func(t *testing.T) {
		mockSvc.On("AdminGetCandidateDetail", mock.Anything, "app1").Return((*CandidateAdminDetailResponse)(nil), errors.New("err")).Once()
		req := httptest.NewRequest("GET", "/admin/candidates/app1", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("MissingID", func(t *testing.T) {
		app2 := fiber.New()
		app2.Get("/test", handler.AdminGet)
		req := httptest.NewRequest("GET", "/test", nil)
		resp, _ := app2.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})
}

func TestHandler_AdminUpdateDetails(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	// Simulate user_id context for admin handlers
	app.Use(func(c fiber.Ctx) error {
		c.Locals("user_id", "admin1")
		return c.Next()
	})
	app.Put("/admin/candidates/:id", handler.AdminUpdateDetails)

	t.Run("Success", func(t *testing.T) {
		reqBody := CandidateAdminUpdateRequest{}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("AdminUpdateCandidateDetails", mock.Anything, "app1", mock.Anything, "admin1").Return(nil).Once()

		req := httptest.NewRequest("PUT", "/admin/candidates/app1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InvalidBody", func(t *testing.T) {
		req := httptest.NewRequest("PUT", "/admin/candidates/app1", bytes.NewReader([]byte("{invalid}")))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("Error", func(t *testing.T) {
		reqBody := CandidateAdminUpdateRequest{}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("AdminUpdateCandidateDetails", mock.Anything, "app1", mock.Anything, "admin1").Return(errors.New("db err")).Once()

		req := httptest.NewRequest("PUT", "/admin/candidates/app1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})
}

func TestHandler_AdminUpdateStatus(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Use(func(c fiber.Ctx) error {
		c.Locals("user_id", "admin1")
		return c.Next()
	})
	app.Patch("/admin/candidates/:id/status", handler.AdminUpdateStatus)

	t.Run("Success", func(t *testing.T) {
		reqBody := CandidateUpdateStatusRequest{Status: "ACCEPTED"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("AdminUpdateCandidateStatus", mock.Anything, "app1", mock.Anything, "admin1").Return(nil).Once()

		req := httptest.NewRequest("PATCH", "/admin/candidates/app1/status", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InvalidBody", func(t *testing.T) {
		req := httptest.NewRequest("PATCH", "/admin/candidates/app1/status", bytes.NewReader([]byte("{invalid}")))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("Error", func(t *testing.T) {
		reqBody := CandidateUpdateStatusRequest{Status: "ACCEPTED"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("AdminUpdateCandidateStatus", mock.Anything, "app1", mock.Anything, "admin1").Return(errors.New("db err")).Once()

		req := httptest.NewRequest("PATCH", "/admin/candidates/app1/status", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("MissingID", func(t *testing.T) {
		app2 := fiber.New()
		app2.Patch("/test", handler.AdminUpdateStatus)
		req := httptest.NewRequest("PATCH", "/test", nil)
		resp, _ := app2.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})
}

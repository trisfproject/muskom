package musyawarah

import (
	"bytes"
	"encoding/json"
	"errors"
	"mime/multipart"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func TestHandler_GetConfig(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc, validator.New(), 10*1024*1024)

	app.Get("/musyawarah", handler.Get)

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("GetConfig", mock.Anything).Return(&MusyawarahResponse{}, nil).Once()
		req := httptest.NewRequest("GET", "/musyawarah", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockSvc.On("GetConfig", mock.Anything).Return((*MusyawarahResponse)(nil), ErrConfigNotFound).Once()
		req := httptest.NewRequest("GET", "/musyawarah", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		mockSvc.On("GetConfig", mock.Anything).Return((*MusyawarahResponse)(nil), errors.New("db err")).Once()
		req := httptest.NewRequest("GET", "/musyawarah", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_UpdateConfig(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc, validator.New(), 10*1024*1024)

	app.Put("/musyawarah", handler.Update)

	t.Run("Success", func(t *testing.T) {
		theme := "Theme"
		desc := "Desc"
		loc := "Loc"
		now := time.Now()
		reqBody := UpdateMusyawarahRequest{
			Name: "Name", Slug: "slug", Theme: &theme, Description: &desc, LocationName: &loc,
			EventDate: &now, RegistrationOpen: &now, RegistrationClose: &now,
			CandidateRegistrationOpen: &now, CandidateRegistrationClose: &now,
		}
		body, _ := json.Marshal(reqBody)
		mockSvc.On("UpdateConfig", mock.Anything, mock.AnythingOfType("*musyawarah.UpdateMusyawarahRequest")).Return(&MusyawarahResponse{}, nil).Once()

		req := httptest.NewRequest("PUT", "/musyawarah", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InvalidBody", func(t *testing.T) {
		req := httptest.NewRequest("PUT", "/musyawarah", bytes.NewReader([]byte("{invalid}")))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		theme := "Theme"
		desc := "Desc"
		loc := "Loc"
		now := time.Now()
		reqBody := UpdateMusyawarahRequest{
			Name: "Name", Slug: "slug", Theme: &theme, Description: &desc, LocationName: &loc,
			EventDate: &now, RegistrationOpen: &now, RegistrationClose: &now,
			CandidateRegistrationOpen: &now, CandidateRegistrationClose: &now,
		}
		body, _ := json.Marshal(reqBody)
		mockSvc.On("UpdateConfig", mock.Anything, mock.AnythingOfType("*musyawarah.UpdateMusyawarahRequest")).Return((*MusyawarahResponse)(nil), errors.New("db err")).Once()

		req := httptest.NewRequest("PUT", "/musyawarah", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_GetSettings(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc, validator.New(), 10*1024*1024)

	app.Get("/musyawarah/settings", handler.GetSettings)

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("GetSettings", mock.Anything).Return(&SettingsResponse{}, nil).Once()
		req := httptest.NewRequest("GET", "/musyawarah/settings", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		mockSvc.On("GetSettings", mock.Anything).Return((*SettingsResponse)(nil), errors.New("db err")).Once()
		req := httptest.NewRequest("GET", "/musyawarah/settings", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_UpdateSettings(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc, validator.New(), 10*1024*1024)

	app.Put("/musyawarah/settings", handler.UpdateSettings)

	t.Run("Success", func(t *testing.T) {
		reqBody := SettingsRequest{
			RegistrationApprovalMode: "MANUAL",
			CandidateApprovalMode:    "MANUAL",
			AttendanceQRExpiration:   60,
			AttendanceRadius:         100,
			EnableVoting:             true,
		}
		body, _ := json.Marshal(reqBody)
		mockSvc.On("UpdateSettings", mock.Anything, mock.AnythingOfType("*musyawarah.SettingsRequest")).Return(&SettingsResponse{}, nil).Once()

		req := httptest.NewRequest("PUT", "/musyawarah/settings", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InvalidBody", func(t *testing.T) {
		req := httptest.NewRequest("PUT", "/musyawarah/settings", bytes.NewReader([]byte("{invalid}")))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		reqBody := SettingsRequest{
			RegistrationApprovalMode: "MANUAL",
			CandidateApprovalMode:    "MANUAL",
			AttendanceQRExpiration:   60,
			AttendanceRadius:         100,
			EnableVoting:             true,
		}
		body, _ := json.Marshal(reqBody)
		mockSvc.On("UpdateSettings", mock.Anything, mock.AnythingOfType("*musyawarah.SettingsRequest")).Return((*SettingsResponse)(nil), errors.New("db err")).Once()

		req := httptest.NewRequest("PUT", "/musyawarah/settings", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_GetTimeline(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc, validator.New(), 10*1024*1024)

	app.Get("/musyawarah/timeline", handler.GetTimeline)

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("GetTimeline", mock.Anything).Return(&TimelineResponse{}, nil).Once()
		req := httptest.NewRequest("GET", "/musyawarah/timeline", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		mockSvc.On("GetTimeline", mock.Anything).Return((*TimelineResponse)(nil), errors.New("db err")).Once()
		req := httptest.NewRequest("GET", "/musyawarah/timeline", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_UpdateTimeline(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc, validator.New(), 10*1024*1024)

	app.Put("/musyawarah/timeline", handler.UpdateTimeline)

	t.Run("Success", func(t *testing.T) {
		reqBody := TimelineRequest{}
		body, _ := json.Marshal(reqBody)
		mockSvc.On("UpdateTimeline", mock.Anything, mock.AnythingOfType("*musyawarah.TimelineRequest")).Return(&TimelineResponse{}, nil).Once()

		req := httptest.NewRequest("PUT", "/musyawarah/timeline", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InvalidBody", func(t *testing.T) {
		req := httptest.NewRequest("PUT", "/musyawarah/timeline", bytes.NewReader([]byte("{invalid}")))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		reqBody := TimelineRequest{}
		body, _ := json.Marshal(reqBody)
		mockSvc.On("UpdateTimeline", mock.Anything, mock.AnythingOfType("*musyawarah.TimelineRequest")).Return((*TimelineResponse)(nil), errors.New("db err")).Once()

		req := httptest.NewRequest("PUT", "/musyawarah/timeline", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, 422, resp.StatusCode)
	})
}

func TestHandler_GetMedia(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc, validator.New(), 10*1024*1024)

	app.Get("/musyawarah/media", handler.GetMedia)

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("GetMedia", mock.Anything).Return(&MediaResponse{}, nil).Once()
		req := httptest.NewRequest("GET", "/musyawarah/media", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		mockSvc.On("GetMedia", mock.Anything).Return((*MediaResponse)(nil), errors.New("db err")).Once()
		req := httptest.NewRequest("GET", "/musyawarah/media", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_UploadMedia(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc, validator.New(), 10*1024*1024)

	app.Post("/musyawarah/media/:type", handler.UploadMedia)
	app.Post("/musyawarah/media/", handler.UploadMedia)

	t.Run("MissingType", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/musyawarah/media/", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("InvalidMultipart", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/musyawarah/media/logo", nil)
		req.Header.Set("Content-Type", "multipart/form-data; boundary=invalid")
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("Success", func(t *testing.T) {
		body := new(bytes.Buffer)
		writer := multipart.NewWriter(body)
		part, _ := writer.CreateFormFile("file", "test.png")
		part.Write([]byte("content"))
		writer.Close()

		mockSvc.On("UploadMedia", mock.Anything, "logo", mock.Anything, "test.png", "application/octet-stream").Return(&MediaResponse{}, nil).Once()

		req := httptest.NewRequest("POST", "/musyawarah/media/logo", body)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("ServiceError", func(t *testing.T) {
		body := new(bytes.Buffer)
		writer := multipart.NewWriter(body)
		part, _ := writer.CreateFormFile("file", "test.png")
		part.Write([]byte("content"))
		writer.Close()

		mockSvc.On("UploadMedia", mock.Anything, "logo", mock.Anything, "test.png", "application/octet-stream").Return((*MediaResponse)(nil), errors.New("up err")).Once()

		req := httptest.NewRequest("POST", "/musyawarah/media/logo", body)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_DeleteMedia(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc, validator.New(), 10*1024*1024)

	app.Delete("/musyawarah/media/:type", handler.DeleteMedia)
	app.Delete("/musyawarah/media/", handler.DeleteMedia)

	t.Run("MissingType", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/musyawarah/media/", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("DeleteMedia", mock.Anything, "logo").Return(nil).Once()
		req := httptest.NewRequest("DELETE", "/musyawarah/media/logo", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		mockSvc.On("DeleteMedia", mock.Anything, "logo").Return(errors.New("db err")).Once()
		req := httptest.NewRequest("DELETE", "/musyawarah/media/logo", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

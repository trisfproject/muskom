package registration

import (
	"bytes"
	"encoding/json"
	"errors"
	"mime/multipart"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestHandler_RegisterParticipant(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	h := NewHandler(mockSvc)

	app.Post("/register", h.Register)

	t.Run("Success", func(t *testing.T) {
		reqBody := PublicRegistrationRequest{
			FullName:            "John Doe",
			Email:               "john@example.com",
			ParticipantCategory: "DELEGATE",
		}
		body, _ := json.Marshal(reqBody)

		res := &PublicRegistrationResponse{
			RegistrationCode: "reg1",
			Status:           "PENDING",
		}
		mockSvc.On("RegisterParticipant", mock.Anything, mock.Anything).Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodPost, "/register", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.NotNil(t, resp)
		assert.Equal(t, fiber.StatusCreated, resp.StatusCode)
	})

	t.Run("InvalidPayload", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodPost, "/register", bytes.NewReader([]byte("{invalid json")))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("ServiceError", func(t *testing.T) {
		reqBody := PublicRegistrationRequest{FullName: "John Doe"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("RegisterParticipant", mock.Anything, mock.Anything).Return(nil, errors.New("svc err")).Once()

		req := httptest.NewRequest(fiber.MethodPost, "/register", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})

	t.Run("Invalid Payload", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodPost, "/register", bytes.NewReader([]byte(`{}`)))
		req.Header.Set("Content-Type", "application/json")

		mockSvc.On("RegisterParticipant", mock.Anything, mock.Anything).Return(nil, &ValidationError{}).Once()

		resp, _ := app.Test(req)
		assert.NotNil(t, resp)
		assert.Equal(t, fiber.StatusUnprocessableEntity, resp.StatusCode)
	})
}

func TestHandler_CheckRegistrationStatus(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	h := NewHandler(mockSvc)

	app.Get("/register/:registration_code/status", h.GetStatus)

	t.Run("Success", func(t *testing.T) {
		res := &RegistrationStatusResponse{
			Status: "APPROVED",
		}
		mockSvc.On("CheckRegistrationStatus", mock.Anything, "reg1").Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/register/reg1/status", nil)
		resp, _ := app.Test(req)

		assert.NotNil(t, resp)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})
}

func TestHandler_GetConfirmation(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	h := NewHandler(mockSvc)

	app.Get("/register/:registration_code/confirmation", h.GetConfirmation)

	t.Run("Success", func(t *testing.T) {
		res := &RegistrationConfirmationResponse{
			RegistrationCode: "reg1",
		}
		mockSvc.On("GetRegistrationConfirmation", mock.Anything, "reg1").Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/register/reg1/confirmation", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})
}

func TestHandler_UploadAttachment(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	h := NewHandler(mockSvc)

	app.Post("/register/:registration_code/attachments", h.UploadAttachment)

	t.Run("Success", func(t *testing.T) {
		body := new(bytes.Buffer)
		writer := multipart.NewWriter(body)
		part, _ := writer.CreateFormFile("attachment", "test.jpg")
		part.Write([]byte("fake image content"))
		writer.Close()

		res := &AttachmentResponse{ID: "att1"}
		mockSvc.On("UploadAttachment", mock.Anything, "reg1", mock.Anything).Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodPost, "/register/reg1/attachments", body)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusCreated, resp.StatusCode)
	})

	t.Run("MissingFile", func(t *testing.T) {
		body := new(bytes.Buffer)
		writer := multipart.NewWriter(body)
		writer.Close()

		req := httptest.NewRequest(fiber.MethodPost, "/register/reg1/attachments", body)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})
}

func TestHandler_AdminList(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	h := NewHandler(mockSvc)

	app.Get("/admin/registrations", h.AdminList)

	t.Run("Success", func(t *testing.T) {
		res := &AdminListRegistrationsResponse{Total: 1}
		mockSvc.On("AdminListRegistrations", mock.Anything, mock.Anything).Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/admin/registrations?page=1&limit=10&status=PENDING&search=John", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})
}

func TestHandler_AdminGet(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	h := NewHandler(mockSvc)

	app.Get("/admin/registrations/:id", h.AdminGet)

	t.Run("Success", func(t *testing.T) {
		res := &AdminRegistrationResponse{ID: "reg1"}
		mockSvc.On("AdminGetRegistration", mock.Anything, "reg1").Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/admin/registrations/reg1", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})
}

func TestHandler_GetAttachments(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	h := NewHandler(mockSvc)

	app.Get("/register/:registration_code/attachments", h.GetAttachments)

	t.Run("Success", func(t *testing.T) {
		res := []AttachmentResponse{
			{ID: "att1", FileName: "test.pdf"},
		}
		mockSvc.On("GetAttachments", mock.Anything, "reg1").Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/register/reg1/attachments", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})
}

func TestHandler_DeleteAttachment(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	h := NewHandler(mockSvc)

	app.Delete("/register/:registration_code/attachments/:attachment_id", h.DeleteAttachment)

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("DeleteAttachment", mock.Anything, "reg1", "att1").Return(nil).Once()

		req := httptest.NewRequest(fiber.MethodDelete, "/register/reg1/attachments/att1", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})
}

func TestHandler_AdminUpdateStatus(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	h := NewHandler(mockSvc)

	app.Put("/admin/registrations/:id/status", h.AdminUpdateStatus)

	t.Run("Success", func(t *testing.T) {
		reqBody := AdminUpdateRegistrationStatusRequest{Status: "APPROVED"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("AdminUpdateRegistrationStatus", mock.Anything, "reg1", mock.Anything, mock.Anything).Return(nil).Once()

		req := httptest.NewRequest(fiber.MethodPut, "/admin/registrations/reg1/status", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("InvalidPayload", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodPut, "/admin/registrations/reg1/status", bytes.NewReader([]byte("{invalid json")))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("ServiceError", func(t *testing.T) {
		reqBody := AdminUpdateRegistrationStatusRequest{Status: "APPROVED"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("AdminUpdateRegistrationStatus", mock.Anything, "reg1", mock.Anything, mock.Anything).Return(errors.New("err")).Once()

		req := httptest.NewRequest(fiber.MethodPut, "/admin/registrations/reg1/status", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

func TestHandler_AdminExportCSV(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	h := NewHandler(mockSvc)

	app.Get("/admin/registrations/export/csv", h.AdminExportCSV)

	t.Run("Success", func(t *testing.T) {
		res := &AdminListRegistrationsResponse{
			Data: []AdminRegistrationResponse{
				{
					RegistrationNumber:  "REG-001",
					ParticipantName:     "John Doe",
					Nickname:            "John",
					Email:               "john@example.com",
					Phone:               "08123456789",
					Company:             "Acme Corp",
					JobTitle:            "Engineer",
					Region:              "Jakarta",
					Community:           "IT",
					SpecialNotes:        "None",
					ParticipantCategory: "DELEGATE",
					Status:              "APPROVED",
					CreatedAt:           "2026-01-01 10:00:00",
				},
			},
			Total: 1,
		}
		mockSvc.On("AdminListRegistrations", mock.Anything, mock.Anything).Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/admin/registrations/export/csv?status=APPROVED&search=John", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
		assert.Contains(t, resp.Header.Get("Content-Type"), "text/csv")
		assert.Contains(t, resp.Header.Get("Content-Disposition"), "data-peserta.csv")
	})

	t.Run("ServiceError", func(t *testing.T) {
		mockSvc.On("AdminListRegistrations", mock.Anything, mock.Anything).Return((*AdminListRegistrationsResponse)(nil), errors.New("err")).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/admin/registrations/export/csv", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}


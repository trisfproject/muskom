package attendance

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

func TestHandler_CheckIn(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Use(func(c fiber.Ctx) error {
		c.Locals("user_id", "admin1")
		return c.Next()
	})
	app.Post("/check-in", handler.CheckIn)

	t.Run("Success_New", func(t *testing.T) {
		reqBody := CheckInRequest{RegistrationID: "reg1"}
		body, _ := json.Marshal(reqBody)

		res := &CheckInResponse{Success: true, IsNew: true}
		mockSvc.On("CheckIn", mock.Anything, &reqBody, "admin1").Return(res, nil).Once()

		req := httptest.NewRequest("POST", "/check-in", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 201, resp.StatusCode)
	})

	t.Run("Success_Existing", func(t *testing.T) {
		reqBody := CheckInRequest{RegistrationID: "reg1"}
		body, _ := json.Marshal(reqBody)

		res := &CheckInResponse{Success: true, IsNew: false}
		mockSvc.On("CheckIn", mock.Anything, &reqBody, "admin1").Return(res, nil).Once()

		req := httptest.NewRequest("POST", "/check-in", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InvalidBody", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/check-in", bytes.NewReader([]byte("{invalid}")))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("ValidationError", func(t *testing.T) {
		reqBody := CheckInRequest{RegistrationID: "reg1"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("CheckIn", mock.Anything, &reqBody, "admin1").Return((*CheckInResponse)(nil), &ValidationError{}).Once()

		req := httptest.NewRequest("POST", "/check-in", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("NotApproved", func(t *testing.T) {
		reqBody := CheckInRequest{RegistrationID: "reg1"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("CheckIn", mock.Anything, &reqBody, "admin1").Return((*CheckInResponse)(nil), errors.New("cannot check-in: participant is not APPROVED")).Once()

		req := httptest.NewRequest("POST", "/check-in", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 409, resp.StatusCode)
	})

	t.Run("ParticipantNotFound", func(t *testing.T) {
		reqBody := CheckInRequest{RegistrationID: "reg1"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("CheckIn", mock.Anything, &reqBody, "admin1").Return((*CheckInResponse)(nil), errors.New("participant not found")).Once()

		req := httptest.NewRequest("POST", "/check-in", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		reqBody := CheckInRequest{RegistrationID: "reg1"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("CheckIn", mock.Anything, &reqBody, "admin1").Return((*CheckInResponse)(nil), errors.New("db err")).Once()

		req := httptest.NewRequest("POST", "/check-in", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_CheckIn_Unauthorized(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Post("/check-in", handler.CheckIn)

	t.Run("Unauthorized", func(t *testing.T) {
		reqBody := CheckInRequest{RegistrationID: "reg1"}
		body, _ := json.Marshal(reqBody)

		req := httptest.NewRequest("POST", "/check-in", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 401, resp.StatusCode)
	})
}

func TestHandler_GetAttendance(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Get("/attendance/participant/:participantId", handler.GetAttendance)
	app.Get("/attendance/participant/", handler.GetAttendance) // for testing missing ID

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("GetAttendance", mock.Anything, "reg1").Return(&AttendanceDetailResponse{}, nil).Once()

		req := httptest.NewRequest("GET", "/attendance/participant/reg1", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockSvc.On("GetAttendance", mock.Anything, "reg1").Return((*AttendanceDetailResponse)(nil), errors.New("not found")).Once()

		req := httptest.NewRequest("GET", "/attendance/participant/reg1", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("MissingID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/attendance/participant/", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})
}

func TestHandler_ListAttendances(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Get("/attendance", handler.ListAttendances)

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("ListAttendances", mock.Anything, mock.Anything).Return([]AttendanceItemResponse{}, 0, nil).Once()

		req := httptest.NewRequest("GET", "/attendance?page=1&limit=10", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InvalidQuery", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/attendance?page=invalid", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("ValidationError", func(t *testing.T) {
		mockSvc.On("ListAttendances", mock.Anything, mock.Anything).Return(([]AttendanceItemResponse)(nil), 0, &ValidationError{}).Once()

		req := httptest.NewRequest("GET", "/attendance", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		mockSvc.On("ListAttendances", mock.Anything, mock.Anything).Return(([]AttendanceItemResponse)(nil), 0, errors.New("db err")).Once()

		req := httptest.NewRequest("GET", "/attendance", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_GetAttendanceByID(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Get("/attendance/:id", handler.GetAttendanceByID)
	app.Get("/attendance/", handler.GetAttendanceByID) // Missing ID

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("GetAttendanceByID", mock.Anything, "att1").Return(&AttendanceDetailResponse{}, nil).Once()

		req := httptest.NewRequest("GET", "/attendance/att1", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockSvc.On("GetAttendanceByID", mock.Anything, "att1").Return((*AttendanceDetailResponse)(nil), errors.New("not found")).Once()

		req := httptest.NewRequest("GET", "/attendance/att1", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("MissingID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/attendance/", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})
}

func TestHandler_CorrectAttendance(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Use(func(c fiber.Ctx) error {
		c.Locals("user_id", "admin1")
		return c.Next()
	})
	app.Patch("/attendance/:id", handler.CorrectAttendance)
	app.Patch("/attendance/", handler.CorrectAttendance)

	t.Run("Success_ButRejected", func(t *testing.T) {
		reqBody := CorrectAttendanceRequest{Notes: "test"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("CorrectAttendance", mock.Anything, "att1", &reqBody, "admin1").Return(errors.New("attendance correction is not supported by the current database schema")).Once()

		req := httptest.NewRequest("PATCH", "/attendance/att1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 409, resp.StatusCode)
	})

	t.Run("ValidationError", func(t *testing.T) {
		reqBody := CorrectAttendanceRequest{Notes: "test"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("CorrectAttendance", mock.Anything, "att1", &reqBody, "admin1").Return(&ValidationError{}).Once()

		req := httptest.NewRequest("PATCH", "/attendance/att1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		reqBody := CorrectAttendanceRequest{Notes: "test"}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("CorrectAttendance", mock.Anything, "att1", &reqBody, "admin1").Return(errors.New("db err")).Once()

		req := httptest.NewRequest("PATCH", "/attendance/att1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("InvalidBody", func(t *testing.T) {
		req := httptest.NewRequest("PATCH", "/attendance/att1", bytes.NewReader([]byte("{invalid}")))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("MissingID", func(t *testing.T) {
		req := httptest.NewRequest("PATCH", "/attendance/", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, 400, resp.StatusCode)
	})
}

func TestHandler_CorrectAttendance_Unauthorized(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Patch("/attendance/:id", handler.CorrectAttendance)

	t.Run("Unauthorized", func(t *testing.T) {
		reqBody := CorrectAttendanceRequest{Notes: "test"}
		body, _ := json.Marshal(reqBody)

		req := httptest.NewRequest("PATCH", "/attendance/att1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, 401, resp.StatusCode)
	})
}

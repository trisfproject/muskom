package auth

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func TestHandler_Login(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	val := validator.New()
	h := NewHandler(mockSvc, val)
	app.Post("/login", h.Login)

	t.Run("Success", func(t *testing.T) {
		reqBody := LoginRequest{
			Username: "admin",
			Password: "password123",
		}
		body, _ := json.Marshal(reqBody)

		res := &LoginResponse{
			AccessToken:  "access",
			RefreshToken: "refresh",
			ExpiresAt:    time.Now().Format(time.RFC3339),
			User: UserData{
				ID:       "usr1",
				Username: "admin",
			},
		}

		mockSvc.On("Authenticate", mock.Anything, "admin", "password123").Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodPost, "/login", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Invalid Payload", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodPost, "/login", bytes.NewReader([]byte(`{"username": "admin"}`))) // missing password
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusUnprocessableEntity, resp.StatusCode)
	})

	t.Run("Invalid Credentials", func(t *testing.T) {
		reqBody := LoginRequest{
			Username: "admin",
			Password: "wrongpassword",
		}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("Authenticate", mock.Anything, "admin", "wrongpassword").Return(nil, ErrInvalidCredentials).Once()

		req := httptest.NewRequest(fiber.MethodPost, "/login", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("Internal Error", func(t *testing.T) {
		reqBody := LoginRequest{
			Username: "admin",
			Password: "password123",
		}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("Authenticate", mock.Anything, "admin", "password123").Return(nil, errors.New("db err")).Once()

		req := httptest.NewRequest(fiber.MethodPost, "/login", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

func TestHandler_Logout(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	val := validator.New()
	h := NewHandler(mockSvc, val)
	
	// Add mock local data that middleware would inject
	app.Post("/logout", func(c fiber.Ctx) error {
		c.Locals("user_id", "usr1")
		return h.Logout(c)
	})

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("Logout", mock.Anything, "usr1").Return(nil).Once()
		req := httptest.NewRequest(fiber.MethodPost, "/logout", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Unauthorized missing user_id", func(t *testing.T) {
		app2 := fiber.New()
		app2.Post("/logout", h.Logout)
		req := httptest.NewRequest(fiber.MethodPost, "/logout", nil)
		resp, _ := app2.Test(req)
		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("Internal Error", func(t *testing.T) {
		mockSvc.On("Logout", mock.Anything, "usr1").Return(errors.New("redis err")).Once()
		req := httptest.NewRequest(fiber.MethodPost, "/logout", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

func TestHandler_Refresh(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	val := validator.New()
	h := NewHandler(mockSvc, val)
	
	app.Post("/refresh", h.Refresh)

	t.Run("Success", func(t *testing.T) {
		reqBody := RefreshRequest{
			RefreshToken: "valid-token",
		}
		body, _ := json.Marshal(reqBody)

		res := &RefreshResponse{
			AccessToken:  "new-access",
			RefreshToken: "new-refresh",
		}

		mockSvc.On("Refresh", mock.Anything, "valid-token").Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodPost, "/refresh", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Invalid Token", func(t *testing.T) {
		reqBody := RefreshRequest{
			RefreshToken: "invalid-token",
		}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("Refresh", mock.Anything, "invalid-token").Return(nil, ErrInvalidToken).Once()

		req := httptest.NewRequest(fiber.MethodPost, "/refresh", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("Invalid Payload", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodPost, "/refresh", bytes.NewReader([]byte(`{}`)))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusUnprocessableEntity, resp.StatusCode)
	})

	t.Run("Internal Error", func(t *testing.T) {
		reqBody := RefreshRequest{
			RefreshToken: "valid-token",
		}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("Refresh", mock.Anything, "valid-token").Return(nil, errors.New("db err")).Once()

		req := httptest.NewRequest(fiber.MethodPost, "/refresh", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

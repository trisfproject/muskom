package auth

import (
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap/zaptest"

	"github.com/trisfproject/muskom/apps/api/platform/config"
)

func TestJWTMiddleware(t *testing.T) {
	app := fiber.New()
	cfg := &config.Config{JWTSecret: "secret"}
	log := zaptest.NewLogger(t)

	app.Use(JWTMiddleware(cfg, log))
	app.Get("/protected", func(c fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	t.Run("Missing Header", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodGet, "/protected", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("Invalid Format", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "InvalidFormat token")
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("Invalid Token Signature", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer invalid.token.string")
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("Expired Token", func(t *testing.T) {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"exp": time.Now().Add(-1 * time.Hour).Unix(),
		})
		tokenString, _ := token.SignedString([]byte("secret"))

		req := httptest.NewRequest(fiber.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+tokenString)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("Success", func(t *testing.T) {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub":      "usr1",
			"username": "admin",
			"role":     "ADMIN",
			"exp":      time.Now().Add(1 * time.Hour).Unix(),
		})
		tokenString, _ := token.SignedString([]byte("secret"))

		req := httptest.NewRequest(fiber.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+tokenString)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})
}

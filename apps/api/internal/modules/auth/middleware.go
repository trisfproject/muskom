package auth

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

// JWTMiddleware creates a fiber Handler that intercepts and validates the Authorization Bearer token.
func JWTMiddleware(cfg *config.Config, log *zap.Logger) fiber.Handler {
	return func(c fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return response.SendError(c, fiber.StatusUnauthorized, "Missing authorization header", nil)
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			return response.SendError(c, fiber.StatusUnauthorized, "Invalid authorization format", nil)
		}

		tokenString := parts[1]

		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			log.Warn("Failed JWT authentication attempt", zap.Error(err))
			return response.SendError(c, fiber.StatusUnauthorized, "Invalid or expired token", nil)
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return response.SendError(c, fiber.StatusUnauthorized, "Invalid token claims", nil)
		}

		c.Locals("user_id", claims["sub"])
		c.Locals("username", claims["username"])
		c.Locals("role", claims["role"])

		return c.Next()
	}
}

package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/config"
)

// Setup configures global middlewares for the Fiber app.
func Setup(app *fiber.App, cfg *config.Config, zapLogger *zap.Logger) {
	// Recover from panics
	app.Use(recover.New())

	// CORS — AllowCredentials cannot be true when origin is wildcard (CORS spec / Fiber enforcement)
	origins := parseOrigins(cfg.CorsAllowedOrigins)
	isWildcard := len(origins) == 1 && origins[0] == "*"
	app.Use(cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Event-ID"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowCredentials: !isWildcard,
		MaxAge:           3600,
	}))

	// Basic logger middleware
	app.Use(logger.New())
}

// parseOrigins splits a comma-separated origins string into a slice.
func parseOrigins(raw string) []string {
	if raw == "" || raw == "*" {
		return []string{"*"}
	}
	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, p := range parts {
		trimmed := strings.TrimSpace(p)
		if trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	if len(origins) == 0 {
		return []string{"*"}
	}
	return origins
}

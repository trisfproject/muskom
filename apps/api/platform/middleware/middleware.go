package middleware

import (
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"go.uber.org/zap"
)

// Setup configures global middlewares for the Fiber app.
func Setup(app *fiber.App, zapLogger *zap.Logger) {
	// Recover from panics
	app.Use(recover.New())

	// CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"}, // Configure this securely in production
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
	}))

	// Basic logger middleware
	// We can integrate Zap logger more deeply later if needed.
	app.Use(logger.New())
}

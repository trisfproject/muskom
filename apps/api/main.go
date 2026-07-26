package main

import (
	"log"

	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

func main() {
	// Initialize Zap logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("can't initialize zap logger: %v", err)
	}
	defer logger.Sync()

	app := fiber.New()

	app.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	logger.Info("Starting API server on :8080")
	if err := app.Listen(":8080"); err != nil {
		logger.Fatal("Failed to start server", zap.Error(err))
	}
}

package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/internal/modules/auth"
	"github.com/trisfproject/muskom/apps/api/internal/modules/event"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/database"
	"github.com/trisfproject/muskom/apps/api/platform/logger"
	"github.com/trisfproject/muskom/apps/api/platform/middleware"
	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func main() {
	// 1. Load Configuration
	cfg, err := config.Load()
	if err != nil {
		panic("Failed to load configuration: " + err.Error())
	}

	// 2. Initialize Logger
	log, err := logger.New(cfg.AppEnv)
	if err != nil {
		panic("Failed to initialize logger: " + err.Error())
	}
	defer log.Sync()
	log.Info("Starting MUSKOM API...", zap.String("env", cfg.AppEnv))

	// 3. Initialize Connections
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db, err := database.NewPostgresDB(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Database connection failed", zap.Error(err))
	}
	defer db.Close()
	log.Info("Connected to PostgreSQL")

	redisClient, err := database.NewRedisClient(ctx, cfg.RedisURL)
	if err != nil {
		log.Fatal("Redis connection failed", zap.Error(err))
	}
	defer redisClient.Close()
	log.Info("Connected to Redis")

	// 4. Initialize Fiber App
	app := fiber.New(fiber.Config{
		AppName:      "MUSKOM API v0.1.0",
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	})

	// 5. Global Middlewares
	middleware.Setup(app, log)

	// 6. Common Utilities
	val := validator.New()

	// 7. Routes
	v1 := app.Group("/api/v1")
	v1.Get("/health", func(c fiber.Ctx) error {
		return response.SendSuccess(c, 200, "Service is running", fiber.Map{
			"version": "0.1.0",
			"status":  "ok",
		}, nil)
	})

	// Modules
	auth.SetupRoutes(v1.Group("/auth"), db, log)
	event.SetupRoutes(v1.Group("/events"), db, log, val)

	// 8. Graceful Shutdown
	go func() {
		port := cfg.Port
		if port == "" {
			port = "8080"
		}
		log.Info("Server is listening on port " + port)
		if err := app.Listen(":" + port); err != nil {
			log.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Info("Gracefully shutting down server...")
	if err := app.Shutdown(); err != nil {
		log.Error("Server forced to shutdown", zap.Error(err))
	}
	log.Info("Server stopped")
}

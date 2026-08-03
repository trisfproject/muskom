package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/internal/modules/attendance"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/internal/modules/auth"
	"github.com/trisfproject/muskom/apps/api/internal/modules/candidate"
	"github.com/trisfproject/muskom/apps/api/internal/modules/dashboard"
	"github.com/trisfproject/muskom/apps/api/internal/modules/musyawarah"
	"github.com/trisfproject/muskom/apps/api/internal/modules/notification"
	"github.com/trisfproject/muskom/apps/api/internal/modules/participant"
	"github.com/trisfproject/muskom/apps/api/internal/modules/rbac"
	"github.com/trisfproject/muskom/apps/api/internal/modules/registration"
	"github.com/trisfproject/muskom/apps/api/internal/modules/reporting"
	"github.com/trisfproject/muskom/apps/api/internal/modules/result"
	"github.com/trisfproject/muskom/apps/api/internal/modules/verification"
	"github.com/trisfproject/muskom/apps/api/internal/modules/voting"
	"github.com/trisfproject/muskom/apps/api/internal/modules/website"
	"github.com/trisfproject/muskom/apps/api/internal/modules/system/configuration"
	"github.com/trisfproject/muskom/apps/api/internal/modules/user"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/database"
	"github.com/trisfproject/muskom/apps/api/platform/logger"
	"github.com/trisfproject/muskom/apps/api/platform/middleware"
	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"github.com/trisfproject/muskom/apps/api/platform/eventbus"
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

	strg, err := storage.NewService(cfg.StorageProvider, cfg.StorageRoot, cfg.StorageBaseURL)
	if err != nil {
		log.Fatal("Storage initialization failed", zap.Error(err))
	}
	log.Info("Initialized Storage Provider", zap.String("provider", cfg.StorageProvider))

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
	bus := eventbus.NewSyncBus(log)

	// 6.5. RBAC Initialization
	checker, authSvc := rbac.InitRBAC(db, log)

	// 7. Routes
	v1 := app.Group("/api/v1")
	v1.Get("/health", func(c fiber.Ctx) error {
		return response.SendSuccess(c, 200, "Service is running", fiber.Map{
			"version": "0.1.0",
			"status":  "ok",
		}, nil)
	})

	// Register System Configuration Routes
	configuration.RegisterRoutes(v1, db, redisClient, val, log)

	// Modules (Public / Dedicated)
	authGroup := v1.Group("/auth")
	auth.SetupRoutes(authGroup, db, redisClient, cfg, log, val)
	
	// Protected Auth routes (needs JWT for /me/permissions)
	rbac.SetupAuthRoutes(authGroup.Group("/", auth.JWTMiddleware(cfg, log)), authSvc)
	
	registration.SetupRoutes(v1.Group("/public/register"), db, log, val, strg, cfg.MaxUploadSize)
	musyawarah.SetupPublicRoutes(v1.Group("/public/musyawarah"), db, log, val, strg, cfg.MaxUploadSize)
	result.SetupPublicRoutes(v1.Group("/public"), db, log)
	website.SetupPublicRoutes(v1.Group("/public"), db, redisClient, strg, val, log)
	participant.SetupPublicRoutes(v1.Group("/public/participants"), db, log, val)

	// Protected Participant Routes
	participantGroup := v1.Group("/vote", auth.JWTMiddleware(cfg, log))
	voting.SetupRoutes(participantGroup, db, log, bus)

	// Protected Admin Routes
	adminGroup := v1.Group("/admin", auth.JWTMiddleware(cfg, log))
	dashboard.SetupAdminRoutes(adminGroup.Group("/dashboard"), db, log)
	website.SetupAdminRoutes(adminGroup.Group("/website"), db, redisClient, strg, val, log)
	musyawarah.SetupRoutes(adminGroup.Group("/musyawarah"), db, log, val, strg, cfg.MaxUploadSize)
	registration.SetupAdminRoutes(adminGroup.Group("/registrations"), db, log, val, strg, cfg.MaxUploadSize)
	verification.SetupAdminRoutes(adminGroup.Group("/verifications"), db, log, val)
	attendance.SetupAdminRoutes(adminGroup.Group("/attendance"), db, log, val)
	notification.SetupAdminRoutes(adminGroup.Group("/notifications"), db, log)
	audit.SetupAdminRoutes(adminGroup.Group("/audit", checker.RequirePermission("audit.view")), db, log)
	reporting.SetupAdminRoutes(adminGroup.Group("/reporting"), db, log)
	voting.SetupAdminRoutes(adminGroup.Group("/votes"), db, log, bus)
	result.SetupAdminRoutes(adminGroup, db, log)
	user.SetupRoutes(adminGroup.Group("/users", checker.RequirePermission("system.manage")), db, log, val)
	candidate.RegisterRoutes(v1, db, log, val, strg, cfg.MaxUploadSize)
	candidate.SetupAdminRoutes(adminGroup.Group("/candidates"), db, log, val, strg)
	participant.SetupAdminRoutes(adminGroup.Group("/participants"), db, log, val)

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

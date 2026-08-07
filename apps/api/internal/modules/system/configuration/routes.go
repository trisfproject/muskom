package configuration

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/mailer"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

func SetupPublicRoutes(router fiber.Router, db *sqlx.DB, rdb *redis.Client, val *validator.Validator, log *zap.Logger, cfg *config.Config, m mailer.Mailer) {
	auditRepo := audit.NewRepository(db)
	auditService := audit.NewService(auditRepo, log)
	repo := NewRepository(db)
	cache := NewCache(rdb)
	service := NewService(repo, cache, auditService, log, val)
	handler := NewHandler(service, val, cfg, m)

	router.Get("/", handler.HandleGetConfig)
}

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, rdb *redis.Client, val *validator.Validator, log *zap.Logger, cfg *config.Config, m mailer.Mailer) {
	auditRepo := audit.NewRepository(db)
	auditService := audit.NewService(auditRepo, log)
	repo := NewRepository(db)
	cache := NewCache(rdb)
	service := NewService(repo, cache, auditService, log, val)
	handler := NewHandler(service, val, cfg, m)

	router.Get("/", handler.HandleGetConfig)

	// Admin SMTP
	router.Get("/smtp/config", handler.HandleGetSMTPConfig)
	router.Put("/smtp/config", handler.HandleUpdateSMTPConfig)
	router.Post("/smtp/test-connection", handler.HandleTestSMTPConnection)
	router.Post("/smtp/test", handler.HandleTestSMTP)

	// Admin update configuration
	router.Put("/:group", handler.HandleUpdateConfig)
}

package configuration

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

func RegisterRoutes(router fiber.Router, db *sqlx.DB, rdb *redis.Client, val *validator.Validator, log *zap.Logger) {
	auditRepo := audit.NewRepository(db)
	auditService := audit.NewService(auditRepo, log)
	repo := NewRepository(db)
	cache := NewCache(rdb)
	service := NewService(repo, cache, auditService, log)
	handler := NewHandler(service, val)

	// Define routes
	group := router.Group("/system/config")

	// Public/Global GET configuration
	group.Get("/", handler.HandleGetConfig)

	// Admin update configuration
	// Note: In a real system, you would attach an RBAC/Admin middleware here
	group.Put("/:group", handler.HandleUpdateConfig)
}

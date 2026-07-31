package notification

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger) {
	repo := NewRepository(db)
	registry := NewProviderRegistry()
	svc := NewService(repo, registry, log)
	handler := NewHandler(svc)

	router.Get("/jobs", handler.ListJobs)
	router.Get("/history", handler.ListHistory)
	router.Get("/templates", handler.ListTemplates)
}

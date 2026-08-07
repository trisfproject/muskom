package notification

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/platform/mailer"
	"go.uber.org/zap"
)

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, m mailer.Mailer) Service {
	repo := NewRepository(db)
	registry := NewProviderRegistry(m)
	svc := NewService(repo, registry, log)
	handler := NewHandler(svc)

	router.Get("/jobs", handler.ListJobs)
	router.Get("/history", handler.ListHistory)
	router.Get("/templates", handler.ListTemplates)
	router.Get("/templates/:id", handler.GetTemplate)
	router.Put("/templates/:id", handler.UpdateTemplate)
	
	return svc
}

func SetupAdminRoutesWithService(router fiber.Router, svc Service) {
	handler := NewHandler(svc)
	router.Get("/jobs", handler.ListJobs)
	router.Get("/history", handler.ListHistory)
	router.Get("/templates", handler.ListTemplates)
	router.Get("/templates/:id", handler.GetTemplate)
	router.Put("/templates/:id", handler.UpdateTemplate)
}

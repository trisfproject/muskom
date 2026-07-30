package result

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger) {
	repo := NewRepository(db)
	svc := NewService(repo, db, log)
	handler := NewHandler(svc)

	// Admin API
	router.Get("/events/:eventId/results/overview", handler.AdminGetOverview)
	router.Get("/events/:eventId/results/candidates", handler.AdminGetCandidates)
	router.Get("/events/:eventId/results/summary", handler.AdminGetSummary)
	router.Get("/events/:eventId/results/audit", handler.AdminGetAudit)
	router.Get("/events/:eventId/results/export/csv", handler.AdminExportResultCSV)
	router.Get("/events/:eventId/results/export/xlsx", handler.AdminExportResultXLSX)
}

func SetupPublicRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger) {
	// Public API is intentionally omitted pending PRD publication timing rules.
	// As mandated by the Sprint 7 Review requirements, we must STOP here and document the missing business rule.
}

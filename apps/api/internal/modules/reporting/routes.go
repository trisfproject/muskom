package reporting

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger) {
	repo := NewRepository(db)
	exporter := NewMockExporter()
	svc := NewService(repo, exporter, log)
	handler := NewHandler(svc)

	router.Get("/official-result", handler.GetOfficialResult)
	router.Post("/export", handler.GenerateExport)
	router.Get("/history", handler.GetReportHistory)
}

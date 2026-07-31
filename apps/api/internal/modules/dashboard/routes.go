package dashboard

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger) {
	svc := NewService(db, log)
	handler := NewHandler(svc)

	router.Get("/summary", handler.GetDashboardSummary)
}

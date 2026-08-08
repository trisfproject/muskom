package dashboard

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"github.com/trisfproject/muskom/apps/api/platform/mailer"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"go.uber.org/zap"
)

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, redisClient *redis.Client, strg storage.Storage, mailSvc mailer.Mailer, log *zap.Logger) {
	svc := NewService(db, redisClient, strg, mailSvc, log)
	handler := NewHandler(svc)

	router.Get("/summary", handler.GetDashboardSummary)
	router.Get("/operations", handler.GetOperationsDashboard)
}

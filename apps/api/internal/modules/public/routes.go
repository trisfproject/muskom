package public

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/storage"
)

func SetupRoutes(router fiber.Router, db *sqlx.DB, strg storage.Storage, logger *zap.Logger) {
	repo := NewRepository(db)
	svc := NewService(repo, strg, logger)
	handler := NewHandler(svc)

	router.Get("/home", handler.GetHome)
}

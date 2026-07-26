package musyawarah

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

// SetupRoutes registers all routes for the Musyawarah Configuration module.
func SetupRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator, strg storage.Storage, maxUploadSize int64) {
	repo := NewRepository(db)
	svc := NewService(repo, log, strg)
	handler := NewHandler(svc, val, maxUploadSize)

	router.Get("/", handler.Get)
	router.Put("/", handler.Update)
	router.Get("/timeline", handler.GetTimeline)
	router.Put("/timeline", handler.UpdateTimeline)

	media := router.Group("/media")
	media.Get("/", handler.GetMedia)
	media.Post("/:type", handler.UploadMedia)
	media.Delete("/:type", handler.DeleteMedia)
}

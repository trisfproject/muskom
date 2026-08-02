package musyawarah

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

// SetupRoutes registers all admin routes for the Musyawarah module.
func SetupRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator, strg storage.Storage, maxUploadSize int64) {
	repo := NewRepository(db)
	svc := NewService(repo, log, strg)
	handler := NewHandler(svc, val, maxUploadSize)

	// Multi-event CRUD
	router.Get("/", handler.List)
	router.Post("/", handler.Create)
	router.Get("/:id", handler.GetByID)
	router.Put("/:id", handler.UpdateByID)
	router.Patch("/:id", handler.UpdateByID)
	router.Delete("/:id", handler.Delete)
	router.Post("/:id/activate", handler.Activate)
	router.Post("/:id/deactivate", handler.Deactivate)
	router.Post("/:id/archive", handler.Archive)
	router.Post("/:id/publish", handler.Publish)

	// Active event settings & timeline
	router.Get("/settings", handler.GetSettings)
	router.Put("/settings", handler.UpdateSettings)
	router.Get("/timeline", handler.GetTimeline)
	router.Put("/timeline", handler.UpdateTimeline)

	media := router.Group("/media")
	media.Get("/", handler.GetMedia)
	media.Post("/:type", handler.UploadMedia)
	media.Delete("/:type", handler.DeleteMedia)
}

// SetupPublicRoutes registers public routes for the Musyawarah module.
func SetupPublicRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator, strg storage.Storage, maxUploadSize int64) {
	repo := NewRepository(db)
	svc := NewService(repo, log, strg)
	handler := NewHandler(svc, val, maxUploadSize)

	router.Get("/", handler.Get)
}

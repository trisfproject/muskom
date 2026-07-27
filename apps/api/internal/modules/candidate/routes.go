package candidate

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

func SetupRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator, strg storage.Storage, maxUploadSize int64) {
	repo := NewRepository(db)
	svc := NewService(repo, log, val, strg, maxUploadSize)
	h := NewHandler(svc)

	candidates := router.Group("/candidates")

	// Public routes
	candidates.Post("/", h.RegisterCandidate)
	candidates.Get("/:id", h.GetCandidateStatus)
	candidates.Post("/:id/documents", h.UploadDocuments)
	candidates.Get("/:id/documents", h.GetDocuments)
	candidates.Delete("/:id/documents", h.DeleteDocuments)
}

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator, strg storage.Storage, maxUploadSize int64) {
	repo := NewRepository(db)
	svc := NewService(repo, log, val, strg, maxUploadSize)
	h := NewHandler(svc)

	router.Get("/", h.AdminList)
	router.Get("/:id", h.AdminGet)
	router.Patch("/:id/status", h.AdminUpdateStatus)
}

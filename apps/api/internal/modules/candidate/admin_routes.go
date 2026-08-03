package candidate

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

// SetupAdminRoutes registers candidate verification routes for the admin portal.
func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator, st storage.Storage, cfg *config.Config) {
	repo := NewRepository(db)
	auditSvc := audit.NewService(audit.NewRepository(db), log)
	// Using default 5MB size limit
	svc := NewService(repo, auditSvc, st, 5*1024*1024, cfg, log)
	h := NewAdminHandler(svc, val, log)

	// Admin candidate endpoints
	router.Get("/", h.ListCandidates)
	router.Get("/:id", h.GetCandidateDetail)
	router.Patch("/:id/verify", h.VerifyCandidate)
	router.Get("/:id/documents/:doc_id/stream", h.StreamDocument)
	router.Patch("/:id/documents/:doc_id/verify", h.VerifyDocument)

	// Publication endpoints
	router.Post("/:id/publish", h.PublishCandidate)
	router.Post("/:id/unpublish", h.UnpublishCandidate)
	router.Put("/:id/publication", h.UpdatePublicationSettings)
	router.Put("/reorder", h.ReorderCandidates)
}

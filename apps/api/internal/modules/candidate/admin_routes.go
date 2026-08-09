package candidate

import (
	"github.com/gofiber/fiber/v3"
	"github.com/redis/go-redis/v9"
	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/internal/modules/notification"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

// SetupAdminRoutes registers candidate verification routes for the admin portal.
func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, redisClient *redis.Client, log *zap.Logger, val *validator.Validator, st storage.Storage, cfg *config.Config, notifSvc notification.Service) {
	repo := NewRepository(db)
	auditSvc := audit.NewService(audit.NewRepository(db), log)
	maxUploadSize := int64(10 * 1024 * 1024)
	if cfg != nil && cfg.MaxUploadSize > 0 {
		maxUploadSize = cfg.MaxUploadSize
	}
	svc := NewService(repo, auditSvc, st, maxUploadSize, cfg, log, notifSvc, redisClient)
	h := NewAdminHandler(svc, val, log)

	// Admin candidate endpoints
	router.Post("/", h.CreateCandidate)
	router.Get("/", h.ListCandidates)
	router.Get("/export/csv", h.ExportCSV)
	router.Post("/bulk-delete", h.BulkDeleteCandidates)
	router.Put("/reorder", h.ReorderCandidates)
	router.Get("/:id", h.GetCandidateDetail)
	router.Put("/:id", h.UpdateCandidate)
	router.Delete("/:id", h.DeleteCandidate)
	router.Post("/:id/photo", h.UploadPhoto)
	router.Patch("/:id/verify", h.VerifyCandidate)
	router.Get("/:id/documents/:doc_id/stream", h.StreamDocument)
	router.Patch("/:id/documents/:doc_id/verify", h.VerifyDocument)

	// Publication endpoints
	router.Post("/:id/publish", h.PublishCandidate)
	router.Post("/:id/unpublish", h.UnpublishCandidate)
	router.Put("/:id/publication", h.UpdatePublicationSettings)
}

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
func SetupAdminRoutes(router fiber.Router, requirePermission func(string) fiber.Handler, db *sqlx.DB, redisClient *redis.Client, log *zap.Logger, val *validator.Validator, st storage.Storage, cfg *config.Config, notifSvc notification.Service) {
	repo := NewRepository(db)
	auditSvc := audit.NewService(audit.NewRepository(db), log)
	maxUploadSize := int64(10 * 1024 * 1024)
	if cfg != nil && cfg.MaxUploadSize > 0 {
		maxUploadSize = cfg.MaxUploadSize
	}
	svc := NewService(repo, auditSvc, st, maxUploadSize, cfg, log, notifSvc, redisClient)
	h := NewAdminHandler(svc, val, log)

	// Admin candidate endpoints
	router.Post("/", requirePermission("candidate.manage"), h.CreateCandidate)
	router.Get("/", requirePermission("candidate.read"), h.ListCandidates)
	router.Get("/export/csv", requirePermission("candidate.read"), h.ExportCSV)
	router.Post("/bulk-delete", requirePermission("candidate.manage"), h.BulkDeleteCandidates)
	router.Put("/reorder", requirePermission("candidate.manage"), h.ReorderCandidates)
	router.Get("/:id", requirePermission("candidate.read"), h.GetCandidateDetail)
	router.Put("/:id", requirePermission("candidate.manage"), h.UpdateCandidate)
	router.Delete("/:id", requirePermission("candidate.manage"), h.DeleteCandidate)
	router.Post("/:id/photo", requirePermission("candidate.manage"), h.UploadPhoto)
	router.Patch("/:id/verify", requirePermission("candidate.verify"), h.VerifyCandidate)
	router.Get("/:id/documents/:doc_id/stream", requirePermission("candidate.read"), h.StreamDocument)
	router.Patch("/:id/documents/:doc_id/verify", requirePermission("candidate.verify"), h.VerifyDocument)

	// Publication endpoints
	router.Post("/:id/publish", requirePermission("candidate.manage"), h.PublishCandidate)
	router.Post("/:id/unpublish", requirePermission("candidate.manage"), h.UnpublishCandidate)
	router.Put("/:id/publication", requirePermission("candidate.manage"), h.UpdatePublicationSettings)
}

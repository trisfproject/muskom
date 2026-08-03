package candidate

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
	
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func RegisterRoutes(api fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator, st storage.Storage, maxUploadSize int64) {
	repo := NewRepository(db)
	auditRepo := audit.NewRepository(db)
	auditSvc := audit.NewService(auditRepo, log)
	service := NewService(repo, auditSvc, st, maxUploadSize)
	handler := NewHandler(service, val)

	candidates := api.Group("/candidates")

	candidates.Post("/", handler.Create)
	candidates.Get("/", handler.GetAll)
	candidates.Get("/:id", handler.GetByID)
	candidates.Put("/:id", handler.Update)
	candidates.Patch("/:id", handler.Patch)
	candidates.Delete("/:id", handler.Delete)
	
	// Document endpoints
	candidates.Post("/:id/documents", handler.UploadDocument)
	candidates.Get("/:id/documents", handler.ListDocuments)
	candidates.Delete("/:id/documents/:doc_id", handler.DeleteDocument)
	candidates.Get("/:id/documents/:doc_id/stream", handler.StreamDocument)
}

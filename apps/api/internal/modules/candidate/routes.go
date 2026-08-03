package candidate

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/internal/modules/auth"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

// CandidateOwnerMiddleware ensures that the authenticated candidate can only access their own data
func CandidateOwnerMiddleware() fiber.Handler {
	return func(c fiber.Ctx) error {
		role, ok := c.Locals("role").(string)
		if !ok || role != "candidate" {
			return response.SendError(c, fiber.StatusForbidden, "Forbidden: Invalid role", nil)
		}

		userID, ok := c.Locals("user_id").(string)
		if !ok || userID != c.Params("id") {
			return response.SendError(c, fiber.StatusForbidden, "Forbidden: You don't own this candidate", nil)
		}

		return c.Next()
	}
}

func RegisterRoutes(api fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator, st storage.Storage, maxUploadSize int64, cfg *config.Config) {
	repo := NewRepository(db)
	auditRepo := audit.NewRepository(db)
	auditSvc := audit.NewService(auditRepo, log)
	service := NewService(repo, auditSvc, st, maxUploadSize, cfg, log)
	handler := NewHandler(service, val, log)

	candidates := api.Group("/candidates")

	// Public creation endpoint
	candidates.Post("/", handler.Create)

	// Protected endpoints (Requires Candidate JWT)
	protected := candidates.Group("/", auth.JWTMiddleware(cfg, log), CandidateOwnerMiddleware())

	protected.Get("/:id", handler.GetByID)
	protected.Put("/:id", handler.Update)
	protected.Patch("/:id", handler.Patch)
	protected.Delete("/:id", handler.Delete)

	// Document endpoints
	protected.Post("/:id/documents", handler.UploadDocument)
	protected.Get("/:id/documents", handler.ListDocuments)
	protected.Delete("/:id/documents/:doc_id", handler.DeleteDocument)
	protected.Get("/:id/documents/:doc_id/stream", handler.StreamDocument)
}

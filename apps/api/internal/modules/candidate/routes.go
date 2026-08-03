package candidate

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
	
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func RegisterRoutes(api fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator) {
	repo := NewRepository(db)
	auditRepo := audit.NewRepository(db)
	auditSvc := audit.NewService(auditRepo, log)
	service := NewService(repo, auditSvc)
	handler := NewHandler(service, val)

	candidates := api.Group("/candidates")

	candidates.Post("/", handler.Create)
	candidates.Get("/", handler.GetAll)
	candidates.Get("/:id", handler.GetByID)
	candidates.Put("/:id", handler.Update)
	candidates.Patch("/:id", handler.Patch)
	candidates.Delete("/:id", handler.Delete)
}

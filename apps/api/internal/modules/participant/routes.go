package participant

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

// SetupAdminRoutes registers participant module routes for admin
func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator) {
	// Initialize Dependencies
	repo := NewRepository(db)
	auditRepo := audit.NewRepository(db)
	auditSvc := audit.NewService(auditRepo, log)
	svc := NewService(repo, auditSvc)
	handler := NewHandler(svc, val)

	// Routes
	router.Get("/", handler.GetAll)
	router.Get("/stats", handler.GetStats) // aggregated dashboard stats — before /:id
	router.Post("/", handler.Create)
	router.Get("/:id", handler.GetByID)
	router.Put("/:id", handler.Update)
	router.Patch("/:id/status", handler.UpdateStatus)
	router.Delete("/:id", handler.Delete)
}

// SetupPublicRoutes registers public participant endpoints
func SetupPublicRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator) {
	repo := NewRepository(db)
	auditRepo := audit.NewRepository(db)
	auditSvc := audit.NewService(auditRepo, log)
	svc := NewService(repo, auditSvc)
	handler := NewHandler(svc, val)

	router.Post("/register", handler.PublicRegister)
}

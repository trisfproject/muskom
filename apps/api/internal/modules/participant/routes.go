package participant

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/platform/mailer"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// SetupAdminRoutes registers participant module routes for admin
func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator, m mailer.Mailer) {
	// Initialize Dependencies
	repo := NewRepository(db)
	auditRepo := audit.NewRepository(db)
	auditSvc := audit.NewService(auditRepo, log)
	svc := NewService(repo, auditSvc, m, nil, nil)
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
func SetupPublicRoutes(router fiber.Router, db *sqlx.DB, rdb *redis.Client, cfg *config.Config, log *zap.Logger, val *validator.Validator, m mailer.Mailer) {
	repo := NewRepository(db)
	auditRepo := audit.NewRepository(db)
	auditSvc := audit.NewService(auditRepo, log)
	svc := NewService(repo, auditSvc, m, rdb, cfg)
	handler := NewHandler(svc, val)

	router.Post("/register", handler.PublicRegister)
	router.Get("/verify-email", handler.VerifyEmail)
	router.Post("/resend-verification", handler.ResendVerification)
}

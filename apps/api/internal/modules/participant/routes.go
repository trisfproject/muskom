package participant

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/internal/modules/notification"
	"github.com/trisfproject/muskom/apps/api/internal/modules/website"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/mailer"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

// SetupAdminRoutes registers participant module routes for admin
func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator, m mailer.Mailer, notifSvc notification.Service) {
	// Initialize Dependencies
	repo := NewRepository(db)
	auditRepo := audit.NewRepository(db)
	auditSvc := audit.NewService(auditRepo, log)
	resolver := website.NewPhaseResolver(db)
	svc := NewService(repo, resolver, auditSvc, m, nil, nil, notifSvc)
	handler := NewHandler(svc, val)

	// Routes
	router.Get("/", handler.GetAll)
	router.Get("/stats", handler.GetStats) // aggregated dashboard stats — before /:id
	router.Post("/bulk-delete", handler.BulkDelete)
	router.Post("/bulk-status", handler.BulkUpdateStatus)
	router.Post("/", handler.Create)
	router.Get("/:id", handler.GetByID)
	router.Put("/:id", handler.Update)
	router.Patch("/:id/status", handler.UpdateStatus)
	router.Delete("/:id", handler.Delete)
}

// SetupPublicRoutes registers public participant endpoints
func SetupPublicRoutes(router fiber.Router, db *sqlx.DB, rdb *redis.Client, cfg *config.Config, log *zap.Logger, val *validator.Validator, m mailer.Mailer, notifSvc notification.Service) {
	repo := NewRepository(db)
	auditRepo := audit.NewRepository(db)
	auditSvc := audit.NewService(auditRepo, log)
	resolver := website.NewPhaseResolver(db)
	svc := NewService(repo, resolver, auditSvc, m, rdb, cfg, notifSvc)
	handler := NewHandler(svc, val)

	router.Get("/stats", handler.GetStats)
	router.Get("/capacity", handler.GetStats)
	router.Post("/register", handler.PublicRegister)
	router.Post("/lookup", handler.LookupParticipant)
	router.Get("/verify-email", handler.VerifyEmail)
	router.Post("/resend-verification", handler.ResendVerification)
}

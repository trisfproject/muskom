package musyawarah

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

// SetupRoutes registers all routes for the Musyawarah Configuration module.
func SetupRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator) {
	repo := NewRepository(db)
	svc := NewService(repo, log)
	handler := NewHandler(svc, val)

	router.Get("/", handler.Get)
	router.Put("/", handler.Update)
	router.Get("/timeline", handler.GetTimeline)
	router.Put("/timeline", handler.UpdateTimeline)
}

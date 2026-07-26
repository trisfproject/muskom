package event

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

// SetupRoutes registers all routes for the Event module.
func SetupRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator) {
	repo := NewRepository(db)
	svc := NewService(repo, log)
	handler := NewHandler(svc, val)

	router.Post("/", handler.Create)
	router.Get("/", handler.List)
	router.Get("/:id", handler.Get)
	router.Put("/:id", handler.Update)
	router.Delete("/:id", handler.Delete)
}

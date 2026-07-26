package auth

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

// SetupRoutes wires the Auth module dependencies and registers the routes.
func SetupRoutes(router fiber.Router, db *sqlx.DB, cfg *config.Config, log *zap.Logger, val *validator.Validator) {
	repo := NewRepository(db)
	svc := NewService(repo, cfg, log)
	handler := NewHandler(svc, val)

	router.Post("/login", handler.Login)
}

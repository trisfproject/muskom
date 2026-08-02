package user

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func SetupRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator) {
	repo := NewRepository(db)
	svc := NewService(repo, log)
	handler := NewHandler(svc, val)

	router.Get("/", handler.List)
	router.Post("/", handler.Create)
	router.Get("/:id", handler.Get)
	router.Patch("/:id/role", handler.UpdateRole)
	router.Patch("/:id/status", handler.UpdateStatus)
	router.Post("/:id/password-reset", handler.ResetPassword)
}

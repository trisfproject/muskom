package registration

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func SetupRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator) {
	repo := NewRepository(db)
	svc := NewService(repo, log, val)
	handler := NewHandler(svc)

	router.Post("/", handler.Register)
	router.Get("/:registration_code", handler.GetStatus)
}

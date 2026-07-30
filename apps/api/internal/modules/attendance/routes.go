package attendance

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator) {
	repo := NewRepository(db)
	svc := NewService(repo, log, val)
	h := NewHandler(svc)

	router.Post("/check-in", h.CheckIn)
	router.Get("/:participantId", h.GetAttendance)
}

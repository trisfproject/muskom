package verification

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

	router.Get("/", h.ListVerifications)
	router.Get("/summary", h.GetSummary)

	// Participant Verification
	router.Get("/participants/:id", h.GetParticipant)
	router.Patch("/participants/:id", h.VerifyParticipant)
}

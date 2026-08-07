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

	// Participant Verification (support plural, singular, PUT, PATCH, and /status suffix)
	router.Get("/participants/:id", h.GetParticipant)
	router.Patch("/participants/:id", h.VerifyParticipant)
	router.Put("/participants/:id", h.VerifyParticipant)
	router.Patch("/participants/:id/status", h.VerifyParticipant)
	router.Put("/participants/:id/status", h.VerifyParticipant)

	router.Get("/participant/:id", h.GetParticipant)
	router.Patch("/participant/:id", h.VerifyParticipant)
	router.Put("/participant/:id", h.VerifyParticipant)
	router.Patch("/participant/:id/status", h.VerifyParticipant)
	router.Put("/participant/:id/status", h.VerifyParticipant)

	// Candidate Verification (support plural, singular, PUT, PATCH, and /status suffix)
	router.Get("/candidates/:id", h.GetCandidate)
	router.Patch("/candidates/:id", h.VerifyCandidate)
	router.Put("/candidates/:id", h.VerifyCandidate)
	router.Patch("/candidates/:id/status", h.VerifyCandidate)
	router.Put("/candidates/:id/status", h.VerifyCandidate)

	router.Get("/candidate/:id", h.GetCandidate)
	router.Patch("/candidate/:id", h.VerifyCandidate)
	router.Put("/candidate/:id", h.VerifyCandidate)
	router.Patch("/candidate/:id/status", h.VerifyCandidate)
	router.Put("/candidate/:id/status", h.VerifyCandidate)
}

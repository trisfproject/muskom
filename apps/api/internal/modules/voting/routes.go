package voting

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/platform/eventbus"
	"go.uber.org/zap"
)

func SetupRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, bus eventbus.EventDispatcher) {
	repo := NewRepository(db)
	svc := NewService(db, repo, bus, log)
	handler := NewHandler(svc)

	// Public / Voter Routes
	router.Get("/ballot", handler.GetBallot)
	router.Post("/cast", handler.CastVote)
}

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, bus eventbus.EventDispatcher) {
	repo := NewRepository(db)
	svc := NewService(db, repo, bus, log)
	handler := NewHandler(svc)

	// Admin / Operator Routes
	router.Get("/summary", handler.GetSummary)
}

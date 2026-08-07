package voting

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/internal/modules/notification"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/eventbus"
	"go.uber.org/zap"
)

func SetupRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, bus eventbus.EventDispatcher, notifSvc notification.Service, cfg *config.Config) {
	repo := NewRepository(db)
	svc := NewService(db, repo, bus, log, notifSvc, cfg)
	handler := NewHandler(svc)

	// Public / Voter Routes
	router.Get("/ballot", handler.GetBallot)
	router.Post("/cast", handler.CastVote)
}

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, bus eventbus.EventDispatcher, notifSvc notification.Service, cfg *config.Config) {
	repo := NewRepository(db)
	svc := NewService(db, repo, bus, log, notifSvc, cfg)
	handler := NewHandler(svc)

	// Admin / Operator Routes
	router.Get("/summary", handler.GetSummary)
	router.Get("/session", handler.GetSession)
	router.Post("/session/:action", handler.UpdateSession)
	router.Put("/session/:action", handler.UpdateSession)
	
	router.Post("/broadcast-invitation", handler.BroadcastInvitation)
	router.Post("/broadcast-reminder", handler.BroadcastReminder)
}

package evoting

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/internal/modules/notification"
	"github.com/trisfproject/muskom/apps/api/internal/modules/voting"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/eventbus"
)

// SetupRoutes mounts the Bilik Suara Digital access and voting proxy routes.
func SetupRoutes(router fiber.Router, db *sqlx.DB, rdb *redis.Client, log *zap.Logger, bus eventbus.EventDispatcher, notifSvc notification.Service, cfg *config.Config) {
	limiter := NewRedisRateLimiter(rdb)
	handler := NewHandler(cfg, log, limiter)

	// Public: authenticate with access code (rate-limited)
	router.Post("/auth", handler.Authenticate)

	// Protected by evoting session: voting proxy endpoints
	protected := router.Group("/", SessionMiddleware(cfg))
	protected.Get("/session", handler.CheckSession)

	// Reuse existing voting service for ballot/eligibility/cast
	votingRepo := voting.NewRepository(db)
	votingSvc := voting.NewService(db, votingRepo, bus, log, notifSvc, cfg)
	votingHandler := voting.NewHandler(votingSvc)

	protected.Get("/ballot", votingHandler.GetBallot)
	protected.Get("/eligibility", votingHandler.CheckEligibility)
	protected.Post("/cast", votingHandler.CastVote)
}

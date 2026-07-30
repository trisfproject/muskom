package voting

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

func SetupRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator) {
	repo := NewRepository(db)
	svc := NewService(repo, log)
	handler := NewHandler(svc, val)

	router.Post("/", handler.SubmitVote)
	router.Get("/me", handler.GetMyVoteStatus)
}

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator) {
	repo := NewRepository(db)
	svc := NewService(repo, log)
	handler := NewHandler(svc, val)

	router.Get("/", handler.AdminListVotes)
	router.Get("/statistics", handler.AdminGetVoteStatistics)
	router.Get("/:id", handler.AdminGetVote)
}

package audit

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger) {
	repo := NewRepository(db)
	svc := NewService(repo, log)
	h := NewHandler(svc)

	router.Get("/", h.Search)
	router.Get("/export", h.Export)
	router.Get("/:id", h.GetByID)
}

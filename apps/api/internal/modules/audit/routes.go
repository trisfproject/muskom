package audit

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
)

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB) {
	repo := NewRepository(db)
	svc := NewService(repo)
	h := NewHandler(svc)

	router.Get("/", h.Search)
	router.Get("/:id", h.GetByID)
}

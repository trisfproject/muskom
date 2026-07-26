package auth

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

// SetupRoutes wires the Auth module dependencies.
// Login routes will be registered here in future tasks.
func SetupRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger) {
	repo := NewRepository(db)
	svc := NewService(repo, log)
	_ = NewHandler(svc) // Handler instantiated but not attached to routes yet
}

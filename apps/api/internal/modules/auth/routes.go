package auth

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func SetupRoutes(router fiber.Router, db *sqlx.DB, rdb *redis.Client, cfg *config.Config, log *zap.Logger, val *validator.Validator) {
	repo := NewRepository(db)
	svc := NewService(repo, rdb, cfg, log)
	handler := NewHandler(svc, val)

	router.Post("/login", handler.Login)
	router.Post("/refresh", handler.Refresh)
	router.Post("/logout", JWTMiddleware(cfg, log), handler.Logout)
}

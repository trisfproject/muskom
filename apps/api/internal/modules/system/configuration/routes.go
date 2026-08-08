package configuration

import (
	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/mailer"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func SetupPublicRoutes(router fiber.Router, service Service, val *validator.Validator, cfg *config.Config, m mailer.Mailer) {
	handler := NewHandler(service, val, cfg, m)
	router.Get("/", handler.HandleGetConfig)
}

func SetupAdminRoutes(router fiber.Router, service Service, val *validator.Validator, cfg *config.Config, m mailer.Mailer) {
	handler := NewHandler(service, val, cfg, m)

	router.Get("/", handler.HandleGetConfig)

	// Admin SMTP
	router.Get("/smtp/config", handler.HandleGetSMTPConfig)
	router.Put("/smtp/config", handler.HandleUpdateSMTPConfig)
	router.Post("/smtp/test-connection", handler.HandleTestSMTPConnection)
	router.Post("/smtp/test", handler.HandleTestSMTP)

	// Admin update configuration
	router.Put("/:group", handler.HandleUpdateConfig)
}

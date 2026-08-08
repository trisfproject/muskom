package registration

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/mailer"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func SetupRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator, strg storage.Storage, maxSize int64, mailerSvc mailer.Mailer, cfg *config.Config) {
	repo := NewRepository(db)
	svc := NewService(repo, log, val, strg, maxSize, mailerSvc, cfg)
	handler := NewHandler(svc)

	router.Post("/", handler.Register)
	router.Get("/:registration_code", handler.GetStatus)
	router.Get("/:registration_code/confirmation", handler.GetConfirmation)
	router.Post("/lookup", handler.LookupParticipant)
	router.Post("/:registration_code/attachments", handler.UploadAttachment)
	router.Get("/:registration_code/attachments", handler.GetAttachments)
	router.Delete("/:registration_code/attachments/:attachment_id", handler.DeleteAttachment)
}

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator, strg storage.Storage, maxSize int64, mailerSvc mailer.Mailer, cfg *config.Config) {
	repo := NewRepository(db)
	svc := NewService(repo, log, val, strg, maxSize, mailerSvc, cfg)
	handler := NewHandler(svc)

	router.Get("/", handler.AdminList)
	router.Get("/:id", handler.AdminGet)
	router.Patch("/:id/status", handler.AdminUpdateStatus)
	router.Get("/:id/emails", handler.AdminGetEmailHistory)
	router.Post("/:id/emails/resend", handler.AdminResendEmail)
}

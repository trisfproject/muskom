package registration

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func SetupRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator, strg storage.Storage, maxSize int64) {
	repo := NewRepository(db)
	svc := NewService(repo, log, val, strg, maxSize)
	handler := NewHandler(svc)

	router.Post("/", handler.Register)
	router.Get("/:registration_code", handler.GetStatus)
	router.Get("/:registration_code/confirmation", handler.GetConfirmation)

	router.Post("/:registration_code/attachments", handler.UploadAttachment)
	router.Get("/:registration_code/attachments", handler.GetAttachments)
	router.Delete("/:registration_code/attachments/:attachment_id", handler.DeleteAttachment)
}

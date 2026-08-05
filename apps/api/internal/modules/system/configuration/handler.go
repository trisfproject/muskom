package configuration

import (
	"github.com/gofiber/fiber/v3"
	"strings"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/mailer"
	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

type Handler struct {
	service Service
	val     *validator.Validator
	cfg     *config.Config
	mailer  mailer.Mailer
}

func NewHandler(service Service, val *validator.Validator, cfg *config.Config, m mailer.Mailer) *Handler {
	return &Handler{
		service: service,
		val:     val,
		cfg:     cfg,
		mailer:  m,
	}
}

// HandleGetConfig retrieves the aggregated system configuration.
func (h *Handler) HandleGetConfig(c fiber.Ctx) error {
	ctx := c.Context()

	config, err := h.service.GetSystemConfig(ctx)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve system configuration", []response.ErrorDetail{{Message: err.Error()}})
	}

	return response.SendSuccess(c, fiber.StatusOK, "System configuration retrieved successfully", config, nil)
}

// HandleUpdateConfig updates a specific configuration group.
func (h *Handler) HandleUpdateConfig(c fiber.Ctx) error {
	ctx := c.Context()
	groupName := c.Params("group")

	var req UpdateConfigRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", []response.ErrorDetail{{Message: err.Error()}})
	}
	req.GroupName = groupName

	// Validate Request
	if errs := h.val.ValidateStruct(req); errs != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	// In a real scenario, extract updatedBy from context (e.g. from JWT middleware)
	// For now, we leave it nil
	var updatedBy *string = nil

	if err := h.service.UpdateConfigGroup(ctx, req, updatedBy); err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update configuration", []response.ErrorDetail{{Message: err.Error()}})
	}

	return response.SendSuccess(c, fiber.StatusOK, "Configuration updated successfully", nil, nil)
}

func (h *Handler) HandleGetSMTPConfig(c fiber.Ctx) error {
	if h.cfg == nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Config not loaded", nil)
	}

	maskedPass := ""
	if h.cfg.SmtpPassword != "" {
		maskedPass = strings.Repeat("*", len(h.cfg.SmtpPassword))
	}

	smtpConfig := fiber.Map{
		"enabled":   h.cfg.MailEnabled,
		"host":      h.cfg.SmtpHost,
		"port":      h.cfg.SmtpPort,
		"username":  h.cfg.SmtpUsername,
		"password":  maskedPass,
		"fromName":  h.cfg.SmtpFromName,
		"fromEmail": h.cfg.SmtpFrom,
	}

	return response.SendSuccess(c, fiber.StatusOK, "SMTP configuration retrieved", smtpConfig, nil)
}

func (h *Handler) HandleTestSMTP(c fiber.Ctx) error {
	var req struct {
		Email string `json:"email" validate:"required,email"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid payload", nil)
	}
	if errs := h.val.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation error", errs)
	}

	err := h.mailer.SendTestEmail(req.Email)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Failed to send test email: "+err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Test email sent successfully", nil, nil)
}

package configuration

import (
	"encoding/json"
	"strings"

	"github.com/gofiber/fiber/v3"
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

func (h *Handler) HandleUpdateSMTPConfig(c fiber.Ctx) error {
	if h.cfg == nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Config not loaded", nil)
	}

	var req struct {
		Enabled      bool   `json:"enabled"`
		Host         string `json:"host" validate:"required"`
		Port         int    `json:"port" validate:"required,min=1,max=65535"`
		Username     string `json:"username"`
		Password     string `json:"password"`
		FromName     string `json:"from_name"`
		FromNameAlt  string `json:"fromName"`
		FromEmail    string `json:"from_email"`
		FromEmailAlt string `json:"fromEmail"`
	}

	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid payload", nil)
	}

	fromName := req.FromName
	if fromName == "" {
		fromName = req.FromNameAlt
	}
	fromEmail := req.FromEmail
	if fromEmail == "" {
		fromEmail = req.FromEmailAlt
	}

	h.cfg.MailEnabled = req.Enabled
	if req.Host != "" {
		h.cfg.SmtpHost = req.Host
	}
	if req.Port > 0 {
		h.cfg.SmtpPort = req.Port
	}
	h.cfg.SmtpUsername = req.Username
	// Only update password if not empty and not asterisks
	if req.Password != "" && !strings.HasPrefix(req.Password, "*") {
		h.cfg.SmtpPassword = req.Password
	}
	if fromName != "" {
		h.cfg.SmtpFromName = fromName
	}
	if fromEmail != "" {
		h.cfg.SmtpFrom = fromEmail
	}

	// Persist to database
	smtpEntity := SMTPConfig{
		Enabled:   h.cfg.MailEnabled,
		Host:      h.cfg.SmtpHost,
		Port:      h.cfg.SmtpPort,
		Username:  h.cfg.SmtpUsername,
		Password:  h.cfg.SmtpPassword,
		FromName:  h.cfg.SmtpFromName,
		FromEmail: h.cfg.SmtpFrom,
	}

	settingsBytes, err := json.Marshal(smtpEntity)
	if err == nil {
		var updatedBy *string
		if uid, ok := c.Locals("user_id").(string); ok && uid != "" {
			updatedBy = &uid
		}
		_ = h.service.UpdateConfigGroup(c.Context(), UpdateConfigRequest{
			GroupName: "smtp",
			Settings:  settingsBytes,
		}, updatedBy)
	}

	return response.SendSuccess(c, fiber.StatusOK, "SMTP configuration updated successfully", nil, nil)
}

func (h *Handler) HandleTestSMTPConnection(c fiber.Ctx) error {
	if err := h.mailer.TestConnection(); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "SMTP connection test failed: "+err.Error(), nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "SMTP connection test successful", nil, nil)
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

package configuration

import (
	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

type Handler struct {
	service Service
	val     *validator.Validator
}

func NewHandler(service Service, val *validator.Validator) *Handler {
	return &Handler{
		service: service,
		val:     val,
	}
}

// HandleGetConfig retrieves the aggregated system configuration.
func (h *Handler) HandleGetConfig(c fiber.Ctx) error {
	ctx := c.Context()

	config, err := h.service.GetSystemConfig(ctx)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve system configuration", []response.ErrorDetail{{Message: err.Error()}})
	}

	return response.SendSuccess(c, fiber.StatusOK, "System configuration retrieved successfully", SystemConfigResponse{
		Message: "Success",
		Data:    *config,
	}, nil)
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

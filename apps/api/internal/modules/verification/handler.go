package verification

import (
	"errors"

	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) ListVerifications(c fiber.Ctx) error {
	var filter VerificationListRequest
	if err := c.Bind().Query(&filter); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid query parameters", nil)
	}

	list, total, err := h.service.ListVerifications(c.Context(), filter)
	if err != nil {
		var valErr *ValidationError
		if errors.As(err, &valErr) {
			return response.SendError(c, fiber.StatusBadRequest, "Validation error", valErr.Details)
		}
		return response.SendError(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Verification queue retrieved successfully", fiber.Map{
		"data":  list,
		"total": total,
	}, nil)
}

func (h *Handler) GetSummary(c fiber.Ctx) error {
	summary, err := h.service.GetSummary(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Verification summary retrieved successfully", summary, nil)
}

package public

import (
	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetHome(c fiber.Ctx) error {
	ctx := c.Context()
	homeData, err := h.service.GetPublicHome(ctx)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve public home data", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Public home data retrieved successfully", homeData, nil)
}

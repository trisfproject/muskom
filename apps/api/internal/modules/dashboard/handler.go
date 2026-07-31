package dashboard

import (
	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/eventctx"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetDashboardSummary(c fiber.Ctx) error {
	evtCtx := eventctx.Get(c)
	if evtCtx == nil {
		return response.SendError(c, fiber.StatusBadRequest, "No active event context", nil)
	}

	data, err := h.service.GetDashboardData(c.Context(), evtCtx.ID)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to aggregate dashboard data", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Dashboard data retrieved", data, nil)
}

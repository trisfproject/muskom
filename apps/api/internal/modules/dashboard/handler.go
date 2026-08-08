package dashboard

import (
	"database/sql"

	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetDashboardSummary(c fiber.Ctx) error {
	data, err := h.service.GetDashboardData(c.Context())
	if err != nil {
		if err == sql.ErrNoRows {
			return response.SendError(c, fiber.StatusNotFound, "No active musyawarah found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to aggregate dashboard data", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Dashboard data retrieved", data, nil)
}

func (h *Handler) GetOperationsDashboard(c fiber.Ctx) error {
	data, err := h.service.GetOperationsData(c.Context())
	if err != nil {
		if err == sql.ErrNoRows {
			return response.SendError(c, fiber.StatusNotFound, "No data found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to fetch operations data", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Operations data retrieved", data, nil)
}

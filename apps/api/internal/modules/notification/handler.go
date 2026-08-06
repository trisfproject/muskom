package notification

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

func (h *Handler) ListJobs(c fiber.Ctx) error {

	jobs, err := h.service.ListJobs(c.Context(), "")
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get jobs", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Jobs retrieved", jobs, nil)
}

func (h *Handler) ListHistory(c fiber.Ctx) error {

	history, err := h.service.ListHistory(c.Context(), "")
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get history", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "History retrieved", history, nil)
}

func (h *Handler) ListTemplates(c fiber.Ctx) error {
	tpls, err := h.service.ListTemplates(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get templates", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Templates retrieved", tpls, nil)
}

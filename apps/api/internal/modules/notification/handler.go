package notification

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

func (h *Handler) ListJobs(c fiber.Ctx) error {
	evtCtx := eventctx.Get(c)
	if evtCtx == nil {
		return response.SendError(c, fiber.StatusBadRequest, "No active event context", nil)
	}

	jobs, err := h.service.ListJobs(c.Context(), evtCtx.ID)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get jobs", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Jobs retrieved", jobs, nil)
}

func (h *Handler) ListHistory(c fiber.Ctx) error {
	evtCtx := eventctx.Get(c)
	if evtCtx == nil {
		return response.SendError(c, fiber.StatusBadRequest, "No active event context", nil)
	}

	history, err := h.service.ListHistory(c.Context(), evtCtx.ID)
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

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

	jobs, err := h.service.ListJobs(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get jobs", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Jobs retrieved", jobs, nil)
}

func (h *Handler) ListHistory(c fiber.Ctx) error {

	history, err := h.service.ListHistory(c.Context())
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

func (h *Handler) GetTemplate(c fiber.Ctx) error {
	id := c.Params("id")
	tpl, err := h.service.GetTemplate(c.Context(), id)
	if err != nil {
		return response.SendError(c, fiber.StatusNotFound, "Template not found", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Template retrieved", tpl, nil)
}

func (h *Handler) UpdateTemplate(c fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Subject *string `json:"subject"`
		Body    string  `json:"body"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}
	
	err := h.service.UpdateTemplate(c.Context(), id, req.Subject, req.Body)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update template", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Template updated", nil, nil)
}

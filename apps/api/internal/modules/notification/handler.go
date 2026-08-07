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

func (h *Handler) RetryJob(c fiber.Ctx) error {
	id := c.Params("id")
	err := h.service.RetryJob(c.Context(), id)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retry job", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Job queued for retry", nil, nil)
}

func (h *Handler) TestSMTP(c fiber.Ctx) error {
	var req struct {
		Email string `json:"email"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}
	
	err := h.service.TestSMTP(c.Context(), req.Email)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to send test email", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Test email queued", nil, nil)
}

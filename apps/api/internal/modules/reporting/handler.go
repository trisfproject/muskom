package reporting

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

func (h *Handler) GetOfficialResult(c fiber.Ctx) error {

	res, err := h.service.GetOfficialResult(c.Context(), "")
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get official result", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Official result retrieved", res, nil)
}

func (h *Handler) GenerateExport(c fiber.Ctx) error {

	userIDStr, _ := c.Locals("user_id").(string)

	var req struct {
		ReportType ReportType `json:"report_type"`
		Format     FileFormat `json:"format"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid payload", nil)
	}

	history, err := h.service.GenerateExport(c.Context(), "", userIDStr, req.ReportType, req.Format)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to generate export", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Export generated successfully", history, nil)
}

func (h *Handler) GetReportHistory(c fiber.Ctx) error {

	history, err := h.service.GetReportHistory(c.Context(), "")
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get report history", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Report history retrieved", history, nil)
}

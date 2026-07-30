package result

import (
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

type Handler interface {
	AdminGetOverview(c fiber.Ctx) error
	AdminGetCandidates(c fiber.Ctx) error
	AdminGetSummary(c fiber.Ctx) error
	AdminGetAudit(c fiber.Ctx) error
	// PublicGetResults is intentionally omitted pending PRD publication timing rules
}

type handler struct {
	svc Service
}

func NewHandler(svc Service) Handler {
	return &handler{svc: svc}
}

func (h *handler) AdminGetOverview(c fiber.Ctx) error {
	eventIDParam := c.Params("eventId")
	eventID, err := uuid.Parse(eventIDParam)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid event ID format", nil)
	}

	res, err := h.svc.GetElectionOverview(c.Context(), eventID)
	if err != nil {
		if err == ErrEventNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Event not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get overview", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Election overview retrieved successfully", res, nil)
}

func (h *handler) AdminGetCandidates(c fiber.Ctx) error {
	eventIDParam := c.Params("eventId")
	eventID, err := uuid.Parse(eventIDParam)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid event ID format", nil)
	}

	res, err := h.svc.GetElectionResults(c.Context(), eventID)
	if err != nil {
		if err == ErrEventNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Event not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to calculate election results", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Election candidates retrieved successfully", res.Candidates, nil)
}

func (h *handler) AdminGetSummary(c fiber.Ctx) error {
	eventIDParam := c.Params("eventId")
	eventID, err := uuid.Parse(eventIDParam)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid event ID format", nil)
	}

	res, err := h.svc.GetElectionResults(c.Context(), eventID)
	if err != nil {
		if err == ErrEventNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Event not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to calculate election results", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Election summary retrieved successfully", res, nil)
}

func (h *handler) AdminGetAudit(c fiber.Ctx) error {
	eventIDParam := c.Params("eventId")
	eventID, err := uuid.Parse(eventIDParam)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid event ID format", nil)
	}

	req := AdminListAuditRequest{}
	if err := c.Bind().Query(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid query parameters", nil)
	}

	res, err := h.svc.GetAuditLogs(c.Context(), eventID, req)
	if err != nil {
		if err == ErrEventNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Event not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve audit logs", nil)
	}

	meta := fiber.Map{
		"total":       res.Total,
		"page":        res.Page,
		"total_pages": res.TotalPages,
	}
	return response.SendSuccess(c, fiber.StatusOK, "Election audit logs retrieved successfully", res.Data, meta)
}

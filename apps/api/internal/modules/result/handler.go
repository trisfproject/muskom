package result

import (
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

type Handler interface {
	AdminGetResults(c fiber.Ctx) error
	// PublicGetResults is intentionally omitted pending PRD publication timing rules
}

type handler struct {
	svc Service
}

func NewHandler(svc Service) Handler {
	return &handler{svc: svc}
}

func (h *handler) AdminGetResults(c fiber.Ctx) error {
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

	return response.SendSuccess(c, fiber.StatusOK, "Election results retrieved successfully", res, nil)
}

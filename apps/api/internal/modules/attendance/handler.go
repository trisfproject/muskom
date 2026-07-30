package attendance

import (
	"errors"

	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) CheckIn(c fiber.Ctx) error {
	var req CheckInRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	operatorID, ok := c.Locals("user_id").(string)
	if !ok || operatorID == "" {
		return response.SendError(c, fiber.StatusUnauthorized, "Unauthorized operator", nil)
	}

	res, err := h.service.CheckIn(c.Context(), &req, operatorID)
	if err != nil {
		var valErr *ValidationError
		if errors.As(err, &valErr) {
			return response.SendError(c, fiber.StatusBadRequest, "Validation error", valErr.Details)
		}
		if err.Error() == "cannot check-in: participant is not APPROVED" {
			return response.SendError(c, fiber.StatusConflict, err.Error(), nil)
		}
		if err.Error() == "participant not found" {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	if res.IsNew {
		return response.SendSuccess(c, fiber.StatusCreated, "Participant checked in successfully", res, nil)
	}

	// Idempotent case
	return response.SendSuccess(c, fiber.StatusOK, "Participant is already checked in", res, nil)
}

func (h *Handler) GetAttendance(c fiber.Ctx) error {
	id := c.Params("participantId")
	if id == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Participant ID is required", nil)
	}

	detail, err := h.service.GetAttendance(c.Context(), id)
	if err != nil {
		return response.SendError(c, fiber.StatusNotFound, "Attendance record not found", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Attendance record retrieved", detail, nil)
}

package verification

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

func (h *Handler) ListVerifications(c fiber.Ctx) error {
	var filter VerificationListRequest
	if err := c.Bind().Query(&filter); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid query parameters", nil)
	}

	list, total, err := h.service.ListVerifications(c.Context(), filter)
	if err != nil {
		var valErr *ValidationError
		if errors.As(err, &valErr) {
			return response.SendError(c, fiber.StatusBadRequest, "Validation error", valErr.Details)
		}
		return response.SendError(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Verification queue retrieved successfully", fiber.Map{
		"data":  list,
		"total": total,
	}, nil)
}

func (h *Handler) GetSummary(c fiber.Ctx) error {
	summary, err := h.service.GetSummary(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Verification summary retrieved successfully", summary, nil)
}

func (h *Handler) GetParticipant(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Participant verification ID is required", nil)
	}

	detail, err := h.service.GetParticipantVerification(c.Context(), id)
	if err != nil {
		return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Participant verification detail retrieved", detail, nil)
}

func (h *Handler) VerifyParticipant(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Participant verification ID is required", nil)
	}

	var req VerifyParticipantRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	verifierID, ok := c.Locals("user_id").(string)
	if !ok || verifierID == "" {
		return response.SendError(c, fiber.StatusUnauthorized, "Unauthorized verifier", nil)
	}

	if err := h.service.VerifyParticipant(c.Context(), id, &req, verifierID); err != nil {
		var valErr *ValidationError
		if errors.As(err, &valErr) {
			return response.SendError(c, fiber.StatusBadRequest, "Validation error", valErr.Details)
		}
		if err.Error() == "cannot verify participant: invalid state transition, status is not PENDING" {
			return response.SendError(c, fiber.StatusConflict, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Participant verification updated successfully", nil, nil)
}

func (h *Handler) GetCandidate(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Candidate verification ID is required", nil)
	}

	detail, err := h.service.GetCandidateVerification(c.Context(), id)
	if err != nil {
		return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate verification detail retrieved", detail, nil)
}

func (h *Handler) VerifyCandidate(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Candidate verification ID is required", nil)
	}

	var req VerifyCandidateRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	verifierID, ok := c.Locals("user_id").(string)
	if !ok || verifierID == "" {
		return response.SendError(c, fiber.StatusUnauthorized, "Unauthorized verifier", nil)
	}

	if err := h.service.VerifyCandidate(c.Context(), id, &req, verifierID); err != nil {
		var valErr *ValidationError
		if errors.As(err, &valErr) {
			return response.SendError(c, fiber.StatusBadRequest, "Validation error", valErr.Details)
		}
		if err.Error() == "cannot verify candidate: invalid state transition, already finalized" ||
			err.Error() == "cannot verify candidate: SUBMITTED must transition to REVIEWING first" ||
			err.Error() == "cannot verify candidate: REVIEWING must transition to ACCEPTED or REJECTED" {
			return response.SendError(c, fiber.StatusConflict, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate verification updated successfully", nil, nil)
}

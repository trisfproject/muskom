package voting

import (
	"errors"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

type Handler struct {
	service Service
	val     *validator.Validator
}

func NewHandler(service Service, val *validator.Validator) *Handler {
	return &Handler{
		service: service,
		val:     val,
	}
}

func (h *Handler) SubmitVote(c fiber.Ctx) error {
	userIDStr := c.Locals("user_id").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return response.SendError(c, fiber.StatusUnauthorized, "Invalid user context", nil)
	}

	var req SubmitVoteRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.val.ValidateStruct(req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	err = h.service.SubmitVote(c.Context(), userID, &req)
	if err != nil {
		switch {
		case errors.Is(err, ErrParticipantNotFound):
			return response.SendError(c, fiber.StatusForbidden, "Participant is not verified or not found", nil)
		case errors.Is(err, ErrVotingClosed):
			return response.SendError(c, fiber.StatusForbidden, "Voting is not currently open for this event", nil)
		case errors.Is(err, ErrNotCheckedIn):
			return response.SendError(c, fiber.StatusForbidden, "You must check in to the event before voting", nil)
		case errors.Is(err, ErrInvalidCandidate):
			return response.SendError(c, fiber.StatusBadRequest, "Invalid candidate selection", nil)
		case errors.Is(err, ErrAlreadyVoted):
			return response.SendError(c, fiber.StatusConflict, "You have already cast a vote for this event", nil)
		default:
			return response.SendError(c, fiber.StatusInternalServerError, "Failed to submit vote", nil)
		}
	}

	return response.SendSuccess(c, fiber.StatusCreated, "Vote submitted successfully", nil, nil)
}

func (h *Handler) GetMyVoteStatus(c fiber.Ctx) error {
	userIDStr := c.Locals("user_id").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return response.SendError(c, fiber.StatusUnauthorized, "Invalid user context", nil)
	}

	eventIDStr := c.Query("event_id")
	if eventIDStr == "" {
		return response.SendError(c, fiber.StatusBadRequest, "event_id query parameter is required", nil)
	}

	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid event_id format", nil)
	}

	status, err := h.service.GetMyVoteStatus(c.Context(), userID, eventID)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve vote status", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Vote status retrieved successfully", status, nil)
}

func (h *Handler) AdminListVotes(c fiber.Ctx) error {
	var req AdminListVotesRequest
	if err := c.Bind().Query(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid query parameters", nil)
	}

	res, err := h.service.AdminListVotes(c.Context(), req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve votes", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Votes retrieved successfully", res, nil)
}

func (h *Handler) AdminGetVote(c fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid vote ID format", nil)
	}

	vote, err := h.service.AdminGetVote(c.Context(), id)
	if err != nil {
		if errors.Is(err, ErrVoteNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "Vote not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve vote details", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Vote details retrieved successfully", vote, nil)
}

func (h *Handler) AdminGetVoteStatistics(c fiber.Ctx) error {
	eventIDParam := c.Query("event_id")
	if eventIDParam == "" {
		return response.SendError(c, fiber.StatusBadRequest, "event_id query parameter is required", nil)
	}

	eventID, err := uuid.Parse(eventIDParam)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid event_id format", nil)
	}

	stats, err := h.service.AdminGetVoteStatistics(c.Context(), eventID)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve vote statistics", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Vote statistics retrieved successfully", stats, nil)
}

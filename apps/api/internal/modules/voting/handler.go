package voting

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

func (h *Handler) GetBallot(c fiber.Ctx) error {
	evtCtx := eventctx.Get(c)
	if evtCtx == nil {
		return response.SendError(c, fiber.StatusBadRequest, "No active event context", nil)
	}

	ballot, err := h.service.GetBallot(c.Context(), evtCtx.ID)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get ballot", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Ballot retrieved", ballot, nil)
}

func (h *Handler) CastVote(c fiber.Ctx) error {
	evtCtx := eventctx.Get(c)
	if evtCtx == nil {
		return response.SendError(c, fiber.StatusBadRequest, "No active event context", nil)
	}

	var req struct {
		RegistrationID string `json:"registration_id"`
		CandidateID    string `json:"candidate_id"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid payload", nil)
	}

	err := h.service.CastVote(c.Context(), evtCtx.ID, req.RegistrationID, req.CandidateID)
	if err != nil {
		if err == ErrAlreadyVoted {
			return response.SendError(c, fiber.StatusConflict, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Vote cast successfully", nil, nil)
}

func (h *Handler) GetSummary(c fiber.Ctx) error {
	evtCtx := eventctx.Get(c)
	if evtCtx == nil {
		return response.SendError(c, fiber.StatusBadRequest, "No active event context", nil)
	}

	summary, err := h.service.GetSummary(c.Context(), evtCtx.ID)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get summary", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Summary retrieved", summary, nil)
}

package voting

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

func (h *Handler) GetBallot(c fiber.Ctx) error {

	ballot, err := h.service.GetBallot(c.Context(), "")
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get ballot", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Ballot retrieved", ballot, nil)
}

func (h *Handler) CastVote(c fiber.Ctx) error {

	var req struct {
		ParticipantID string `json:"participant_id"`
		CandidateID   string `json:"candidate_id"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid payload", nil)
	}

	err := h.service.CastVote(c.Context(), "", req.ParticipantID, req.CandidateID)
	if err != nil {
		if err == ErrAlreadyVoted {
			return response.SendError(c, fiber.StatusConflict, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Vote cast successfully", nil, nil)
}

func (h *Handler) GetSummary(c fiber.Ctx) error {

	summary, err := h.service.GetSummary(c.Context(), "")
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get summary", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Summary retrieved", summary, nil)
}

func (h *Handler) GetSession(c fiber.Ctx) error {
	session, err := h.service.GetSession(c.Context(), "")
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get voting session", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Voting session retrieved", session, nil)
}

func (h *Handler) UpdateSession(c fiber.Ctx) error {
	action := c.Params("action")
	if action == "" {
		action = "start"
	}

	session, err := h.service.UpdateSessionStatus(c.Context(), "", action)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Failed to update voting session", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Voting session updated", session, nil)
}

func (h *Handler) BroadcastInvitation(c fiber.Ctx) error {
	err := h.service.BroadcastVotingInvitation(c.Context(), "")
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to broadcast voting invitations", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Voting invitations broadcasted", nil, nil)
}

func (h *Handler) BroadcastReminder(c fiber.Ctx) error {
	err := h.service.SendVotingReminder(c.Context(), "")
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to broadcast voting reminders", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Voting reminders broadcasted", nil, nil)
}

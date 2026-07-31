package voting

import (
	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/eventctx"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetSession(c fiber.Ctx) error {
	evtCtx := eventctx.Get(c)
	if evtCtx == nil {
		return response.SendError(c, fiber.StatusBadRequest, "No active event context", nil)
	}

	session, err := h.service.GetSession(c.Context(), evtCtx.ID)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to fetch session", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Session retrieved", session, nil)
}

func (h *Handler) UpdateSessionStatus(c fiber.Ctx) error {
	evtCtx := eventctx.Get(c)
	if evtCtx == nil {
		return response.SendError(c, fiber.StatusBadRequest, "No active event context", nil)
	}

	action := c.Params("action") // open, pause, resume, close
	var err error
	switch action {
	case "open":
		err = h.service.OpenSession(c.Context(), evtCtx.ID)
	case "pause":
		err = h.service.PauseSession(c.Context(), evtCtx.ID)
	case "resume":
		err = h.service.ResumeSession(c.Context(), evtCtx.ID)
	case "close":
		err = h.service.CloseSession(c.Context(), evtCtx.ID)
	default:
		return response.SendError(c, fiber.StatusBadRequest, "Invalid action", nil)
	}

	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update session", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Session updated successfully", nil, nil)
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

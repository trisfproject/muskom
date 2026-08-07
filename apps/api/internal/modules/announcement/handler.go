package announcement

import (
	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{
		svc: svc,
	}
}

// -----------------------------------------------------------------------------
// Admin Endpoints
// -----------------------------------------------------------------------------

func (h *Handler) CreateAnnouncement(c fiber.Ctx) error {
	var req CreateAnnouncementRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	userID := c.Locals("user_id").(string)

	ann, err := h.svc.CreateAnnouncement(c.Context(), req, userID)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to create announcement", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Announcement created successfully", ann, nil)
}

func (h *Handler) GetAnnouncement(c fiber.Ctx) error {
	id := c.Params("id")
	ann, err := h.svc.GetAnnouncementByID(c.Context(), id)
	if err != nil {
		if err == ErrAnnouncementNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Announcement not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to fetch announcement", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Success", ann, nil)
}

func (h *Handler) UpdateAnnouncement(c fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateAnnouncementRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	userID := c.Locals("user_id").(string)

	ann, err := h.svc.UpdateAnnouncement(c.Context(), id, req, userID)
	if err != nil {
		if err == ErrAnnouncementNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Announcement not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update announcement", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Announcement updated successfully", ann, nil)
}

func (h *Handler) DeleteAnnouncement(c fiber.Ctx) error {
	id := c.Params("id")
	err := h.svc.DeleteAnnouncement(c.Context(), id)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to delete announcement", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Announcement deleted successfully", nil, nil)
}

func (h *Handler) ListAdminAnnouncements(c fiber.Ctx) error {
	anns, err := h.svc.ListAnnouncements(c.Context(), false)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to list announcements", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Success", anns, nil)
}

func (h *Handler) CreateBroadcast(c fiber.Ctx) error {
	annID := c.Params("id")
	var req CreateBroadcastRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	userID := c.Locals("user_id").(string)

	job, err := h.svc.CreateBroadcast(c.Context(), annID, req, userID)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to schedule broadcast", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Broadcast scheduled successfully", job, nil)
}

func (h *Handler) ListBroadcastJobs(c fiber.Ctx) error {
	jobs, err := h.svc.ListBroadcastJobs(c.Context(), 100, 0)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to list broadcast jobs", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Success", jobs, nil)
}

// -----------------------------------------------------------------------------
// Public Endpoints
// -----------------------------------------------------------------------------

func (h *Handler) ListPublicAnnouncements(c fiber.Ctx) error {
	anns, err := h.svc.ListAnnouncements(c.Context(), true)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to list public announcements", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Success", anns, nil)
}

func (h *Handler) GetPublicAnnouncement(c fiber.Ctx) error {
	slug := c.Params("slug")
	ann, err := h.svc.GetAnnouncementBySlug(c.Context(), slug)
	if err != nil {
		if err == ErrAnnouncementNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Announcement not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to fetch announcement", nil)
	}
	
	// Ensure it's published and not expired
	// Normally handled in DB query or service, but for simplicity:
	if ann.Status != StatusPublished {
		return response.SendError(c, fiber.StatusNotFound, "Announcement not found", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Success", ann, nil)
}

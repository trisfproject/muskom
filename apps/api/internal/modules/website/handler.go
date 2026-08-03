package website

import (
	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

type Handler struct {
	service   Service
	validator *validator.Validator
}

func NewHandler(service Service, val *validator.Validator) *Handler {
	return &Handler{
		service:   service,
		validator: val,
	}
}

// ----------------------------------------------------------------------------
// Public Handlers
// ----------------------------------------------------------------------------

func (h *Handler) GetPublicHome(c fiber.Ctx) error {
	res, err := h.service.GetPublicHome(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve public home data", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Public home data retrieved", res, nil)
}

func (h *Handler) GetPublicCandidates(c fiber.Ctx) error {
	res, err := h.service.GetPublicCandidates(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve candidates", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Candidates retrieved", res, nil)
}

func (h *Handler) GetPublicCandidateByID(c fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.service.GetPublicCandidateByID(c.Context(), id)
	if err != nil {
		return response.SendError(c, fiber.StatusNotFound, "Candidate not found", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Candidate retrieved", res, nil)
}

func (h *Handler) GetPublicTimeline(c fiber.Ctx) error {
	res, err := h.service.GetPublicTimeline(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve timeline", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Timeline retrieved", res, nil)
}

func (h *Handler) GetPublicAnnouncements(c fiber.Ctx) error {
	res, err := h.service.GetPublicAnnouncements(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve announcements", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Announcements retrieved", res, nil)
}

func (h *Handler) GetPublicAnnouncementBySlug(c fiber.Ctx) error {
	slug := c.Params("slug")
	res, err := h.service.GetPublicAnnouncementBySlug(c.Context(), slug)
	if err != nil {
		return response.SendError(c, fiber.StatusNotFound, "Announcement not found", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Announcement retrieved", res, nil)
}

func (h *Handler) GetPublicFooter(c fiber.Ctx) error {
	res, err := h.service.GetPublicFooter(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve footer data", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Footer retrieved", res, nil)
}

// ----------------------------------------------------------------------------
// Admin Handlers: General
// ----------------------------------------------------------------------------

func (h *Handler) GetAdminGeneral(c fiber.Ctx) error {
	res, err := h.service.GetAdminGeneral(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve general settings", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "General settings retrieved", res, nil)
}

func (h *Handler) UpdateAdminGeneral(c fiber.Ctx) error {
	var req UpdateGeneralRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.UpdateAdminGeneral(c.Context(), &req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update general settings", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "General settings updated successfully", res, nil)
}

// ----------------------------------------------------------------------------
// Admin Handlers: Hero
// ----------------------------------------------------------------------------

func (h *Handler) GetAdminHero(c fiber.Ctx) error {
	res, err := h.service.GetAdminHero(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve hero settings", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Hero settings retrieved", res, nil)
}

func (h *Handler) UpdateAdminHero(c fiber.Ctx) error {
	var req UpdateHeroRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.UpdateAdminHero(c.Context(), &req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update hero settings", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Hero settings updated successfully", res, nil)
}

// ----------------------------------------------------------------------------
// Admin Handlers: Timeline
// ----------------------------------------------------------------------------

func (h *Handler) GetAdminTimeline(c fiber.Ctx) error {
	res, err := h.service.GetAdminTimeline(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve timeline phases", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Timeline phases retrieved", res, nil)
}

func (h *Handler) GetAdminTimelineByID(c fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.service.GetAdminTimelineByID(c.Context(), id)
	if err != nil {
		return response.SendError(c, fiber.StatusNotFound, "Timeline phase not found", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Timeline phase retrieved", res, nil)
}

func (h *Handler) CreateAdminTimeline(c fiber.Ctx) error {
	var req CreateTimelinePhaseRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.CreateAdminTimeline(c.Context(), &req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to create timeline phase", nil)
	}
	return response.SendSuccess(c, fiber.StatusCreated, "Timeline phase created successfully", res, nil)
}

func (h *Handler) UpdateAdminTimeline(c fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateTimelinePhaseRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.UpdateAdminTimeline(c.Context(), id, &req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update timeline phase", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Timeline phase updated successfully", res, nil)
}

func (h *Handler) DeleteAdminTimeline(c fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.DeleteAdminTimeline(c.Context(), id); err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to delete timeline phase", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Timeline phase deleted successfully", nil, nil)
}

func (h *Handler) ReorderAdminTimeline(c fiber.Ctx) error {
	var req ReorderTimelinePhasesRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	if err := h.service.ReorderAdminTimeline(c.Context(), &req); err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to reorder timeline phases", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Timeline phases reordered successfully", nil, nil)
}

// ----------------------------------------------------------------------------
// Admin Handlers: Announcements
// ----------------------------------------------------------------------------

func (h *Handler) GetAdminAnnouncements(c fiber.Ctx) error {
	res, err := h.service.GetAdminAnnouncements(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve announcements", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Announcements retrieved", res, nil)
}

func (h *Handler) GetAdminAnnouncementByID(c fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.service.GetAdminAnnouncementByID(c.Context(), id)
	if err != nil {
		return response.SendError(c, fiber.StatusNotFound, "Announcement not found", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Announcement retrieved", res, nil)
}

func (h *Handler) CreateAdminAnnouncement(c fiber.Ctx) error {
	var req CreateAnnouncementRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.CreateAdminAnnouncement(c.Context(), &req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to create announcement", nil)
	}
	return response.SendSuccess(c, fiber.StatusCreated, "Announcement created successfully", res, nil)
}

func (h *Handler) UpdateAdminAnnouncement(c fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateAnnouncementRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.UpdateAdminAnnouncement(c.Context(), id, &req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update announcement", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Announcement updated successfully", res, nil)
}

func (h *Handler) DeleteAdminAnnouncement(c fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.DeleteAdminAnnouncement(c.Context(), id); err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to delete announcement", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Announcement deleted successfully", nil, nil)
}

// ----------------------------------------------------------------------------
// Admin Handlers: Candidate CMS
// ----------------------------------------------------------------------------

func (h *Handler) GetAdminCandidateSettings(c fiber.Ctx) error {
	res, err := h.service.GetAdminCandidateSettings(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve candidate CMS settings", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Candidate CMS settings retrieved", res, nil)
}

func (h *Handler) UpdateAdminCandidateSettings(c fiber.Ctx) error {
	var req UpdateCandidateCMSRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.UpdateAdminCandidateSettings(c.Context(), &req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update candidate CMS settings", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Candidate CMS settings updated successfully", res, nil)
}

// ----------------------------------------------------------------------------
// Admin Handlers: Footer
// ----------------------------------------------------------------------------

func (h *Handler) GetAdminFooter(c fiber.Ctx) error {
	res, err := h.service.GetAdminFooter(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve footer settings", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Footer settings retrieved", res, nil)
}

func (h *Handler) UpdateAdminFooter(c fiber.Ctx) error {
	var req UpdateFooterRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.UpdateAdminFooter(c.Context(), &req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update footer settings", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Footer settings updated successfully", res, nil)
}

// ----------------------------------------------------------------------------
// Public Handlers: Information Pages
// ----------------------------------------------------------------------------

func (h *Handler) GetPublicInformationPages(c fiber.Ctx) error {
	res, err := h.service.GetPublicInformationPages(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve information pages", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Information pages retrieved", res, nil)
}

func (h *Handler) GetPublicInformationPageBySlug(c fiber.Ctx) error {
	slug := c.Params("slug")
	res, err := h.service.GetPublicInformationPage(c.Context(), slug)
	if err != nil {
		return response.SendError(c, fiber.StatusNotFound, "Information page not found", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Information page retrieved", res, nil)
}

// ----------------------------------------------------------------------------
// Admin Handlers: Information Pages
// ----------------------------------------------------------------------------

func (h *Handler) GetAdminInformationPages(c fiber.Ctx) error {
	res, err := h.service.GetAdminInformationPages(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve information pages", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Information pages retrieved", res, nil)
}

func (h *Handler) GetAdminInformationPageByID(c fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.service.GetAdminInformationPage(c.Context(), id)
	if err != nil {
		return response.SendError(c, fiber.StatusNotFound, "Information page not found", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Information page retrieved", res, nil)
}

func (h *Handler) CreateAdminInformationPage(c fiber.Ctx) error {
	var req CreateInformationPageRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}
	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.CreateAdminInformationPage(c.Context(), &req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to create information page", nil)
	}
	return response.SendSuccess(c, fiber.StatusCreated, "Information page created successfully", res, nil)
}

func (h *Handler) UpdateAdminInformationPage(c fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateInformationPageRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}
	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.UpdateAdminInformationPage(c.Context(), id, &req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update information page", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Information page updated successfully", res, nil)
}

func (h *Handler) DeleteAdminInformationPage(c fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.DeleteAdminInformationPage(c.Context(), id); err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to delete information page", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Information page deleted successfully", nil, nil)
}

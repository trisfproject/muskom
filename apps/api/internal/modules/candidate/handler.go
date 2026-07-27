package candidate

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

func (h *Handler) RegisterCandidate(c fiber.Ctx) error {
	var req RegisterCandidateRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	res, err := h.service.RegisterCandidate(c.Context(), &req)
	if err != nil {
		var valErr *ValidationError
		if errors.As(err, &valErr) {
			return response.SendError(c, fiber.StatusBadRequest, "Validation failed", nil)
		}
		if errors.Is(err, ErrDuplicateApplication) {
			return response.SendError(c, fiber.StatusConflict, err.Error(), nil)
		}
		if errors.Is(err, ErrCandidateRegistrationClosed) {
			return response.SendError(c, fiber.StatusForbidden, err.Error(), nil)
		}
		if errors.Is(err, ErrEventStatusInvalid) {
			return response.SendError(c, fiber.StatusForbidden, err.Error(), nil)
		}
		if errors.Is(err, ErrRegistrationNotApproved) {
			return response.SendError(c, fiber.StatusForbidden, err.Error(), nil)
		}
		if errors.Is(err, ErrRegistrationNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to register candidate", nil)
	}

	return response.SendSuccess(c, fiber.StatusCreated, "Candidate application submitted successfully", res, nil)
}

func (h *Handler) GetCandidateStatus(c fiber.Ctx) error {
	candidateCode := c.Params("id")
	if candidateCode == "" {
		return response.SendError(c, fiber.StatusBadRequest, "candidate code is required", nil)
	}

	res, err := h.service.GetCandidateStatus(c.Context(), candidateCode)
	if err != nil {
		if errors.Is(err, ErrCandidateApplicationNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get candidate status", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate status retrieved successfully", res, nil)
}

func (h *Handler) UploadDocuments(c fiber.Ctx) error {
	candidateCode := c.Params("id")
	if candidateCode == "" {
		return response.SendError(c, fiber.StatusBadRequest, "candidate code is required", nil)
	}

	photo, _ := c.FormFile("photo")
	document, _ := c.FormFile("document")

	res, err := h.service.UploadDocuments(c.Context(), candidateCode, photo, document)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate documents uploaded successfully", res, nil)
}

func (h *Handler) GetDocuments(c fiber.Ctx) error {
	candidateCode := c.Params("id")
	if candidateCode == "" {
		return response.SendError(c, fiber.StatusBadRequest, "candidate code is required", nil)
	}

	res, err := h.service.GetDocuments(c.Context(), candidateCode)
	if err != nil {
		return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate documents retrieved successfully", res, nil)
}

func (h *Handler) DeleteDocuments(c fiber.Ctx) error {
	candidateCode := c.Params("id")
	if candidateCode == "" {
		return response.SendError(c, fiber.StatusBadRequest, "candidate code is required", nil)
	}

	var req DeleteDocumentsRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	if err := h.service.DeleteDocuments(c.Context(), candidateCode, &req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate documents deleted successfully", nil, nil)
}

func (h *Handler) AdminList(c fiber.Ctx) error {
	var filter CandidateAdminListRequest
	if err := c.Bind().Query(&filter); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid query parameters", nil)
	}

	list, total, err := h.service.AdminListCandidates(c.Context(), filter)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate list retrieved successfully", fiber.Map{
		"data":  list,
		"total": total,
	}, nil)
}

func (h *Handler) AdminGet(c fiber.Ctx) error {
	candidateCode := c.Params("id")
	if candidateCode == "" {
		return response.SendError(c, fiber.StatusBadRequest, "candidate id is required", nil)
	}

	detail, err := h.service.AdminGetCandidateDetail(c.Context(), candidateCode)
	if err != nil {
		return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate detail retrieved successfully", detail, nil)
}

func (h *Handler) AdminUpdateDetails(c fiber.Ctx) error {
	candidateCode := c.Params("id")
	if candidateCode == "" {
		return response.SendError(c, fiber.StatusBadRequest, "candidate id is required", nil)
	}

	var req CandidateAdminUpdateRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	reviewerID, ok := c.Locals("user_id").(string)
	if !ok || reviewerID == "" {
		return response.SendError(c, fiber.StatusUnauthorized, "Unauthorized reviewer", nil)
	}

	if err := h.service.AdminUpdateCandidateDetails(c.Context(), candidateCode, &req, reviewerID); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate details updated successfully", nil, nil)
}

func (h *Handler) AdminUpdateStatus(c fiber.Ctx) error {
	candidateCode := c.Params("id")
	if candidateCode == "" {
		return response.SendError(c, fiber.StatusBadRequest, "candidate id is required", nil)
	}

	var req CandidateUpdateStatusRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	reviewerID, ok := c.Locals("user_id").(string)
	if !ok || reviewerID == "" {
		return response.SendError(c, fiber.StatusUnauthorized, "Unauthorized reviewer", nil)
	}

	if err := h.service.AdminUpdateCandidateStatus(c.Context(), candidateCode, &req, reviewerID); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate status updated successfully", nil, nil)
}

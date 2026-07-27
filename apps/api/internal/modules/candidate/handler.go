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

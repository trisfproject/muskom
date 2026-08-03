package candidate

import (
	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

type AdminHandler struct {
	service   Service
	validator *validator.Validator
	log       *zap.Logger
}

func NewAdminHandler(service Service, validator *validator.Validator, log *zap.Logger) *AdminHandler {
	return &AdminHandler{
		service:   service,
		validator: validator,
		log:       log,
	}
}

func (h *AdminHandler) ListCandidates(c fiber.Ctx) error {
	status := c.Query("status")
	musyawarahID := c.Query("musyawarah_id")
	search := c.Query("search")

	candidates, err := h.service.AdminListCandidates(c.Context(), status, musyawarahID, search)
	if err != nil {
		h.log.Error("failed to list candidates", zap.Error(err))
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve candidates", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidates retrieved", candidates, nil)
}

func (h *AdminHandler) GetCandidateDetail(c fiber.Ctx) error {
	id := c.Params("id")

	candidate, err := h.service.GetByID(c.Context(), id)
	if err != nil {
		h.log.Error("failed to retrieve candidate detail", zap.Error(err), zap.String("candidate_id", id))
		if err.Error() == "candidate not found" {
			return response.SendError(c, fiber.StatusNotFound, "Candidate not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve candidate", nil)
	}

	// Fetch documents
	docs, err := h.service.ListDocuments(c.Context(), id)
	if err == nil {
		candidate.Documents = docs
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate retrieved", candidate, nil)
}

func (h *AdminHandler) VerifyCandidate(c fiber.Ctx) error {
	id := c.Params("id")

	var req AdminVerifyCandidateRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	adminUserID := c.Locals("user_id").(string)

	err := h.service.AdminVerifyCandidate(c.Context(), id, req, adminUserID)
	if err != nil {
		h.log.Error("failed to verify candidate", zap.Error(err), zap.String("candidate_id", id))
		if err.Error() == "candidate not found" {
			return response.SendError(c, fiber.StatusNotFound, "Candidate not found", nil)
		}
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate verified successfully", nil, nil)
}

func (h *AdminHandler) VerifyDocument(c fiber.Ctx) error {
	id := c.Params("id")
	docID := c.Params("doc_id")

	var req AdminVerifyDocumentRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	adminUserID := c.Locals("user_id").(string)

	err := h.service.AdminVerifyDocument(c.Context(), id, docID, req, adminUserID)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Document verified successfully", nil, nil)
}

func (h *AdminHandler) StreamDocument(c fiber.Ctx) error {
	id := c.Params("id")
	docID := c.Params("doc_id")

	// Same stream endpoint but for admin
	reader, mimeType, err := h.service.StreamDocument(c.Context(), id, docID)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to stream document", nil)
	}

	c.Set("Content-Type", mimeType)
	return c.SendStream(reader)
}

func (h *AdminHandler) PublishCandidate(c fiber.Ctx) error {
	id := c.Params("id")
	adminUserID := c.Locals("user_id").(string)

	err := h.service.AdminPublishCandidate(c.Context(), id, adminUserID)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate published successfully", nil, nil)
}

func (h *AdminHandler) UnpublishCandidate(c fiber.Ctx) error {
	id := c.Params("id")
	adminUserID := c.Locals("user_id").(string)

	err := h.service.AdminUnpublishCandidate(c.Context(), id, adminUserID)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate unpublished successfully", nil, nil)
}

func (h *AdminHandler) UpdatePublicationSettings(c fiber.Ctx) error {
	id := c.Params("id")
	var req AdminPublicationRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	adminUserID := c.Locals("user_id").(string)

	err := h.service.AdminUpdatePublicationSettings(c.Context(), id, req, adminUserID)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Publication settings updated", nil, nil)
}

func (h *AdminHandler) ReorderCandidates(c fiber.Ctx) error {
	var req AdminReorderCandidatesRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	adminUserID := c.Locals("user_id").(string)

	err := h.service.AdminReorderCandidates(c.Context(), req, adminUserID)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidates reordered successfully", nil, nil)
}

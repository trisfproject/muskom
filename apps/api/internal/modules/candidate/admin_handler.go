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

func (h *AdminHandler) CreateCandidate(c fiber.Ctx) error {
	var req CreateCandidateRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "invalid request body", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusBadRequest, "validation failed", errs)
	}

	res, err := h.service.Create(c.Context(), req)
	if err != nil {
		h.log.Error("failed to create candidate", zap.Error(err))
		return response.SendError(c, fiber.StatusInternalServerError, "failed to create candidate", nil)
	}

	return response.SendSuccess(c, fiber.StatusCreated, "candidate created successfully", res, nil)
}

func (h *AdminHandler) ListCandidates(c fiber.Ctx) error {
	status := c.Query("status")

	search := c.Query("search")

	candidates, err := h.service.AdminListCandidates(c.Context(), status, "", search)
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

func getAdminUserID(c fiber.Ctx) string {
	if uid, ok := c.Locals("user_id").(string); ok && uid != "" {
		return uid
	}
	return "admin"
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

	adminUserID := getAdminUserID(c)

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

	adminUserID := getAdminUserID(c)

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
	adminUserID := getAdminUserID(c)

	err := h.service.AdminPublishCandidate(c.Context(), id, adminUserID)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate published successfully", nil, nil)
}

func (h *AdminHandler) UnpublishCandidate(c fiber.Ctx) error {
	id := c.Params("id")
	adminUserID := getAdminUserID(c)

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

	adminUserID := getAdminUserID(c)

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

	adminUserID := getAdminUserID(c)

	err := h.service.AdminReorderCandidates(c.Context(), req, adminUserID)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidates reordered successfully", nil, nil)
}

func (h *AdminHandler) UpdateCandidate(c fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateCandidateRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.Update(c.Context(), id, req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update candidate: "+err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate updated successfully", res, nil)
}

func (h *AdminHandler) DeleteCandidate(c fiber.Ctx) error {
	id := c.Params("id")
	adminUserID := getAdminUserID(c)

	if err := h.service.AdminDeleteCandidate(c.Context(), id, adminUserID); err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to delete candidate: "+err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidate deleted successfully", nil, nil)
}

func (h *AdminHandler) BulkDeleteCandidates(c fiber.Ctx) error {
	var req BulkDeleteCandidateRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	adminUserID := getAdminUserID(c)
	if err := h.service.AdminBulkDeleteCandidates(c.Context(), req.IDs, adminUserID); err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to delete candidates: "+err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Candidates deleted successfully", nil, nil)
}

func (h *AdminHandler) UploadPhoto(c fiber.Ctx) error {
	id := c.Params("id")
	fileHeader, err := c.FormFile("photo")
	if err != nil {
		fileHeader, err = c.FormFile("file")
		if err != nil {
			return response.SendError(c, fiber.StatusBadRequest, "No photo file provided", nil)
		}
	}

	src, err := fileHeader.Open()
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to read photo file", nil)
	}
	defer src.Close()

	mimeType := fileHeader.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "image/jpeg"
	}

	res, err := h.service.UploadPhoto(c.Context(), id, fileHeader.Filename, mimeType, fileHeader.Size, src)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Photo uploaded successfully", res, nil)
}

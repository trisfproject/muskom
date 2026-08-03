package candidate

import (
	"bytes"
	"errors"
	"io"
	"net/http"

	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

type Handler struct {
	service Service
	val     *validator.Validator
	log     *zap.Logger
}

func NewHandler(service Service, val *validator.Validator, log *zap.Logger) *Handler {
	return &Handler{
		service: service,
		val:     val,
		log:     log,
	}
}

func (h *Handler) Create(c fiber.Ctx) error {
	var req CreateCandidateRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "invalid request body", nil)
	}

	if errs := h.val.ValidateStruct(req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusBadRequest, "validation failed", errs)
	}

	res, err := h.service.Create(c.Context(), req)
	if err != nil {
		h.log.Error("failed to create candidate", zap.Error(err))
		if errors.Is(err, ErrDuplicateReg) {
			return response.SendError(c, fiber.StatusConflict, "registration number already exists", nil)
		}
		if errors.Is(err, ErrDuplicateEmail) {
			return response.SendError(c, fiber.StatusConflict, "candidate with this email already registered for this event", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "failed to create candidate", nil)
	}

	return response.SendSuccess(c, fiber.StatusCreated, "candidate created successfully", res, nil)
}

func (h *Handler) GetByID(c fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.service.GetByID(c.Context(), id)
	if err != nil {
		h.log.Error("failed to get candidate by id", zap.Error(err), zap.String("candidate_id", id))
		if errors.Is(err, ErrNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "candidate not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "failed to fetch candidate", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "candidate fetched successfully", res, nil)
}

func (h *Handler) Update(c fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateCandidateRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "invalid request body", nil)
	}

	if errs := h.val.ValidateStruct(req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusBadRequest, "validation failed", errs)
	}

	res, err := h.service.Update(c.Context(), id, req)
	if err != nil {
		h.log.Error("failed to update candidate", zap.Error(err), zap.String("candidate_id", id))
		if errors.Is(err, ErrNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "candidate not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "failed to update candidate", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "candidate updated successfully", res, nil)
}

func (h *Handler) Patch(c fiber.Ctx) error {
	id := c.Params("id")
	var req PatchCandidateRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "invalid request body", nil)
	}

	if errs := h.val.ValidateStruct(req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusBadRequest, "validation failed", errs)
	}

	res, err := h.service.Patch(c.Context(), id, req)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "candidate not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "failed to patch candidate", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "candidate patched successfully", res, nil)
}

func (h *Handler) Delete(c fiber.Ctx) error {
	id := c.Params("id")
	err := h.service.Delete(c.Context(), id)
	if err != nil {
		h.log.Error("failed to delete candidate", zap.Error(err), zap.String("candidate_id", id))
		if errors.Is(err, ErrNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "candidate not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "failed to delete candidate", nil)
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) UploadDocument(c fiber.Ctx) error {
	candidateID := c.Params("id")
	docType := c.FormValue("document_type")
	if docType == "" {
		return response.SendError(c, fiber.StatusBadRequest, "document_type is required", nil)
	}

	file, err := c.FormFile("file")
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "file is required", nil)
	}

	f, err := file.Open()
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "failed to open uploaded file", nil)
	}
	defer f.Close()

	// P1-1: Server-side MIME validation
	buffer := make([]byte, 512)
	n, err := f.Read(buffer)
	if err != nil && err.Error() != "EOF" {
		return response.SendError(c, fiber.StatusInternalServerError, "failed to read file content for validation", nil)
	}
	actualMimeType := http.DetectContentType(buffer[:n])

	// Reconstruct the reader
	importBytes := bytes.NewReader(buffer[:n])
	fileReader := io.MultiReader(importBytes, f)

	res, err := h.service.UploadDocument(c.Context(), candidateID, docType, file.Filename, actualMimeType, file.Size, fileReader)
	if err != nil {
		h.log.Error("failed to upload document", zap.Error(err), zap.String("candidate_id", candidateID))
		if err.Error() == "cannot upload documents for a non-draft candidate" {
			return response.SendError(c, fiber.StatusForbidden, err.Error(), nil)
		}
		if err.Error() == "invalid mime type" || err.Error() == "file size exceeds maximum allowed size" {
			return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusCreated, "document uploaded successfully", res, nil)
}

func (h *Handler) ListDocuments(c fiber.Ctx) error {
	candidateID := c.Params("id")
	res, err := h.service.ListDocuments(c.Context(), candidateID)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "failed to fetch documents", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "documents fetched successfully", res, nil)
}

func (h *Handler) DeleteDocument(c fiber.Ctx) error {
	candidateID := c.Params("id")
	docID := c.Params("doc_id")

	err := h.service.DeleteDocument(c.Context(), candidateID, docID)
	if err != nil {
		if err.Error() == "cannot delete documents for a non-draft candidate" || err.Error() == "unauthorized to delete this document" {
			return response.SendError(c, fiber.StatusForbidden, err.Error(), nil)
		}
		if errors.Is(err, ErrNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "document not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "failed to delete document", nil)
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) StreamDocument(c fiber.Ctx) error {
	candidateID := c.Params("id")
	docID := c.Params("doc_id")

	reader, mimeType, err := h.service.StreamDocument(c.Context(), candidateID, docID)
	if err != nil {
		if err.Error() == "unauthorized to access this document" {
			return response.SendError(c, fiber.StatusForbidden, err.Error(), nil)
		}
		if errors.Is(err, ErrNotFound) || err.Error() == "file not found" {
			return response.SendError(c, fiber.StatusNotFound, "document not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "failed to stream document", nil)
	}
	defer reader.Close()

	c.Set("Content-Type", mimeType)
	return c.SendStream(reader)
}

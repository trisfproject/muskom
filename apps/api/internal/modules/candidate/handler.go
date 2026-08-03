package candidate

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

type Handler struct {
	service Service
	val     *validator.Validator
}

func NewHandler(service Service, val *validator.Validator) *Handler {
	return &Handler{
		service: service,
		val:     val,
	}
}

func (h *Handler) Create(c fiber.Ctx) error {
	var req CreateCandidateRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if errs := h.val.ValidateStruct(req); len(errs) > 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation failed",
			"details": errs,
		})
	}

	res, err := h.service.Create(c.Context(), req)
	if err != nil {
		fmt.Printf("Create Candidate Error: %v\n", err)
		if errors.Is(err, ErrDuplicateReg) {
			return c.Status(http.StatusConflict).JSON(fiber.Map{
				"error": "registration number already exists",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create candidate",
		})
	}

	return c.Status(http.StatusCreated).JSON(res)
}

func (h *Handler) GetByID(c fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.service.GetByID(c.Context(), id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"error": "candidate not found",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to fetch candidate",
		})
	}

	return c.Status(http.StatusOK).JSON(res)
}

func (h *Handler) GetAll(c fiber.Ctx) error {
	res, err := h.service.GetAll(c.Context())
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to fetch candidates",
		})
	}

	return c.Status(http.StatusOK).JSON(res)
}

func (h *Handler) Update(c fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateCandidateRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if errs := h.val.ValidateStruct(req); len(errs) > 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation failed",
			"details": errs,
		})
	}

	res, err := h.service.Update(c.Context(), id, req)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"error": "candidate not found",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to update candidate",
		})
	}

	return c.Status(http.StatusOK).JSON(res)
}

func (h *Handler) Patch(c fiber.Ctx) error {
	id := c.Params("id")
	var req PatchCandidateRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if errs := h.val.ValidateStruct(req); len(errs) > 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation failed",
			"details": errs,
		})
	}

	res, err := h.service.Patch(c.Context(), id, req)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"error": "candidate not found",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to patch candidate",
		})
	}

	return c.Status(http.StatusOK).JSON(res)
}

func (h *Handler) Delete(c fiber.Ctx) error {
	id := c.Params("id")
	err := h.service.Delete(c.Context(), id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"error": "candidate not found",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to delete candidate",
		})
	}

	return c.SendStatus(http.StatusNoContent)
}

func (h *Handler) UploadDocument(c fiber.Ctx) error {
	candidateID := c.Params("id")
	docType := c.FormValue("document_type")
	if docType == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "document_type is required",
		})
	}

	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "file is required",
		})
	}

	f, err := file.Open()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to open uploaded file",
		})
	}
	defer f.Close()

	// Extract mime type manually since we trust it slightly more if we verify, but for now rely on file.Header
	mimeType := file.Header.Get("Content-Type")

	res, err := h.service.UploadDocument(c.Context(), candidateID, docType, file.Filename, mimeType, file.Size, f)
	if err != nil {
		if err.Error() == "cannot upload documents for a non-draft candidate" {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
		}
		if err.Error() == "invalid mime type" || err.Error() == "file size exceeds maximum allowed size" {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(http.StatusCreated).JSON(res)
}

func (h *Handler) ListDocuments(c fiber.Ctx) error {
	candidateID := c.Params("id")
	res, err := h.service.ListDocuments(c.Context(), candidateID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to fetch documents",
		})
	}
	return c.Status(http.StatusOK).JSON(res)
}

func (h *Handler) DeleteDocument(c fiber.Ctx) error {
	candidateID := c.Params("id")
	docID := c.Params("doc_id")

	err := h.service.DeleteDocument(c.Context(), candidateID, docID)
	if err != nil {
		if err.Error() == "cannot delete documents for a non-draft candidate" || err.Error() == "unauthorized to delete this document" {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
		}
		if errors.Is(err, ErrNotFound) {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "document not found"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to delete document",
		})
	}

	return c.SendStatus(http.StatusNoContent)
}

func (h *Handler) StreamDocument(c fiber.Ctx) error {
	candidateID := c.Params("id")
	docID := c.Params("doc_id")

	reader, mimeType, err := h.service.StreamDocument(c.Context(), candidateID, docID)
	if err != nil {
		if err.Error() == "unauthorized to access this document" {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
		}
		if errors.Is(err, ErrNotFound) || err.Error() == "file not found" {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "document not found"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to stream document",
		})
	}
	defer reader.Close()

	c.Set("Content-Type", mimeType)
	return c.SendStream(reader)
}

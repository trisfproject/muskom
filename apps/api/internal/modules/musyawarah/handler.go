package musyawarah

import (
	"errors"
	"io"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v3"

	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

type Handler struct {
	service       Service
	validator     *validator.Validator
	maxUploadSize int64
}

func NewHandler(service Service, val *validator.Validator, maxUploadSize int64) *Handler {
	return &Handler{service: service, validator: val, maxUploadSize: maxUploadSize}
}

// --- Multi-event CRUD handlers ---

func (h *Handler) List(c fiber.Ctx) error {
	items, err := h.service.ListAll(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Musyawarah list retrieved", items, nil)
}

func (h *Handler) GetByID(c fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.service.GetByID(c.Context(), id)
	if err != nil {
		if errors.Is(err, ErrMusyawarahNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "Musyawarah not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Musyawarah retrieved", res, nil)
}

func (h *Handler) Create(c fiber.Ctx) error {
	var req CreateMusyawarahRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.Create(c.Context(), &req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to create Musyawarah", nil)
	}
	return response.SendSuccess(c, fiber.StatusCreated, "Musyawarah created", res, nil)
}

func (h *Handler) UpdateByID(c fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateMusyawarahRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.UpdateByID(c.Context(), id, &req)
	if err != nil {
		if errors.Is(err, ErrMusyawarahNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "Musyawarah not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Musyawarah updated", res, nil)
}

func (h *Handler) Activate(c fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.service.Activate(c.Context(), id)
	if err != nil {
		if errors.Is(err, ErrMusyawarahNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "Musyawarah not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to activate Musyawarah", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Musyawarah activated", res, nil)
}

func (h *Handler) Deactivate(c fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.service.Deactivate(c.Context(), id)
	if err != nil {
		if errors.Is(err, ErrMusyawarahNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "Musyawarah not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to deactivate Musyawarah", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Musyawarah deactivated", res, nil)
}

func (h *Handler) Archive(c fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.service.Archive(c.Context(), id)
	if err != nil {
		if errors.Is(err, ErrMusyawarahNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "Musyawarah not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to archive Musyawarah", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Musyawarah archived", res, nil)
}

func (h *Handler) Clone(c fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.service.Clone(c.Context(), id)
	if err != nil {
		if errors.Is(err, ErrMusyawarahNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "Musyawarah not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to clone Musyawarah", nil)
	}
	return response.SendSuccess(c, fiber.StatusCreated, "Musyawarah cloned", res, nil)
}

func (h *Handler) Publish(c fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.service.Publish(c.Context(), id)
	if err != nil {
		if errors.Is(err, ErrMusyawarahNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "Musyawarah not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to publish Musyawarah", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Musyawarah published", res, nil)
}

func (h *Handler) Delete(c fiber.Ctx) error {
	id := c.Params("id")
	err := h.service.Delete(c.Context(), id)
	if err != nil {
		if errors.Is(err, ErrMusyawarahNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "Musyawarah not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to delete Musyawarah", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Musyawarah deleted", nil, nil)
}

// --- Active event handlers (backward-compatible) ---

func (h *Handler) Get(c fiber.Ctx) error {
	res, err := h.service.GetConfig(c.Context())
	if err != nil {
		if errors.Is(err, ErrConfigNotFound) {
			return response.SendSuccess(c, fiber.StatusOK, "Musyawarah configuration not found", nil, nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Musyawarah configuration retrieved", res, nil)
}

func (h *Handler) Update(c fiber.Ctx) error {
	var req UpdateMusyawarahRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.UpdateConfig(c.Context(), &req)
	if err != nil {
		if errors.Is(err, ErrConfigNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Musyawarah configuration updated", res, nil)
}

func (h *Handler) GetSettings(c fiber.Ctx) error {
	res, err := h.service.GetSettings(c.Context())
	if err != nil {
		if errors.Is(err, ErrConfigNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Settings retrieved", res, nil)
}

func (h *Handler) UpdateSettings(c fiber.Ctx) error {
	var req SettingsRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.UpdateSettings(c.Context(), &req)
	if err != nil {
		if errors.Is(err, ErrConfigNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Settings updated", res, nil)
}

func (h *Handler) GetMedia(c fiber.Ctx) error {
	res, err := h.service.GetMedia(c.Context())
	if err != nil {
		if errors.Is(err, ErrConfigNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Media retrieved", res, nil)
}

func (h *Handler) UploadMedia(c fiber.Ctx) error {
	mediaType := c.Params("type")
	if mediaType != "logo" && mediaType != "banner" && mediaType != "cover" {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid media type", nil)
	}

	fileHeader, err := c.FormFile("file")
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "File is required", nil)
	}

	if h.maxUploadSize > 0 && fileHeader.Size > h.maxUploadSize {
		return response.SendError(c, fiber.StatusRequestEntityTooLarge, "File exceeds maximum upload size", nil)
	}

	file, err := fileHeader.Open()
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to open file", nil)
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if ext != ".png" && ext != ".jpg" && ext != ".jpeg" && ext != ".webp" {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid file extension", nil)
	}

	buffer := make([]byte, 512)
	_, _ = file.Read(buffer)
	if seeker, ok := file.(io.Seeker); ok {
		seeker.Seek(0, io.SeekStart)
	}
	contentType := http.DetectContentType(buffer)

	res, err := h.service.UploadMedia(c.Context(), mediaType, file, fileHeader.Filename, contentType)
	if err != nil {
		if errors.Is(err, ErrConfigNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		if err.Error() == "invalid content type, must be PNG, JPEG, or WebP" {
			return response.SendError(c, fiber.StatusUnsupportedMediaType, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Media uploaded successfully", res, nil)
}

func (h *Handler) DeleteMedia(c fiber.Ctx) error {
	mediaType := c.Params("type")
	if mediaType != "logo" && mediaType != "banner" && mediaType != "cover" {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid media type", nil)
	}

	err := h.service.DeleteMedia(c.Context(), mediaType)
	if err != nil {
		if errors.Is(err, ErrConfigNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Media deleted successfully", nil, nil)
}

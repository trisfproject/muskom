package musyawarah

import (
	"errors"

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

func (h *Handler) Get(c fiber.Ctx) error {
	res, err := h.service.GetConfig(c.Context())
	if err != nil {
		if errors.Is(err, ErrConfigNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
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

func (h *Handler) GetTimeline(c fiber.Ctx) error {
	res, err := h.service.GetTimeline(c.Context())
	if err != nil {
		if errors.Is(err, ErrConfigNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Timeline retrieved", res, nil)
}

func (h *Handler) UpdateTimeline(c fiber.Ctx) error {
	var req TimelineRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.UpdateTimeline(c.Context(), &req)
	if err != nil {
		if errors.Is(err, ErrConfigNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusUnprocessableEntity, err.Error(), nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Timeline updated", res, nil)
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

	contentType := fileHeader.Header.Get("Content-Type")

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

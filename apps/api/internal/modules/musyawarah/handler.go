package musyawarah

import (
	"errors"

	"github.com/gofiber/fiber/v3"

	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

type Handler struct {
	service   Service
	validator *validator.Validator
}

func NewHandler(service Service, val *validator.Validator) *Handler {
	return &Handler{service: service, validator: val}
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

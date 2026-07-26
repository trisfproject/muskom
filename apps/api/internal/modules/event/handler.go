package event

import (
	"errors"
	"strconv"

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

func (h *Handler) Create(c fiber.Ctx) error {
	var req CreateEventRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.CreateEvent(c.Context(), &req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusCreated, "Event created", res, nil)
}

func (h *Handler) Get(c fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.service.GetEvent(c.Context(), id)
	if err != nil {
		if errors.Is(err, ErrEventNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Event found", res, nil)
}

func (h *Handler) List(c fiber.Ctx) error {
	limitStr := c.Query("limit", "10")
	offsetStr := c.Query("offset", "0")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	res, err := h.service.ListEvents(c.Context(), limit, offset)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Events listed", res.Items, fiber.Map{"total": res.Total})
}

func (h *Handler) Update(c fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateEventRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.UpdateEvent(c.Context(), id, &req)
	if err != nil {
		if errors.Is(err, ErrEventNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Event updated", res, nil)
}

func (h *Handler) Delete(c fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.SoftDeleteEvent(c.Context(), id); err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Event deleted", nil, nil)
}

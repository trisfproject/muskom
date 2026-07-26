package auth

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

// NewHandler creates a new Auth Handler.
func NewHandler(service Service, val *validator.Validator) *Handler {
	return &Handler{service: service, validator: val}
}

func (h *Handler) Login(c fiber.Ctx) error {
	var req LoginRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.Login(c.Context(), &req)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) || errors.Is(err, ErrUserInactive) {
			return response.SendError(c, fiber.StatusUnauthorized, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Login successful", res, nil)
}

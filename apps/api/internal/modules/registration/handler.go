package registration

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

func (h *Handler) Register(c fiber.Ctx) error {
	var req PublicRegistrationRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	res, err := h.service.RegisterParticipant(c.Context(), &req)
	if err != nil {
		var valErr *ValidationError
		if errors.As(err, &valErr) {
			return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", valErr.Details)
		}

		switch {
		case errors.Is(err, ErrEventNotFound):
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		case errors.Is(err, ErrEventNotOpen) || errors.Is(err, ErrRegistrationClosed) || errors.Is(err, ErrQuotaExceeded):
			return response.SendError(c, fiber.StatusForbidden, err.Error(), nil)
		case errors.Is(err, ErrAlreadyRegistered) || errors.Is(err, ErrPhoneRegistered):
			return response.SendError(c, fiber.StatusConflict, err.Error(), nil)
		default:
			return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
		}
	}

	return response.SendSuccess(c, fiber.StatusCreated, "Registration successful", res, nil)
}

func (h *Handler) GetStatus(c fiber.Ctx) error {
	code := c.Params("registration_code")
	if code == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Registration code is required", nil)
	}

	res, err := h.service.CheckRegistrationStatus(c.Context(), code)
	if err != nil {
		if errors.Is(err, ErrRegistrationNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Registration status retrieved", res, nil)
}

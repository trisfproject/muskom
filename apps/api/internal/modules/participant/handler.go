package participant

import (
	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/response"
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

func (h *Handler) GetAll(c fiber.Ctx) error {
	participants, err := h.service.GetAll(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve participants", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Participants retrieved successfully", participants, nil)
}

func (h *Handler) GetByID(c fiber.Ctx) error {
	id := c.Params("id")

	p, err := h.service.GetByID(c.Context(), id)
	if err != nil {
		if err == ErrNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Participant not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve participant", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Participant retrieved successfully", p, nil)
}

func (h *Handler) Create(c fiber.Ctx) error {
	var req CreateParticipantRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := ValidateCreateRequest(h.val, &req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	p, err := h.service.Create(c.Context(), req)
	if err != nil {
		if err == ErrDuplicateReg {
			return response.SendError(c, fiber.StatusConflict, "Registration number already exists", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to create participant", nil)
	}

	return response.SendSuccess(c, fiber.StatusCreated, "Participant created successfully", p, nil)
}

func (h *Handler) Update(c fiber.Ctx) error {
	id := c.Params("id")

	var req UpdateParticipantRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := ValidateUpdateRequest(h.val, &req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	p, err := h.service.Update(c.Context(), id, req)
	if err != nil {
		if err == ErrNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Participant not found", nil)
		}
		if err == ErrDuplicateReg {
			return response.SendError(c, fiber.StatusConflict, "Registration number already exists", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update participant", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Participant updated successfully", p, nil)
}

func (h *Handler) UpdateStatus(c fiber.Ctx) error {
	id := c.Params("id")

	var req UpdateStatusRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := ValidateStatusRequest(h.val, &req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	p, err := h.service.UpdateStatus(c.Context(), id, req)
	if err != nil {
		if err == ErrNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Participant not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update status", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Participant status updated successfully", p, nil)
}

func (h *Handler) Delete(c fiber.Ctx) error {
	id := c.Params("id")

	err := h.service.Delete(c.Context(), id)
	if err != nil {
		if err == ErrNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Participant not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to delete participant", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Participant deleted successfully", nil, nil)
}

func (h *Handler) PublicRegister(c fiber.Ctx) error {
	var req PublicRegisterParticipantRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := ValidatePublicRegisterRequest(h.val, &req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.PublicRegister(c.Context(), req)
	if err != nil {
		if err == ErrDuplicateEmail {
			return response.SendError(c, fiber.StatusConflict, "Email already registered", nil)
		}
		if err == ErrDuplicateMembershipNumber {
			return response.SendError(c, fiber.StatusConflict, "Membership number already registered", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to register participant", nil)
	}

	return response.SendSuccess(c, fiber.StatusCreated, "Registration successful", res, nil)
}

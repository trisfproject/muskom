package user

import (
	"database/sql"
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

func (h *Handler) List(c fiber.Ctx) error {
	search := c.Query("search", "")
	roleID := c.Query("role_id", "")
	status := c.Query("status", "")
	page, err := strconv.Atoi(c.Query("page", "1"))
	if err != nil {
		page = 1
	}
	limit, err := strconv.Atoi(c.Query("limit", "10"))
	if err != nil {
		limit = 10
	}

	res, err := h.service.ListUsers(c.Context(), search, roleID, status, page, limit)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to list users", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Users retrieved", res, nil)
}

func (h *Handler) Get(c fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.service.GetUser(c.Context(), id)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "User not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get user", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "User retrieved", res, nil)
}

func (h *Handler) Create(c fiber.Ctx) error {
	var req CreateUserRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	res, err := h.service.CreateUser(c.Context(), &req)
	if err != nil {
		if errors.Is(err, ErrUsernameTaken) || errors.Is(err, ErrEmailTaken) {
			return response.SendError(c, fiber.StatusConflict, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to create user", nil)
	}

	return response.SendSuccess(c, fiber.StatusCreated, "User created successfully", res, nil)
}

func (h *Handler) UpdateRole(c fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateRoleRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	if err := h.service.UpdateRole(c.Context(), id, &req); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return response.SendError(c, fiber.StatusNotFound, "User not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update role", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Role updated successfully", nil, nil)
}

func (h *Handler) UpdateStatus(c fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateStatusRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if err := h.service.UpdateStatus(c.Context(), id, &req); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return response.SendError(c, fiber.StatusNotFound, "User not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update status", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Status updated successfully", nil, nil)
}

func (h *Handler) ResetPassword(c fiber.Ctx) error {
	id := c.Params("id")
	var req ResetPasswordRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	if errs := h.validator.ValidateStruct(&req); len(errs) > 0 {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", errs)
	}

	if err := h.service.ResetPassword(c.Context(), id, &req); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return response.SendError(c, fiber.StatusNotFound, "User not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to reset password", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Password reset successfully", nil, nil)
}

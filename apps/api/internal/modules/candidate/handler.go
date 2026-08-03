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

package response

import (
	"github.com/gofiber/fiber/v3"
)

// SuccessResponse defines the standard success JSON structure.
type SuccessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
	Meta    any    `json:"meta,omitempty"`
}

// ErrorDetail defines a single field validation error.
type ErrorDetail struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ErrorResponse defines the standard error JSON structure.
type ErrorResponse struct {
	Success bool          `json:"success"`
	Message string        `json:"message"`
	Errors  []ErrorDetail `json:"errors,omitempty"`
}

// SendSuccess sends a standardized JSON success response.
func SendSuccess(c fiber.Ctx, statusCode int, message string, data any, meta any) error {
	return c.Status(statusCode).JSON(SuccessResponse{
		Success: true,
		Message: message,
		Data:    data,
		Meta:    meta,
	})
}

// SendError sends a standardized JSON error response.
func SendError(c fiber.Ctx, statusCode int, message string, errors []ErrorDetail) error {
	return c.Status(statusCode).JSON(ErrorResponse{
		Success: false,
		Message: message,
		Errors:  errors,
	})
}

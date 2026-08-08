package registration

import (
	"errors"
	"strings"

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
			return response.SendError(c, fiber.StatusInternalServerError, err.Error(), nil)
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

func (h *Handler) GetConfirmation(c fiber.Ctx) error {
	code := c.Params("registration_code")
	if code == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Registration code is required", nil)
	}

	res, err := h.service.GetRegistrationConfirmation(c.Context(), code)
	if err != nil {
		if errors.Is(err, ErrRegistrationNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Registration confirmation retrieved", res, nil)
}

func (h *Handler) LookupParticipant(c fiber.Ctx) error {
	type LookupRequest struct {
		Query string `json:"query" validate:"required"`
	}
	var req LookupRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}
	if req.Query == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Query is required", nil)
	}

	res, err := h.service.LookupParticipant(c.Context(), req.Query)
	if err != nil {
		if errors.Is(err, ErrRegistrationNotFound) {
			return response.SendError(c, fiber.StatusNotFound, "Participant not found or not verified", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Participant found", res, nil)
}

func (h *Handler) UploadAttachment(c fiber.Ctx) error {
	code := c.Params("registration_code")
	if code == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Registration code is required", nil)
	}

	file, err := c.FormFile("attachment")
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Attachment file is required", nil)
	}

	res, err := h.service.UploadAttachment(c.Context(), code, file)
	if err != nil {
		if errors.Is(err, ErrSchemaMissing) {
			return response.SendError(c, fiber.StatusNotImplemented, err.Error(), nil)
		}
		switch {
		case errors.Is(err, ErrRegistrationNotFound):
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		case errors.Is(err, ErrStatusNotPending):
			return response.SendError(c, fiber.StatusForbidden, err.Error(), nil)
		case errors.Is(err, ErrFileSizeExceeded) || errors.Is(err, ErrInvalidFileType):
			return response.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
		default:
			return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
		}
	}

	return response.SendSuccess(c, fiber.StatusCreated, "Attachment uploaded successfully", res, nil)
}

func (h *Handler) GetAttachments(c fiber.Ctx) error {
	code := c.Params("registration_code")
	if code == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Registration code is required", nil)
	}

	res, err := h.service.GetAttachments(c.Context(), code)
	if err != nil {
		if errors.Is(err, ErrRegistrationNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Attachments retrieved", res, nil)
}

func (h *Handler) DeleteAttachment(c fiber.Ctx) error {
	code := c.Params("registration_code")
	attachmentID := c.Params("attachment_id")
	if code == "" || attachmentID == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Registration code and attachment ID are required", nil)
	}

	err := h.service.DeleteAttachment(c.Context(), code, attachmentID)
	if err != nil {
		if errors.Is(err, ErrSchemaMissing) {
			return response.SendError(c, fiber.StatusNotImplemented, err.Error(), nil)
		}
		if errors.Is(err, ErrRegistrationNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Attachment deleted successfully", nil, nil)
}

// Admin Handlers

func (h *Handler) AdminList(c fiber.Ctx) error {
	var req AdminListRegistrationsRequest
	if err := c.Bind().Query(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid query parameters", nil)
	}

	res, err := h.service.AdminListRegistrations(c.Context(), &req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Registrations retrieved successfully", res, nil)
}

func (h *Handler) AdminExportCSV(c fiber.Ctx) error {
	var req AdminListRegistrationsRequest
	if err := c.Bind().Query(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid query parameters", nil)
	}
	
	// Force a large limit for export
	req.Page = 1
	req.Limit = 10000

	res, err := h.service.AdminListRegistrations(c.Context(), &req)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	c.Set("Content-Type", "text/csv")
	c.Set("Content-Disposition", "attachment; filename=participants_export.csv")

	csvData := "Registration Number,Full Name,Nickname,Email,WhatsApp,Company,Job Title,Area,Department,Notes,Category,Status,Registered At\n"
	for _, p := range res.Data {
		csvData += p.RegistrationNumber + "," + p.ParticipantName + "," + p.Nickname + "," + p.Email + "," + p.Phone + "," +
			p.Company + "," + p.JobTitle + "," + p.Region + "," + p.Community + "," + p.SpecialNotes + "," +
			p.ParticipantCategory + "," + p.Status + "," + p.CreatedAt + "\n"
	}

	return c.SendString(csvData)
}

func (h *Handler) AdminGet(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Registration ID is required", nil)
	}

	res, err := h.service.AdminGetRegistration(c.Context(), id)
	if err != nil {
		if errors.Is(err, ErrRegistrationNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Registration detail retrieved", res, nil)
}

func (h *Handler) AdminUpdateStatus(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Registration ID is required", nil)
	}

	var req AdminUpdateRegistrationStatusRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	// Assuming the JWT middleware sets user_id in context locals
	adminUserID := c.Locals("user_id")
	if adminUserID == nil {
		adminUserID = "system" // fallback if middleware not properly configured
	}

	err := h.service.AdminUpdateRegistrationStatus(c.Context(), id, &req, adminUserID.(string))
	if err != nil {
		var valErr *ValidationError
		if errors.As(err, &valErr) {
			return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", valErr.Details)
		}

		if errors.Is(err, ErrRegistrationNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}

		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Registration status updated successfully", nil, nil)
}

func (h *Handler) AdminGetEmailHistory(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Registration ID is required", nil)
	}

	res, err := h.service.GetEmailHistory(c.Context(), id)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Email history retrieved successfully", res, nil)
}

func (h *Handler) AdminResendEmail(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Registration ID is required", nil)
	}

	var req ResendEmailRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	adminUserID := c.Locals("user_id")
	if adminUserID == nil {
		adminUserID = "system"
	}

	err := h.service.ResendEmail(c.Context(), id, &req, adminUserID.(string))
	if err != nil {
		var valErr *ValidationError
		if errors.As(err, &valErr) {
			return response.SendError(c, fiber.StatusUnprocessableEntity, "Validation failed", valErr.Details)
		}
		if errors.Is(err, ErrRegistrationNotFound) {
			return response.SendError(c, fiber.StatusNotFound, err.Error(), nil)
		}
		if strings.Contains(err.Error(), "rate limit exceeded") {
			return response.SendError(c, fiber.StatusTooManyRequests, err.Error(), nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Internal server error", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Email queued for resending", nil, nil)
}

func (h *Handler) AdminRetryEmail(c fiber.Ctx) error {
	logID := c.Params("log_id")
	if logID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Log ID is required")
	}

	err := h.service.AdminRetryEmail(c.Context(), logID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Email log successfully reset for retry",
	})
}

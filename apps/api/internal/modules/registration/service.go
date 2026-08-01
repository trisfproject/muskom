package registration

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"

	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

var (
	ErrEventNotFound        = errors.New("no active musyawarah event found")
	ErrEventNotOpen         = errors.New("musyawarah event is not open for registration")
	ErrRegistrationClosed   = errors.New("registration phase is currently closed")
	ErrQuotaExceeded        = errors.New("participant quota has been exceeded")
	ErrAlreadyRegistered    = errors.New("email is already registered for this event")
	ErrPhoneRegistered      = errors.New("phone number is already registered for this event")
	ErrRegistrationNotFound = errors.New("registration not found")
	ErrInvalidFileType      = errors.New("invalid file type, allowed: pdf, jpg, png")
	ErrFileSizeExceeded     = errors.New("file size exceeded maximum allowed")
	ErrStatusNotPending     = errors.New("registration status does not allow attachment upload")
)

// ValidationError wraps field validation errors to return to handler
type ValidationError struct {
	Details []response.ErrorDetail
}

func (e *ValidationError) Error() string {
	return "validation failed"
}

type Service interface {
	RegisterParticipant(ctx context.Context, req *PublicRegistrationRequest) (*PublicRegistrationResponse, error)
	CheckRegistrationStatus(ctx context.Context, registrationCode string) (*RegistrationStatusResponse, error)
	GetRegistrationConfirmation(ctx context.Context, registrationCode string) (*RegistrationConfirmationResponse, error)

	UploadAttachment(ctx context.Context, registrationID string, file *multipart.FileHeader) (*AttachmentResponse, error)
	GetAttachments(ctx context.Context, registrationID string) ([]AttachmentResponse, error)
	DeleteAttachment(ctx context.Context, registrationID, attachmentID string) error

	// Admin operations
	AdminListRegistrations(ctx context.Context, req *AdminListRegistrationsRequest) (*AdminListRegistrationsResponse, error)
	AdminGetRegistration(ctx context.Context, id string) (*AdminRegistrationResponse, error)
	AdminUpdateRegistrationStatus(ctx context.Context, id string, req *AdminUpdateRegistrationStatusRequest, adminUserID string) error
}

type service struct {
	repo      Repository
	log       *zap.Logger
	validator *validator.Validator
	strg      storage.Storage
	maxSize   int64
}

func NewService(repo Repository, log *zap.Logger, val *validator.Validator, strg storage.Storage, maxSize int64) Service {
	return &service{repo: repo, log: log, validator: val, strg: strg, maxSize: maxSize}
}

func (s *service) RegisterParticipant(ctx context.Context, req *PublicRegistrationRequest) (*PublicRegistrationResponse, error) {
	// 0. Input Format Validation
	if errs := s.validator.ValidateStruct(req); len(errs) > 0 {
		return nil, &ValidationError{Details: errs}
	}

	// 1. Check Active Event
	evt, err := s.repo.GetActiveEventContext(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrEventNotFound
		}
		return nil, err
	}

	if evt.Status != "DRAFT" && evt.Status != "ONGOING" {
		return nil, ErrEventNotOpen
	}

	// 2. Check Timeline Phase
	isActive, err := s.repo.IsPhaseActive(ctx, evt.EventID, "REGISTRATION")
	if err != nil {
		return nil, err
	}
	if !isActive {
		return nil, ErrRegistrationClosed
	}

	// 3. Check Quota
	if evt.RegistrationLimit != nil {
		count, err := s.repo.CountRegistrations(ctx, evt.EventID)
		if err != nil {
			return nil, err
		}
		if count >= *evt.RegistrationLimit {
			return nil, ErrQuotaExceeded
		}
	}

	// 4. Check Existing Registration (Email)
	exists, err := s.repo.CheckExistingRegistration(ctx, evt.EventID, req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrAlreadyRegistered
	}

	// 5. Check Existing Registration (Phone)
	if req.Phone != nil && *req.Phone != "" {
		phoneExists, err := s.repo.CheckExistingPhone(ctx, evt.EventID, *req.Phone)
		if err != nil {
			return nil, err
		}
		if phoneExists {
			return nil, ErrPhoneRegistered
		}
	}

	// 6. Database Transaction
	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	person := &Person{
		FullName: req.FullName,
		Email:    req.Email,
		Phone:    req.Phone,
		Company:  req.Company,
		JobTitle: req.JobTitle,
	}

	if err := s.repo.FindOrCreatePerson(ctx, tx, person); err != nil {
		s.log.Error("Failed to find or create person", zap.Error(err))
		return nil, err
	}

	status := "PENDING"
	if evt.RegistrationApprovalMode == "AUTOMATIC" {
		status = "APPROVED"
	}

	qrBytes := make([]byte, 16)
	_, _ = rand.Read(qrBytes)
	qrToken := hex.EncodeToString(qrBytes)

	source := "PUBLIC_WEB"
	reg := &Registration{
		EventID:             evt.EventID,
		PersonID:            person.ID,
		ParticipantCategory: &req.ParticipantCategory,
		Source:              &source,
		Status:              status,
		QrToken:             &qrToken,
		Region:              req.Region,
		Community:           req.Community,
		SpecialNotes:        req.SpecialNotes,
	}

	if err := s.repo.CreateRegistration(ctx, tx, reg); err != nil {
		s.log.Error("Failed to create registration", zap.Error(err))
		return nil, err
	}

	// 6. Audit Log
	meta, _ := json.Marshal(map[string]interface{}{
		"email":                req.Email,
		"participant_category": req.ParticipantCategory,
	})
	if err := s.repo.LogAudit(ctx, tx, "REGISTRATION", "PUBLIC_REGISTER", "registrations", reg.ID, string(meta)); err != nil {
		s.log.Error("Failed to write audit log", zap.Error(err))
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &PublicRegistrationResponse{
		RegistrationCode:   reg.ID,
		RegistrationNumber: reg.RegistrationNumber,
		QrToken:            reg.QrToken,
		Status:             reg.Status,
	}, nil
}

func (s *service) CheckRegistrationStatus(ctx context.Context, registrationCode string) (*RegistrationStatusResponse, error) {
	status, err := s.repo.GetRegistrationStatus(ctx, registrationCode)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRegistrationNotFound
		}
		return nil, err
	}

	return &RegistrationStatusResponse{
		Status: status,
	}, nil
}

func (s *service) GetRegistrationConfirmation(ctx context.Context, registrationCode string) (*RegistrationConfirmationResponse, error) {
	data, err := s.repo.GetRegistrationConfirmation(ctx, registrationCode)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRegistrationNotFound
		}
		return nil, err
	}

	var nextStep string
	switch data.Status {
	case "PENDING":
		nextStep = "Waiting for administrator approval"
	case "APPROVED":
		nextStep = "Please check your email for the entrance ticket or barcode"
	case "REJECTED":
		nextStep = "Your registration was not approved. Please contact the administrator for details"
	default:
		nextStep = "Status unknown"
	}

	return &RegistrationConfirmationResponse{
		RegistrationCode: data.RegistrationCode,
		Status:           data.Status,
		RegistrationDate: data.RegistrationDate,
		MusyawarahName:   data.MusyawarahName,
		ParticipantName:  maskName(data.ParticipantName),
		NextStep:         nextStep,
	}, nil
}

func maskName(name string) string {
	parts := strings.Split(name, " ")
	for i, part := range parts {
		if len(part) > 2 {
			parts[i] = string(part[0]) + strings.Repeat("*", len(part)-2) + string(part[len(part)-1])
		}
	}
	return strings.Join(parts, " ")
}

func (s *service) UploadAttachment(ctx context.Context, registrationID string, file *multipart.FileHeader) (*AttachmentResponse, error) {
	// 1. Verify Registration and Status
	reg, err := s.repo.GetRegistrationByID(ctx, registrationID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRegistrationNotFound
		}
		return nil, err
	}
	if reg.Status != "PENDING" && reg.Status != "APPROVED" {
		return nil, ErrStatusNotPending
	}

	// 2. Validate Size
	if file.Size > s.maxSize {
		return nil, ErrFileSizeExceeded
	}

	// 3. Validate File Type
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := map[string]bool{
		".pdf":  true,
		".jpg":  true,
		".jpeg": true,
		".png":  true,
	}
	if !allowedExts[ext] {
		return nil, ErrInvalidFileType
	}

	allowedMimeTypes := map[string]bool{
		"application/pdf": true,
		"image/jpeg":      true,
		"image/png":       true,
	}

	f, err := file.Open()
	if err != nil {
		return nil, err
	}
	defer f.Close()

	// Sniff first 512 bytes
	buffer := make([]byte, 512)
	_, _ = f.Read(buffer)
	// Reset pointer for upload later
	if seeker, ok := f.(io.Seeker); ok {
		seeker.Seek(0, io.SeekStart)
	}

	mimeType := http.DetectContentType(buffer)
	if !allowedMimeTypes[mimeType] {
		return nil, ErrInvalidFileType
	}

	// 4. Upload to Storage
	fileInfo, err := s.strg.Upload(ctx, f, file.Filename)
	if err != nil {
		s.log.Error("Failed to upload attachment to storage", zap.Error(err))
		return nil, err
	}

	// 5. Save to DB (Currently throws ErrSchemaMissing)
	_, err = s.repo.SaveAttachmentMetadata(ctx, registrationID, fileInfo)
	if err != nil {
		s.log.Error("Failed to save attachment metadata, rolling back file", zap.Error(err))
		// Rollback file upload
		_ = s.strg.Delete(ctx, fileInfo.Path)
		return nil, err
	}

	// Unreachable due to ErrSchemaMissing, but kept for future implementation
	return &AttachmentResponse{
		ID:        "temp-id",
		FileName:  fileInfo.Path,
		FileURL:   s.strg.URL(fileInfo.Path),
		MimeType:  fileInfo.MimeType,
		Size:      fileInfo.Size,
		CreatedAt: "",
	}, nil
}

func (s *service) GetAttachments(ctx context.Context, registrationID string) ([]AttachmentResponse, error) {
	// 1. Verify Registration
	_, err := s.repo.GetRegistrationByID(ctx, registrationID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRegistrationNotFound
		}
		return nil, err
	}

	attachments, err := s.repo.GetAttachments(ctx, registrationID)
	if err != nil {
		// Suppress error if it's the Missing Schema error and just return empty
		if errors.Is(err, ErrSchemaMissing) {
			s.log.Warn("Attachment schema missing, returning empty list")
			return []AttachmentResponse{}, nil
		}
		return nil, err
	}

	return attachments, nil
}

func (s *service) DeleteAttachment(ctx context.Context, registrationID, attachmentID string) error {
	_, err := s.repo.GetRegistrationByID(ctx, registrationID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrRegistrationNotFound
		}
		return err
	}

	// Call to DB (Throws ErrSchemaMissing)
	err = s.repo.DeleteAttachmentMetadata(ctx, attachmentID)
	if err != nil {
		return err
	}

	// Normally we would fetch the path and delete it from storage, but we can't fetch it here.
	return nil
}

func (s *service) AdminListRegistrations(ctx context.Context, req *AdminListRegistrationsRequest) (*AdminListRegistrationsResponse, error) {
	data, total, err := s.repo.ListRegistrations(ctx, *req)
	if err != nil {
		return nil, err
	}

	limit := req.Limit
	if limit <= 0 {
		limit = 10
	}
	page := req.Page
	if page <= 0 {
		page = 1
	}

	totalPages := total / limit
	if total%limit != 0 {
		totalPages++
	}

	return &AdminListRegistrationsResponse{
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (s *service) AdminGetRegistration(ctx context.Context, id string) (*AdminRegistrationResponse, error) {
	resp, err := s.repo.GetRegistrationAdminByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRegistrationNotFound
		}
		return nil, err
	}
	return resp, nil
}

func (s *service) AdminUpdateRegistrationStatus(ctx context.Context, id string, req *AdminUpdateRegistrationStatusRequest, adminUserID string) error {
	if err := s.validator.ValidateStruct(req); err != nil {
		return &ValidationError{Details: err}
	}

	// Verify Registration exists
	reg, err := s.repo.GetRegistrationAdminByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrRegistrationNotFound
		}
		return err
	}

	if reg.Status == req.Status {
		return nil // No change
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	err = s.repo.UpdateRegistrationStatus(ctx, tx, id, req.Status, adminUserID)
	if err != nil {
		return err
	}

	// Log audit
	meta := map[string]string{
		"old_status": reg.Status,
		"new_status": req.Status,
	}
	metaBytes, _ := json.Marshal(meta)
	err = s.repo.LogAudit(ctx, tx, "registration", "UPDATE_STATUS", "registrations", id, string(metaBytes))
	if err != nil {
		return err
	}

	return tx.Commit()
}

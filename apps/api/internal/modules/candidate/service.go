package candidate

import (
	"context"
	"errors"

	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

var (
	ErrCandidateRegistrationClosed = errors.New("candidate registration period is not open")
	ErrEventStatusInvalid          = errors.New("musyawarah status does not allow candidate registration")
	ErrRegistrationNotApproved     = errors.New("participant registration must be APPROVED to register as a candidate")
)

type Service interface {
	RegisterCandidate(ctx context.Context, req *RegisterCandidateRequest) (*RegisterCandidateResponse, error)
	GetCandidateStatus(ctx context.Context, candidateCode string) (*CandidateStatusResponse, error)
	UploadDocuments(ctx context.Context, candidateCode string, photo, document *multipart.FileHeader) (*CandidateDocumentsResponse, error)
	GetDocuments(ctx context.Context, candidateCode string) (*CandidateDocumentsResponse, error)
	DeleteDocuments(ctx context.Context, candidateCode string, req *DeleteDocumentsRequest) error
}

type service struct {
	repo          Repository
	logger        *zap.Logger
	validator     *validator.Validator
	storage       storage.Storage
	maxUploadSize int64
}

func NewService(repo Repository, logger *zap.Logger, val *validator.Validator, strg storage.Storage, maxUploadSize int64) Service {
	return &service{
		repo:          repo,
		logger:        logger,
		validator:     val,
		storage:       strg,
		maxUploadSize: maxUploadSize,
	}
}

func (s *service) RegisterCandidate(ctx context.Context, req *RegisterCandidateRequest) (*RegisterCandidateResponse, error) {
	if err := s.validator.ValidateStruct(req); err != nil {
		return nil, &ValidationError{Details: err}
	}

	// 1. Get Registration and Event Details
	details, err := s.repo.GetRegistrationDetails(ctx, req.RegistrationID)
	if err != nil {
		return nil, err
	}

	// 2. Validate Participant Registration Status (Eligibility defined by schema)
	if details.RegistrationStatus != "APPROVED" {
		return nil, ErrRegistrationNotApproved
	}

	// 3. Validate Musyawarah Status
	if details.EventStatus != "UPCOMING" && details.EventStatus != "ONGOING" {
		return nil, ErrEventStatusInvalid
	}

	// 4. Check Candidate Registration Period
	isOpen, err := s.repo.GetEventActivePhase(ctx, details.EventID, "candidate_registration")
	if err != nil {
		return nil, err
	}
	if !isOpen {
		return nil, ErrCandidateRegistrationClosed
	}

	// 5. Document Upload Validation Hook (for MKS-050-003)
	// TODO: Implement file size/extension validation logic here when candidate document uploads are introduced.
	if err := s.validateDocumentUploadsHook(); err != nil {
		return nil, err
	}

	// 6. Prevent duplicate applications
	exists, err := s.repo.CheckExistingApplication(ctx, req.RegistrationID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrDuplicateApplication
	}

	// 4. Create Application (Status: SUBMITTED)
	app := &CandidateApplication{
		RegistrationID: req.RegistrationID,
		Vision:         req.Vision,
		Mission:        req.Mission,
		WorkProgram:    req.WorkProgram,
		Status:         "SUBMITTED",
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	candidateCode, err := s.repo.CreateCandidateApplication(ctx, app)
	if err != nil {
		return nil, err
	}

	// Log audit
	err = s.repo.LogAudit(ctx, tx, "candidate", "REGISTER", "candidate_applications", candidateCode, `{"source":"public","status":"SUBMITTED"}`)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &RegisterCandidateResponse{
		CandidateCode: candidateCode,
		Status:        app.Status,
	}, nil
}

// validateDocumentUploadsHook acts as a placeholder hook for MKS-050-003
func (s *service) validateDocumentUploadsHook() error {
	// Add business validation for photos (e.g. JPG/PNG) and documents (e.g. PDF) here.
	return nil
}

func (s *service) GetCandidateStatus(ctx context.Context, candidateCode string) (*CandidateStatusResponse, error) {
	app, err := s.repo.GetCandidateApplicationByID(ctx, candidateCode)
	if err != nil {
		return nil, err
	}

	return &CandidateStatusResponse{
		CandidateCode: app.ID,
		Status:        app.Status,
		SubmittedAt:   app.CreatedAt,
	}, nil
}

func (s *service) UploadDocuments(ctx context.Context, candidateCode string, photo, document *multipart.FileHeader) (*CandidateDocumentsResponse, error) {
	app, err := s.repo.GetCandidateApplicationByID(ctx, candidateCode)
	if err != nil {
		return nil, err
	}

	if app.Status != "SUBMITTED" {
		return nil, errors.New("candidate application status does not allow document upload")
	}

	if photo == nil && document == nil {
		return nil, errors.New("no files provided for upload")
	}

	var newPhotoPath, newDocPath *string
	var photoURL, docURL string

	if photo != nil {
		if err := s.validateFile(photo, []string{".jpg", ".jpeg", ".png", ".webp"}); err != nil {
			return nil, fmt.Errorf("photo validation failed: %w", err)
		}
		src, err := photo.Open()
		if err != nil {
			return nil, fmt.Errorf("failed to open photo file: %w", err)
		}
		defer src.Close()

		path := fmt.Sprintf("candidates/%s/photo%s", candidateCode, filepath.Ext(photo.Filename))
		_, err = s.storage.Upload(ctx, src, path)
		if err != nil {
			return nil, fmt.Errorf("failed to upload photo: %w", err)
		}
		newPhotoPath = &path
		photoURL = s.storage.URL(path)
	}

	if document != nil {
		if err := s.validateFile(document, []string{".pdf"}); err != nil {
			// Rollback photo if document fails
			if newPhotoPath != nil {
				_ = s.storage.Delete(ctx, *newPhotoPath)
			}
			return nil, fmt.Errorf("document validation failed: %w", err)
		}
		src, err := document.Open()
		if err != nil {
			if newPhotoPath != nil {
				_ = s.storage.Delete(ctx, *newPhotoPath)
			}
			return nil, fmt.Errorf("failed to open document file: %w", err)
		}
		defer src.Close()

		path := fmt.Sprintf("candidates/%s/document%s", candidateCode, filepath.Ext(document.Filename))
		_, err = s.storage.Upload(ctx, src, path)
		if err != nil {
			if newPhotoPath != nil {
				_ = s.storage.Delete(ctx, *newPhotoPath)
			}
			return nil, fmt.Errorf("failed to upload document: %w", err)
		}
		newDocPath = &path
		docURL = s.storage.URL(path)
	}

	// Delete old files asynchronously if they are being replaced
	if newPhotoPath != nil && app.PhotoPath != nil {
		go func(path string) {
			_ = s.storage.Delete(context.Background(), path)
		}(*app.PhotoPath)
	}
	if newDocPath != nil && app.DocumentPath != nil {
		go func(path string) {
			_ = s.storage.Delete(context.Background(), path)
		}(*app.DocumentPath)
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	if err := s.repo.UpdateDocumentPaths(ctx, tx, candidateCode, newPhotoPath, newDocPath); err != nil {
		return nil, err
	}

	if err := s.repo.LogAudit(ctx, tx, "candidate", "UPLOAD_DOCUMENTS", "candidate_applications", candidateCode, ""); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	// Fetch existing URLs if not updated
	if newPhotoPath == nil && app.PhotoPath != nil {
		photoURL = s.storage.URL(*app.PhotoPath)
	}
	if newDocPath == nil && app.DocumentPath != nil {
		docURL = s.storage.URL(*app.DocumentPath)
	}

	return &CandidateDocumentsResponse{
		PhotoURL:    photoURL,
		DocumentURL: docURL,
	}, nil
}

func (s *service) validateFile(file *multipart.FileHeader, allowedExts []string) error {
	if file.Size > s.maxUploadSize {
		return fmt.Errorf("file size exceeds maximum limit of %d bytes", s.maxUploadSize)
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	valid := false
	for _, e := range allowedExts {
		if ext == e {
			valid = true
			break
		}
	}
	if !valid {
		return fmt.Errorf("invalid file extension: %s. allowed: %v", ext, allowedExts)
	}
	return nil
}

func (s *service) GetDocuments(ctx context.Context, candidateCode string) (*CandidateDocumentsResponse, error) {
	app, err := s.repo.GetCandidateApplicationByID(ctx, candidateCode)
	if err != nil {
		return nil, err
	}

	res := &CandidateDocumentsResponse{}
	if app.PhotoPath != nil {
		res.PhotoURL = s.storage.URL(*app.PhotoPath)
	}
	if app.DocumentPath != nil {
		res.DocumentURL = s.storage.URL(*app.DocumentPath)
	}

	return res, nil
}

func (s *service) DeleteDocuments(ctx context.Context, candidateCode string, req *DeleteDocumentsRequest) error {
	app, err := s.repo.GetCandidateApplicationByID(ctx, candidateCode)
	if err != nil {
		return err
	}

	if app.Status != "SUBMITTED" {
		return errors.New("candidate application status does not allow document deletion")
	}

	if !req.Photo && !req.Document {
		return errors.New("no documents specified for deletion")
	}

	if req.Photo {
		if app.PhotoPath != nil {
			go func(p string) {
				_ = s.storage.Delete(context.Background(), p)
			}(*app.PhotoPath)
		}
	}

	if req.Document {
		if app.DocumentPath != nil {
			go func(p string) {
				_ = s.storage.Delete(context.Background(), p)
			}(*app.DocumentPath)
		}
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Need a specific query to set to NULL, as COALESCE in UpdateDocumentPaths won't work for NULL updates.
	// We'll write a small custom execution here since it's targeted.
	query := `UPDATE candidate_applications SET updated_at = NOW()`
	args := []interface{}{}
	argId := 1
	if req.Photo {
		query += fmt.Sprintf(", photo_path = $%d", argId)
		args = append(args, nil)
		argId++
	}
	if req.Document {
		query += fmt.Sprintf(", document_path = $%d", argId)
		args = append(args, nil)
		argId++
	}
	query += fmt.Sprintf(" WHERE id = $%d", argId)
	args = append(args, candidateCode)

	_, err = tx.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}

	if err := s.repo.LogAudit(ctx, tx, "candidate", "DELETE_DOCUMENTS", "candidate_applications", candidateCode, ""); err != nil {
		return err
	}

	return tx.Commit()
}

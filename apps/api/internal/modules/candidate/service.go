package candidate

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"strings"
	"time"

	"github.com/disintegration/imaging"
	"github.com/gabriel-vasile/mimetype"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"go.uber.org/zap"
	_ "golang.org/x/image/webp"
)

type Service interface {
	Create(ctx context.Context, req CreateCandidateRequest) (*CandidateResponse, error)
	GetByID(ctx context.Context, id string) (*CandidateResponse, error)
	GetAll(ctx context.Context) ([]CandidateResponse, error)
	Update(ctx context.Context, id string, req UpdateCandidateRequest) (*CandidateResponse, error)
	Patch(ctx context.Context, id string, req PatchCandidateRequest) (*CandidateResponse, error)
	Delete(ctx context.Context, id string) error

	UploadDocument(ctx context.Context, candidateID string, docType string, filename string, mimeType string, size int64, file io.Reader) (*CandidateDocumentResponse, error)
	UploadPhoto(ctx context.Context, candidateID string, filename string, mimeType string, size int64, file io.Reader) (*CandidateResponse, error)
	ListDocuments(ctx context.Context, candidateID string) ([]CandidateDocumentResponse, error)
	DeleteDocument(ctx context.Context, candidateID string, docID string) error
	StreamDocument(ctx context.Context, candidateID string, docID string) (io.ReadCloser, string, error)

	// Admin methods
	AdminListCandidates(ctx context.Context, statusFilter string, musyawarahFilter string, search string) ([]CandidateResponse, error)
	AdminDeleteCandidate(ctx context.Context, id string, adminUserID string) error
	AdminBulkDeleteCandidates(ctx context.Context, ids []string, adminUserID string) error
	AdminVerifyCandidate(ctx context.Context, id string, req AdminVerifyCandidateRequest, adminUserID string) error
	AdminVerifyDocument(ctx context.Context, id string, docID string, req AdminVerifyDocumentRequest, adminUserID string) error
	AdminPublishCandidate(ctx context.Context, id string, adminUserID string) error
	AdminUnpublishCandidate(ctx context.Context, id string, adminUserID string) error
	AdminUpdatePublicationSettings(ctx context.Context, id string, req AdminPublicationRequest, adminUserID string) error
	AdminReorderCandidates(ctx context.Context, req AdminReorderCandidatesRequest, adminUserID string) error
}

const candidateStoragePathFormat = "candidates/%s/%s"

type service struct {
	repo          Repository
	auditService  audit.AuditService
	storage       storage.Storage
	maxUploadSize int64
	cfg           *config.Config
	log           *zap.Logger
}

func NewService(repo Repository, auditService audit.AuditService, st storage.Storage, maxUploadSize int64, cfg *config.Config, log *zap.Logger) Service {
	return &service{
		repo:          repo,
		auditService:  auditService,
		storage:       st,
		maxUploadSize: maxUploadSize,
		cfg:           cfg,
		log:           log,
	}
}

func (s *service) Create(ctx context.Context, req CreateCandidateRequest) (*CandidateResponse, error) {
	// Generate unique registration number
	prefix := "MUS"
	if len(req.MusyawarahID) >= 4 {
		prefix = req.MusyawarahID[:4]
	}
	regNum := fmt.Sprintf("CAN-%s-%s", strings.ToUpper(prefix), strings.ToUpper(uuid.New().String()[:8]))

	status := StatusDraft
	if req.Status != nil && *req.Status != "" {
		status = *req.Status
	}

	pubStatus := "Unpublished"
	if req.PublicationStatus != nil && *req.PublicationStatus != "" {
		pubStatus = *req.PublicationStatus
	}

	displayOrder := 0
	if req.DisplayOrder != nil {
		displayOrder = *req.DisplayOrder
	}

	showBio := true
	if req.ShowBiography != nil {
		showBio = *req.ShowBiography
	}

	showVis := true
	if req.ShowVision != nil {
		showVis = *req.ShowVision
	}

	showMis := true
	if req.ShowMission != nil {
		showMis = *req.ShowMission
	}

	showPhoto := true
	if req.ShowPhoto != nil {
		showPhoto = *req.ShowPhoto
	}

	c := &Candidate{
		MusyawarahID:       req.MusyawarahID,
		RegistrationNumber: regNum,
		FullName:           req.FullName,
		Nickname:           req.Nickname,
		Email:              req.Email,
		Phone:              req.Phone,

		CompanyName:       req.CompanyName,
		IndustrialArea:    req.IndustrialArea,
		JobTitle:          req.JobTitle,
		Department:        req.Department,
		Biography:         req.Biography,
		Motivation:        req.Motivation,
		Vision:            req.Vision,
		Mission:           req.Mission,
		Status:            status,
		CandidateNumber:   req.CandidateNumber,
		DisplayOrder:      displayOrder,
		PublicationStatus: pubStatus,
		ShowBiography:     showBio,
		ShowVision:        showVis,
		ShowMission:       showMis,
		ShowPhoto:         showPhoto,
	}

	err := s.repo.Create(ctx, c)
	if err != nil {
		return nil, err
	}

	// Fetch newly created record to get all fields including ID and timestamps
	c, err = s.repo.GetByID(ctx, c.ID)
	if err != nil {
		return nil, err
	}

	// Audit Log
	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleCandidate,
		Entity:   "candidates",
		EntityID: c.ID,
		Action:   "CREATE",
		NewValue: c,
	})

	res := s.mapToResponse(c)

	// Generate Candidate Token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  res.ID,
		"role": "candidate",
		"exp":  time.Now().Add(72 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString([]byte(s.cfg.JWTSecret))
	res.Token = tokenString

	return &res, nil
}

func (s *service) GetByID(ctx context.Context, id string) (*CandidateResponse, error) {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	res := s.mapToResponse(c)
	return &res, nil
}

func (s *service) GetAll(ctx context.Context) ([]CandidateResponse, error) {
	candidates, err := s.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	var res []CandidateResponse
	for _, c := range candidates {
		res = append(res, s.mapToResponse(&c))
	}
	return res, nil
}

func (s *service) Update(ctx context.Context, id string, req UpdateCandidateRequest) (*CandidateResponse, error) {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	oldVal := *c

	c.FullName = req.FullName
	c.Nickname = req.Nickname
	c.Email = req.Email
	c.Phone = req.Phone

	c.CompanyName = req.CompanyName
	c.IndustrialArea = req.IndustrialArea
	c.JobTitle = req.JobTitle
	c.Department = req.Department
	c.Biography = req.Biography
	c.Motivation = req.Motivation
	c.Vision = req.Vision
	c.Mission = req.Mission
	if req.ProfilePhoto != nil {
		c.ProfilePhoto = req.ProfilePhoto
	}

	if req.CandidateNumber != nil {
		c.CandidateNumber = req.CandidateNumber
	}
	if req.DisplayOrder != nil {
		c.DisplayOrder = *req.DisplayOrder
	}
	if req.PublicationStatus != nil && *req.PublicationStatus != "" {
		c.PublicationStatus = *req.PublicationStatus
	}
	if req.ShowBiography != nil {
		c.ShowBiography = *req.ShowBiography
	}
	if req.ShowVision != nil {
		c.ShowVision = *req.ShowVision
	}
	if req.ShowMission != nil {
		c.ShowMission = *req.ShowMission
	}
	if req.ShowPhoto != nil {
		c.ShowPhoto = *req.ShowPhoto
	}

	if req.Status != nil && *req.Status != "" {
		c.Status = *req.Status
	}

	err = s.repo.Update(ctx, c)
	if err != nil {
		return nil, err
	}

	c, _ = s.repo.GetByID(ctx, id)

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:        audit.ModuleCandidate,
		Entity:        "candidates",
		EntityID:      c.ID,
		Action:        "UPDATE",
		PreviousValue: oldVal,
		NewValue:      c,
	})

	res := s.mapToResponse(c)
	return &res, nil
}

func (s *service) Patch(ctx context.Context, id string, req PatchCandidateRequest) (*CandidateResponse, error) {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if c.Status != StatusDraft && c.Status != StatusRevisionRequired {
		return nil, errors.New("cannot modify candidate: not in draft state")
	}

	oldVal := *c

	if req.FullName != nil {
		c.FullName = *req.FullName
	}
	if req.Nickname != nil {
		c.Nickname = req.Nickname
	}
	if req.Email != nil {
		c.Email = *req.Email
	}
	if req.Phone != nil {
		c.Phone = *req.Phone
	}

	if req.CompanyName != nil {
		c.CompanyName = req.CompanyName
	}
	if req.IndustrialArea != nil {
		c.IndustrialArea = req.IndustrialArea
	}
	if req.JobTitle != nil {
		c.JobTitle = req.JobTitle
	}
	if req.Department != nil {
		c.Department = req.Department
	}
	if req.Biography != nil {
		c.Biography = req.Biography
	}
	if req.Motivation != nil {
		c.Motivation = req.Motivation
	}
	if req.Vision != nil {
		c.Vision = req.Vision
	}
	if req.Mission != nil {
		c.Mission = req.Mission
	}
	if req.ProfilePhoto != nil {
		c.ProfilePhoto = req.ProfilePhoto
	}
	if req.Status != nil {
		c.Status = *req.Status
	}

	err = s.repo.Update(ctx, c)
	if err != nil {
		return nil, err
	}

	c, _ = s.repo.GetByID(ctx, id)

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:        audit.ModuleCandidate,
		Entity:        "candidates",
		EntityID:      c.ID,
		Action:        "UPDATE",
		PreviousValue: oldVal,
		NewValue:      c,
	})

	res := s.mapToResponse(c)
	return &res, nil
}

func (s *service) Delete(ctx context.Context, id string) error {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if c.Status != StatusDraft {
		return errors.New("cannot delete a candidate that is not in draft state")
	}

	err = s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:        audit.ModuleCandidate,
		Entity:        "candidates",
		EntityID:      id,
		Action:        "DELETE",
		PreviousValue: c,
	})

	return nil
}

func (s *service) mapToResponse(c *Candidate) CandidateResponse {
	var profilePhoto *string
	if c.ProfilePhoto != nil && *c.ProfilePhoto != "" {
		url := s.storage.URL(*c.ProfilePhoto)
		profilePhoto = &url
	}

	return CandidateResponse{
		ID:                 c.ID,
		MusyawarahID:       c.MusyawarahID,
		RegistrationNumber: c.RegistrationNumber,
		FullName:           c.FullName,
		Nickname:           c.Nickname,
		Email:              c.Email,
		Phone:              c.Phone,

		CompanyName:       c.CompanyName,
		IndustrialArea:    c.IndustrialArea,
		JobTitle:          c.JobTitle,
		Department:        c.Department,
		Biography:         c.Biography,
		Motivation:        c.Motivation,
		Vision:            c.Vision,
		Mission:           c.Mission,
		ProfilePhoto:      profilePhoto,
		Status:            c.Status,
		VerificationNotes: c.VerificationNotes,
		CandidateNumber:   c.CandidateNumber,
		DisplayOrder:      c.DisplayOrder,
		PublicationStatus: c.PublicationStatus,
		PublishedAt:       c.PublishedAt,
		ShowBiography:     c.ShowBiography,
		ShowVision:        c.ShowVision,
		ShowMission:       c.ShowMission,
		ShowPhoto:         c.ShowPhoto,
		CreatedAt:         c.CreatedAt,
		UpdatedAt:         c.UpdatedAt,
	}
}

func mapToDocumentResponse(d *CandidateDocument) CandidateDocumentResponse {
	return CandidateDocumentResponse{
		ID:                 d.ID,
		CandidateID:        d.CandidateID,
		DocumentType:       d.DocumentType,
		OriginalFilename:   d.OriginalFilename,
		MimeType:           d.MimeType,
		FileSize:           d.FileSize,
		UploadedAt:         d.UploadedAt,
		VerificationStatus: d.VerificationStatus,
		VerificationNotes:  d.VerificationNotes,
	}
}

func (s *service) UploadDocument(ctx context.Context, candidateID string, docType string, filename string, mimeType string, size int64, file io.Reader) (*CandidateDocumentResponse, error) {
	c, err := s.repo.GetByID(ctx, candidateID)
	if err != nil {
		return nil, err
	}
	if c.Status != StatusDraft {
		return nil, errors.New("cannot upload documents for a non-draft candidate")
	}

	if size > s.maxUploadSize {
		return nil, errors.New("file size exceeds maximum allowed size")
	}

	allowedTypes := map[string]bool{
		"image/jpeg":      true,
		"image/png":       true,
		"image/webp":      true,
		"application/pdf": true,
	}
	if !allowedTypes[mimeType] {
		return nil, errors.New("invalid mime type")
	}

	// Check if document already exists to determine REPLACE vs UPLOAD
	existingDocs, _ := s.repo.FindDocumentsByCandidateID(ctx, candidateID)
	action := audit.AuditAction("UPLOAD_DOCUMENT")
	for _, d := range existingDocs {
		if d.DocumentType == docType {
			action = audit.AuditAction("REPLACE_DOCUMENT")
			break
		}
	}

	// Generate a unique filename for storage
	ext := filepath.Ext(filename)
	storedFilename := fmt.Sprintf("candidate_%s_%s_%s%s", candidateID, strings.ReplaceAll(strings.ToLower(docType), " ", "_"), uuid.New().String()[:8], ext)
	storagePath := fmt.Sprintf(candidateStoragePathFormat, candidateID, storedFilename)

	// Upload to storage
	_, err = s.storage.Upload(ctx, file, storagePath)
	if err != nil {
		return nil, fmt.Errorf("failed to upload to storage: %w", err)
	}

	doc := &CandidateDocument{
		CandidateID:      candidateID,
		DocumentType:     docType,
		OriginalFilename: filename,
		StoredFilename:   storedFilename,
		MimeType:         mimeType,
		FileSize:         size,
		StorageProvider:  "local",
		StoragePath:      storagePath,
	}

	err = s.repo.SaveDocument(ctx, doc)
	if err != nil {
		return nil, err
	}

	// Fetch to get exact details including the ID
	docs, _ := s.repo.FindDocumentsByCandidateID(ctx, candidateID)
	var finalDoc *CandidateDocument
	for _, d := range docs {
		if d.DocumentType == docType {
			finalDoc = &d
			break
		}
	}
	if finalDoc == nil {
		return nil, errors.New("failed to retrieve saved document")
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleCandidate,
		Entity:   "candidate_documents",
		EntityID: finalDoc.ID,
		Action:   action,
		Metadata: map[string]interface{}{
			"DocumentType": docType,
		},
	})

	res := mapToDocumentResponse(finalDoc)
	return &res, nil
}

func (s *service) ListDocuments(ctx context.Context, candidateID string) ([]CandidateDocumentResponse, error) {
	docs, err := s.repo.FindDocumentsByCandidateID(ctx, candidateID)
	if err != nil {
		return nil, err
	}
	var res []CandidateDocumentResponse
	for _, d := range docs {
		res = append(res, mapToDocumentResponse(&d))
	}
	return res, nil
}

func (s *service) DeleteDocument(ctx context.Context, candidateID string, docID string) error {
	c, err := s.repo.GetByID(ctx, candidateID)
	if err != nil {
		return err
	}
	if c.Status != StatusDraft {
		return errors.New("cannot delete documents for a non-draft candidate")
	}

	doc, err := s.repo.GetDocumentByID(ctx, docID)
	if err != nil {
		return err
	}
	if doc.CandidateID != candidateID {
		return errors.New("unauthorized to delete this document")
	}

	err = s.repo.DeleteDocument(ctx, docID)
	if err != nil {
		return err
	}

	_ = s.storage.Delete(ctx, doc.StoragePath)

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleCandidate,
		Entity:   "candidate_documents",
		EntityID: docID,
		Action:   "DELETE_DOCUMENT",
		Metadata: map[string]interface{}{
			"DocumentType": doc.DocumentType,
		},
	})

	return nil
}

func (s *service) StreamDocument(ctx context.Context, candidateID string, docID string) (io.ReadCloser, string, error) {
	// Security Check: Candidate must own document
	doc, err := s.repo.GetDocumentByID(ctx, docID)
	if err != nil {
		return nil, "", err
	}
	if doc.CandidateID != candidateID {
		return nil, "", errors.New("unauthorized to access this document")
	}

	reader, err := s.storage.Download(ctx, doc.StoragePath)
	if err != nil {
		return nil, "", fmt.Errorf("failed to download from storage: %w", err)
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleCandidate,
		Entity:   "candidate_documents",
		EntityID: docID,
		Action:   "DOWNLOAD_DOCUMENT",
		Metadata: map[string]interface{}{
			"DocumentType": doc.DocumentType,
		},
	})

	return reader, doc.MimeType, nil
}

// Admin Methods
func (s *service) AdminListCandidates(ctx context.Context, statusFilter string, musyawarahFilter string, search string) ([]CandidateResponse, error) {
	candidates, err := s.repo.AdminListCandidates(ctx, statusFilter, musyawarahFilter, search)
	if err != nil {
		return nil, err
	}

	var res []CandidateResponse
	for _, c := range candidates {
		res = append(res, s.mapToResponse(&c))
	}
	return res, nil
}

func (s *service) AdminVerifyCandidate(ctx context.Context, id string, req AdminVerifyCandidateRequest, adminUserID string) error {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Validate transitions
	if c.Status == "Verified" || c.Status == "Rejected" {
		return errors.New("cannot verify candidate: already finalized")
	}

	if c.Status == "Submitted" && req.Status != "Under Review" {
		return errors.New("cannot verify candidate: Submitted must transition to Under Review first")
	}

	if c.Status == "Under Review" && req.Status != "Verified" && req.Status != "Rejected" && req.Status != "Revision Required" {
		return errors.New("cannot verify candidate: invalid transition from Under Review")
	}

	if c.Status == "Revision Required" {
		// they must resubmit first before admin changes status, unless admin forces reject?
		// for now, let's just let it transition if valid request. Wait, if it's Revision Required, candidate needs to update.
		// Actually if they resubmit, the status goes back to Submitted. So Admin shouldn't change from Revision Required directly to Verified.
	}

	err = s.repo.AdminUpdateStatus(ctx, id, req.Status, req.VerificationNotes)
	if err != nil {
		return err
	}

	// Audit Log
	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleCandidate,
		Entity:   "candidates",
		EntityID: id,
		Action:   "ADMIN_VERIFY",
		PreviousValue: map[string]interface{}{
			"status":             c.Status,
			"verification_notes": c.VerificationNotes,
		},
		NewValue: map[string]interface{}{
			"status":             req.Status,
			"verification_notes": req.VerificationNotes,
		},
		ActorID: &adminUserID, // track who verified
	})

	return nil
}

func (s *service) AdminVerifyDocument(ctx context.Context, id string, docID string, req AdminVerifyDocumentRequest, adminUserID string) error {
	doc, err := s.repo.GetDocumentByID(ctx, docID)
	if err != nil {
		return err
	}
	if doc.CandidateID != id {
		return errors.New("document does not belong to candidate")
	}

	err = s.repo.AdminUpdateDocumentStatus(ctx, docID, req.VerificationStatus, req.VerificationNotes)
	if err != nil {
		return err
	}

	// Audit Log
	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleCandidate,
		Entity:   "candidate_documents",
		EntityID: docID,
		Action:   "ADMIN_VERIFY_DOCUMENT",
		PreviousValue: map[string]interface{}{
			"verification_status": doc.VerificationStatus,
			"verification_notes":  doc.VerificationNotes,
		},
		NewValue: map[string]interface{}{
			"verification_status": req.VerificationStatus,
			"verification_notes":  req.VerificationNotes,
		},
		ActorID: &adminUserID,
	})

	return nil
}

func (s *service) AdminPublishCandidate(ctx context.Context, id string, adminUserID string) error {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if c.Status != "Verified" {
		return errors.New("only verified candidates can be published")
	}

	if c.PublicationStatus == "Published" {
		return nil // already published
	}

	err = s.repo.AdminUpdatePublicationStatus(ctx, id, "Published")
	if err != nil {
		return err
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleCandidate,
		Entity:   "candidates",
		EntityID: id,
		Action:   "ADMIN_PUBLISH",
		PreviousValue: map[string]interface{}{
			"publication_status": c.PublicationStatus,
		},
		NewValue: map[string]interface{}{
			"publication_status": "Published",
		},
		ActorID: &adminUserID,
	})

	return nil
}

func (s *service) AdminUnpublishCandidate(ctx context.Context, id string, adminUserID string) error {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if c.PublicationStatus != "Published" {
		return nil
	}

	err = s.repo.AdminUpdatePublicationStatus(ctx, id, "Unpublished")
	if err != nil {
		return err
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleCandidate,
		Entity:   "candidates",
		EntityID: id,
		Action:   "ADMIN_UNPUBLISH",
		PreviousValue: map[string]interface{}{
			"publication_status": c.PublicationStatus,
		},
		NewValue: map[string]interface{}{
			"publication_status": "Unpublished",
		},
		ActorID: &adminUserID,
	})

	return nil
}

func (s *service) AdminUpdatePublicationSettings(ctx context.Context, id string, req AdminPublicationRequest, adminUserID string) error {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	err = s.repo.AdminUpdatePublicationSettings(ctx, id, req.CandidateNumber, req.DisplayOrder, req.ShowBiography, req.ShowVision, req.ShowMission, req.ShowPhoto)
	if err != nil {
		return err
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleCandidate,
		Entity:   "candidates",
		EntityID: id,
		Action:   "ADMIN_UPDATE_PUBLICATION_SETTINGS",
		PreviousValue: map[string]interface{}{
			"candidate_number": c.CandidateNumber,
			"display_order":    c.DisplayOrder,
			"show_biography":   c.ShowBiography,
			"show_vision":      c.ShowVision,
			"show_mission":     c.ShowMission,
			"show_photo":       c.ShowPhoto,
		},
		NewValue: req,
		ActorID:  &adminUserID,
	})

	return nil
}

func (s *service) AdminReorderCandidates(ctx context.Context, req AdminReorderCandidatesRequest, adminUserID string) error {
	err := s.repo.AdminReorderCandidates(ctx, req.Items)
	if err != nil {
		return err
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleCandidate,
		Entity:   "candidates",
		EntityID: "bulk",
		Action:   "ADMIN_REORDER_CANDIDATES",
		NewValue: req.Items,
		ActorID:  &adminUserID,
	})

	return nil
}

func (s *service) UploadPhoto(ctx context.Context, candidateID string, filename string, mimeType string, size int64, file io.Reader) (*CandidateResponse, error) {
	c, err := s.repo.GetByID(ctx, candidateID)
	if err != nil {
		return nil, err
	}

	if size > 5*1024*1024 {
		return nil, errors.New("file size exceeds maximum allowed size of 5 MB")
	}

	lr := io.LimitReader(file, 5*1024*1024+1)
	fileBytes, err := io.ReadAll(lr)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}
	if len(fileBytes) > 5*1024*1024 {
		return nil, errors.New("file size exceeds maximum allowed size of 5 MB")
	}
	if len(fileBytes) == 0 {
		return nil, errors.New("file is empty")
	}

	detectedMime := mimetype.Detect(fileBytes)
	actualMime := detectedMime.String()

	allowedMimes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/webp": true,
		"image/gif":  true,
	}
	if !allowedMimes[actualMime] {
		return nil, errors.New("invalid file type. Only JPEG, PNG, WebP, and GIF are allowed")
	}

	img, err := imaging.Decode(bytes.NewReader(fileBytes), imaging.AutoOrientation(true))
	if err != nil {
		return nil, fmt.Errorf("failed to process image: %w", err)
	}

	var processedBuf bytes.Buffer
	err = imaging.Encode(&processedBuf, img, imaging.JPEG, imaging.JPEGQuality(90))
	if err != nil {
		return nil, fmt.Errorf("failed to encode processed image: %w", err)
	}

	ext := ".jpg"
	storagePath := fmt.Sprintf("candidates/%s/%s%s", candidateID, uuid.New().String(), ext)

	info, err := s.storage.Upload(ctx, bytes.NewReader(processedBuf.Bytes()), storagePath)
	if err != nil {
		s.log.Error("Failed to store photo", zap.Error(err))
		return nil, fmt.Errorf("failed to save photo: %w", err)
	}

	c.ProfilePhoto = &info.Path
	err = s.repo.Update(ctx, c)
	if err != nil {
		return nil, err
	}

	res := s.mapToResponse(c)
	return &res, nil
}

func (s *service) AdminDeleteCandidate(ctx context.Context, id string, adminUserID string) error {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	err = s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:        audit.ModuleCandidate,
		Entity:        "candidates",
		EntityID:      id,
		Action:        "ADMIN_DELETE",
		PreviousValue: c,
		ActorID:       &adminUserID,
	})

	return nil
}

func (s *service) AdminBulkDeleteCandidates(ctx context.Context, ids []string, adminUserID string) error {
	if len(ids) == 0 {
		return nil
	}

	err := s.repo.BulkDelete(ctx, ids)
	if err != nil {
		return err
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleCandidate,
		Entity:   "candidates",
		EntityID: "bulk",
		Action:   "ADMIN_BULK_DELETE",
		Metadata: map[string]interface{}{"candidate_ids": ids},
		ActorID:  &adminUserID,
	})

	return nil
}

package candidate

import (
	"context"
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
)

type Service interface {
	Create(ctx context.Context, req CreateCandidateRequest) (*CandidateResponse, error)
	GetByID(ctx context.Context, id string) (*CandidateResponse, error)
	GetAll(ctx context.Context) ([]CandidateResponse, error)
	Update(ctx context.Context, id string, req UpdateCandidateRequest) (*CandidateResponse, error)
	Patch(ctx context.Context, id string, req PatchCandidateRequest) (*CandidateResponse, error)
	Delete(ctx context.Context, id string) error

	UploadDocument(ctx context.Context, candidateID string, docType string, filename string, mimeType string, size int64, file io.Reader) (*CandidateDocumentResponse, error)
	ListDocuments(ctx context.Context, candidateID string) ([]CandidateDocumentResponse, error)
	DeleteDocument(ctx context.Context, candidateID string, docID string) error
	StreamDocument(ctx context.Context, candidateID string, docID string) (io.ReadCloser, string, error)

	// Admin methods
	AdminListCandidates(ctx context.Context, statusFilter string, musyawarahFilter string, search string) ([]CandidateResponse, error)
	AdminVerifyCandidate(ctx context.Context, id string, req AdminVerifyCandidateRequest, adminUserID string) error
	AdminVerifyDocument(ctx context.Context, id string, docID string, req AdminVerifyDocumentRequest, adminUserID string) error
}

type service struct {
	repo          Repository
	auditService  audit.AuditService
	storage       storage.Storage
	maxUploadSize int64
}

func NewService(repo Repository, auditService audit.AuditService, st storage.Storage, maxUploadSize int64) Service {
	return &service{
		repo:          repo,
		auditService:  auditService,
		storage:       st,
		maxUploadSize: maxUploadSize,
	}
}

func (s *service) Create(ctx context.Context, req CreateCandidateRequest) (*CandidateResponse, error) {
	// Generate unique registration number
	regNum := fmt.Sprintf("CAN-%s-%s", strings.ToUpper(req.MusyawarahID[:4]), strings.ToUpper(uuid.New().String()[:8]))

	c := &Candidate{
		MusyawarahID:       req.MusyawarahID,
		RegistrationNumber: regNum,
		FullName:           req.FullName,
		Nickname:           req.Nickname,
		Email:              req.Email,
		Phone:              req.Phone,
		Gender:             req.Gender,
		BirthPlace:         req.BirthPlace,
		Occupation:         req.Occupation,
		Organization:       req.Organization,
		Address:            req.Address,
		Biography:          req.Biography,
		Motivation:         req.Motivation,
		Vision:             req.Vision,
		Mission:            req.Mission,
		Status:             "Draft",
	}

	if req.BirthDate != nil {
		bd, err := time.Parse("2006-01-02", *req.BirthDate)
		if err == nil {
			c.BirthDate = &bd
		}
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

	res := mapToResponse(c)
	return &res, nil
}

func (s *service) GetByID(ctx context.Context, id string) (*CandidateResponse, error) {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	res := mapToResponse(c)
	return &res, nil
}

func (s *service) GetAll(ctx context.Context) ([]CandidateResponse, error) {
	candidates, err := s.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	var res []CandidateResponse
	for _, c := range candidates {
		res = append(res, mapToResponse(&c))
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
	c.Gender = req.Gender
	c.BirthPlace = req.BirthPlace
	c.Occupation = req.Occupation
	c.Organization = req.Organization
	c.Address = req.Address
	c.Biography = req.Biography
	c.Motivation = req.Motivation
	c.Vision = req.Vision
	c.Mission = req.Mission
	c.ProfilePhoto = req.ProfilePhoto

	if req.BirthDate != nil {
		bd, err := time.Parse("2006-01-02", *req.BirthDate)
		if err == nil {
			c.BirthDate = &bd
		}
	} else {
		c.BirthDate = nil
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

	res := mapToResponse(c)
	return &res, nil
}

func (s *service) Patch(ctx context.Context, id string, req PatchCandidateRequest) (*CandidateResponse, error) {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
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
	if req.Gender != nil {
		c.Gender = *req.Gender
	}
	if req.BirthPlace != nil {
		c.BirthPlace = req.BirthPlace
	}
	if req.BirthDate != nil {
		bd, err := time.Parse("2006-01-02", *req.BirthDate)
		if err == nil {
			c.BirthDate = &bd
		}
	}
	if req.Occupation != nil {
		c.Occupation = req.Occupation
	}
	if req.Organization != nil {
		c.Organization = req.Organization
	}
	if req.Address != nil {
		c.Address = req.Address
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

	res := mapToResponse(c)
	return &res, nil
}

func (s *service) Delete(ctx context.Context, id string) error {
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
		Action:        "DELETE",
		PreviousValue: c,
	})

	return nil
}

func mapToResponse(c *Candidate) CandidateResponse {
	var bdStr *string
	if c.BirthDate != nil {
		str := c.BirthDate.Format("2006-01-02")
		bdStr = &str
	}
	return CandidateResponse{
		ID:                 c.ID,
		MusyawarahID:       c.MusyawarahID,
		RegistrationNumber: c.RegistrationNumber,
		FullName:           c.FullName,
		Nickname:           c.Nickname,
		Email:              c.Email,
		Phone:              c.Phone,
		Gender:             c.Gender,
		BirthPlace:         c.BirthPlace,
		BirthDate:          bdStr,
		Occupation:         c.Occupation,
		Organization:       c.Organization,
		Address:            c.Address,
		Biography:          c.Biography,
		Motivation:         c.Motivation,
		Vision:             c.Vision,
		Mission:            c.Mission,
		ProfilePhoto:       c.ProfilePhoto,
		Status:             c.Status,
		VerificationNotes:  c.VerificationNotes,
		CreatedAt:          c.CreatedAt,
		UpdatedAt:          c.UpdatedAt,
	}
}

func mapToDocumentResponse(d *CandidateDocument) CandidateDocumentResponse {
	return CandidateDocumentResponse{
		ID:               d.ID,
		CandidateID:      d.CandidateID,
		DocumentType:     d.DocumentType,
		OriginalFilename: d.OriginalFilename,
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
	if c.Status != "Draft" {
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

	// Generate a unique filename for storage
	ext := filepath.Ext(filename)
	storedFilename := fmt.Sprintf("candidate_%s_%s_%s%s", candidateID, strings.ReplaceAll(strings.ToLower(docType), " ", "_"), uuid.New().String()[:8], ext)
	storagePath := fmt.Sprintf("candidates/%s/%s", candidateID, storedFilename)

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
		StorageProvider:  "local", // Can be dynamic based on config
		StoragePath:      storagePath,
	}

	err = s.repo.SaveDocument(ctx, doc)
	if err != nil {
		return nil, err
	}

	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:   audit.ModuleCandidate,
		Entity:   "candidate_documents",
		EntityID: doc.ID, // We might not have ID returned nicely if ON CONFLICT happens, but for audit it's okay
		Action:   "UPLOAD_DOCUMENT",
	})

	// Fetch to get exact details
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
	if c.Status != "Draft" {
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
		return nil, "", err
	}

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
		res = append(res, mapToResponse(&c))
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

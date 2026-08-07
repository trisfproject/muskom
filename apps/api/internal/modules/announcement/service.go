package announcement

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

var (
	ErrAnnouncementNotFound = errors.New("announcement not found")
	ErrDuplicateSlug        = errors.New("announcement slug already exists")
)

type Service interface {
	CreateAnnouncement(ctx context.Context, req CreateAnnouncementRequest, userID string) (*Announcement, error)
	GetAnnouncementByID(ctx context.Context, id string) (*Announcement, error)
	GetAnnouncementBySlug(ctx context.Context, slug string) (*Announcement, error)
	UpdateAnnouncement(ctx context.Context, id string, req UpdateAnnouncementRequest, userID string) (*Announcement, error)
	DeleteAnnouncement(ctx context.Context, id string) error
	ListAnnouncements(ctx context.Context, publicOnly bool) ([]Announcement, error)
	
	CreateBroadcast(ctx context.Context, annID string, req CreateBroadcastRequest, userID string) (*BroadcastJob, error)
	ListBroadcastJobs(ctx context.Context, limit int, offset int) ([]BroadcastJob, error)
}

type service struct {
	repo Repository
	log  *zap.Logger
}

func NewService(repo Repository, log *zap.Logger) Service {
	return &service{
		repo: repo,
		log:  log,
	}
}

func (s *service) generateSlug(title string) string {
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	return slug + "-" + uuid.New().String()[:8]
}

func (s *service) CreateAnnouncement(ctx context.Context, req CreateAnnouncementRequest, userID string) (*Announcement, error) {
	ann := &Announcement{
		ID:           uuid.New().String(),
		Title:        req.Title,
		Slug:         s.generateSlug(req.Title),
		Summary:      req.Summary,
		Content:      req.Content,
		ThumbnailURL: req.ThumbnailURL,
		Category:     req.Category,
		Priority:     req.Priority,
		Status:       StatusDraft, // Default
		Pinned:       req.Pinned,
		PublishDate:  req.PublishDate,
		ExpireDate:   req.ExpireDate,
		CreatedBy:    &userID,
		UpdatedBy:    &userID,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	
	// Convert attachments to string (empty string for RC1 if not used)
	// If you use json marshalling you can handle it here
	ann.Attachments = nil 

	err := s.repo.CreateAnnouncement(ctx, ann)
	if err != nil {
		s.log.Error("Failed to create announcement", zap.Error(err))
		return nil, err
	}

	return ann, nil
}

func (s *service) GetAnnouncementByID(ctx context.Context, id string) (*Announcement, error) {
	ann, err := s.repo.GetAnnouncementByID(ctx, id)
	if err != nil {
		s.log.Error("Failed to get announcement by ID", zap.Error(err))
		return nil, err
	}
	if ann == nil {
		return nil, ErrAnnouncementNotFound
	}
	return ann, nil
}

func (s *service) GetAnnouncementBySlug(ctx context.Context, slug string) (*Announcement, error) {
	ann, err := s.repo.GetAnnouncementBySlug(ctx, slug)
	if err != nil {
		s.log.Error("Failed to get announcement by slug", zap.Error(err))
		return nil, err
	}
	if ann == nil {
		return nil, ErrAnnouncementNotFound
	}
	return ann, nil
}

func (s *service) UpdateAnnouncement(ctx context.Context, id string, req UpdateAnnouncementRequest, userID string) (*Announcement, error) {
	ann, err := s.GetAnnouncementByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Title != nil {
		ann.Title = *req.Title
		// Re-generate slug? Usually no, to prevent broken links
	}
	if req.Summary != nil {
		ann.Summary = req.Summary
	}
	if req.Content != nil {
		ann.Content = *req.Content
	}
	if req.ThumbnailURL != nil {
		ann.ThumbnailURL = req.ThumbnailURL
	}
	if req.Category != nil {
		ann.Category = *req.Category
	}
	if req.Priority != nil {
		ann.Priority = *req.Priority
	}
	if req.Status != nil {
		ann.Status = *req.Status
	}
	if req.Pinned != nil {
		ann.Pinned = *req.Pinned
	}
	
	// Ensure PublishDate and ExpireDate can be set or cleared
	// req.PublishDate could be empty or set
	ann.PublishDate = req.PublishDate
	ann.ExpireDate = req.ExpireDate
	
	ann.UpdatedBy = &userID
	ann.UpdatedAt = time.Now()

	err = s.repo.UpdateAnnouncement(ctx, ann)
	if err != nil {
		s.log.Error("Failed to update announcement", zap.Error(err))
		return nil, err
	}

	return ann, nil
}

func (s *service) DeleteAnnouncement(ctx context.Context, id string) error {
	_, err := s.GetAnnouncementByID(ctx, id)
	if err != nil {
		return err
	}
	
	err = s.repo.DeleteAnnouncement(ctx, id)
	if err != nil {
		s.log.Error("Failed to delete announcement", zap.Error(err))
		return err
	}
	return nil
}

func (s *service) ListAnnouncements(ctx context.Context, publicOnly bool) ([]Announcement, error) {
	return s.repo.ListAnnouncements(ctx, publicOnly)
}

func (s *service) CreateBroadcast(ctx context.Context, annID string, req CreateBroadcastRequest, userID string) (*BroadcastJob, error) {
	ann, err := s.GetAnnouncementByID(ctx, annID)
	if err != nil {
		return nil, err
	}

	job := &BroadcastJob{
		ID:                   uuid.New().String(),
		AnnouncementID:       ann.ID,
		TargetAudience:       req.TargetAudience,
		Channels:             "[]", // Marshall req.Channels in real implementation
		Status:               "Queued",
		CreatedBy:            &userID,
		CreatedAt:            time.Now(),
		UpdatedAt:            time.Now(),
	}

	err = s.repo.CreateBroadcastJob(ctx, job)
	if err != nil {
		s.log.Error("Failed to create broadcast job", zap.Error(err))
		return nil, err
	}

	return job, nil
}

func (s *service) ListBroadcastJobs(ctx context.Context, limit int, offset int) ([]BroadcastJob, error) {
	return s.repo.ListBroadcastJobs(ctx, limit, offset)
}

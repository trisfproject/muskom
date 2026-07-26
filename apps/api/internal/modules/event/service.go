package event

import (
	"context"
	"database/sql"
	"errors"

	"go.uber.org/zap"
)

var (
	ErrEventNotFound = errors.New("event not found")
)

type Service interface {
	CreateEvent(ctx context.Context, req *CreateEventRequest) (*EventResponse, error)
	GetEvent(ctx context.Context, id string) (*EventResponse, error)
	ListEvents(ctx context.Context, limit, offset int) (*PaginatedEventResponse, error)
	UpdateEvent(ctx context.Context, id string, req *UpdateEventRequest) (*EventResponse, error)
	SoftDeleteEvent(ctx context.Context, id string) error
}

type service struct {
	repo Repository
	log  *zap.Logger
}

func NewService(repo Repository, log *zap.Logger) Service {
	return &service{repo: repo, log: log}
}

func mapToResponse(e *Event) *EventResponse {
	return &EventResponse{
		ID:          e.ID,
		Name:        e.Name,
		Slug:        e.Slug,
		Theme:       e.Theme,
		Description: e.Description,
		Location:    e.Location,
		BannerPath:  e.BannerPath,
		LogoPath:    e.LogoPath,
		StartDate:   e.StartDate,
		EventDate:   e.EventDate,
		Status:      e.Status,
		CreatedAt:   e.CreatedAt,
	}
}

func (s *service) CreateEvent(ctx context.Context, req *CreateEventRequest) (*EventResponse, error) {
	e := &Event{
		Name:        req.Name,
		Slug:        req.Slug,
		Theme:       req.Theme,
		Description: req.Description,
		Location:    req.Location,
		StartDate:   req.StartDate,
		EventDate:   req.EventDate,
	}

	err := s.repo.Create(ctx, e)
	if err != nil {
		s.log.Error("failed to create event", zap.Error(err))
		return nil, err
	}
	return mapToResponse(e), nil
}

func (s *service) GetEvent(ctx context.Context, id string) (*EventResponse, error) {
	e, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrEventNotFound
		}
		return nil, err
	}
	return mapToResponse(e), nil
}

func (s *service) ListEvents(ctx context.Context, limit, offset int) (*PaginatedEventResponse, error) {
	if limit <= 0 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	events, total, err := s.repo.List(ctx, limit, offset)
	if err != nil {
		return nil, err
	}

	var items []EventResponse
	for _, e := range events {
		items = append(items, *mapToResponse(&e))
	}
	if items == nil {
		items = []EventResponse{}
	}

	return &PaginatedEventResponse{
		Items: items,
		Total: total,
	}, nil
}

func (s *service) UpdateEvent(ctx context.Context, id string, req *UpdateEventRequest) (*EventResponse, error) {
	e, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrEventNotFound
		}
		return nil, err
	}

	e.Name = req.Name
	e.Slug = req.Slug
	e.Theme = req.Theme
	e.Description = req.Description
	e.Location = req.Location
	e.StartDate = req.StartDate
	e.EventDate = req.EventDate
	e.Status = req.Status

	if err := s.repo.Update(ctx, e); err != nil {
		s.log.Error("failed to update event", zap.Error(err))
		return nil, err
	}

	return mapToResponse(e), nil
}

func (s *service) SoftDeleteEvent(ctx context.Context, id string) error {
	err := s.repo.SoftDelete(ctx, id)
	if err != nil {
		s.log.Error("failed to soft delete event", zap.Error(err))
		return err
	}
	return nil
}

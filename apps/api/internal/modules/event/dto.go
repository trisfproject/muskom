package event

import (
	"time"
)

// CreateEventRequest represents the payload to create a new event.
type CreateEventRequest struct {
	Name        string     `json:"name" validate:"required,max=255"`
	Slug        string     `json:"slug" validate:"required,max=255"`
	Theme       *string    `json:"theme" validate:"omitempty,max=255"`
	Description *string    `json:"description"`
	Location    *string    `json:"location" validate:"omitempty,max=255"`
	StartDate   *time.Time `json:"start_date"`
	EventDate   *time.Time `json:"event_date"`
}

// UpdateEventRequest represents the payload to update an existing event.
type UpdateEventRequest struct {
	Name        string     `json:"name" validate:"required,max=255"`
	Slug        string     `json:"slug" validate:"required,max=255"`
	Theme       *string    `json:"theme" validate:"omitempty,max=255"`
	Description *string    `json:"description"`
	Location    *string    `json:"location" validate:"omitempty,max=255"`
	StartDate   *time.Time `json:"start_date"`
	EventDate   *time.Time `json:"event_date"`
	Status      string     `json:"status" validate:"required,oneof=DRAFT UPCOMING ONGOING COMPLETED CANCELLED"`
}

// EventResponse represents the API response format for an Event.
type EventResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Slug        string     `json:"slug"`
	Theme       *string    `json:"theme"`
	Description *string    `json:"description"`
	Location    *string    `json:"location"`
	BannerPath  *string    `json:"banner_path"`
	LogoPath    *string    `json:"logo_path"`
	StartDate   *time.Time `json:"start_date"`
	EventDate   *time.Time `json:"event_date"`
	Status      string     `json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
}

// PaginatedEventResponse includes list of events and total count.
type PaginatedEventResponse struct {
	Items []EventResponse `json:"items"`
	Total int             `json:"total"`
}

package event

import (
	"time"
)

// Event represents a row in the events table.
type Event struct {
	ID          string     `db:"id"`
	Name        string     `db:"name"`
	Slug        string     `db:"slug"`
	Theme       *string    `db:"theme"`
	Description *string    `db:"description"`
	Location    *string    `db:"location"`
	BannerPath  *string    `db:"banner_path"`
	LogoPath    *string    `db:"logo_path"`
	StartDate   *time.Time `db:"start_date"`
	EventDate   *time.Time `db:"event_date"`
	Status      string     `db:"status"`
	CreatedAt   time.Time  `db:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at"`
	DeletedAt   *time.Time `db:"deleted_at"`
}

package candidate

import (
	"time"
)

// Candidate represents a candidate for Musyawarah.
type Candidate struct {
	ID                 string     `db:"id"`
	MusyawarahID       string     `db:"musyawarah_id"`
	RegistrationNumber string     `db:"registration_number"`
	FullName           string     `db:"full_name"`
	Nickname           *string    `db:"nickname"`
	Email              string     `db:"email"`
	Phone              string     `db:"phone"`
	Gender             string     `db:"gender"`
	BirthPlace         *string    `db:"birth_place"`
	BirthDate          *time.Time `db:"birth_date"`
	Occupation         *string    `db:"occupation"`
	Organization       *string    `db:"organization"`
	Address            *string    `db:"address"`
	Biography          *string    `db:"biography"`
	Motivation         *string    `db:"motivation"`
	Vision             *string    `db:"vision"`
	Mission            *string    `db:"mission"`
	ProfilePhoto       *string    `db:"profile_photo"`
	Status             string     `db:"status"`
	CreatedAt          time.Time  `db:"created_at"`
	UpdatedAt          time.Time  `db:"updated_at"`
	DeletedAt          *time.Time `db:"deleted_at"`
}

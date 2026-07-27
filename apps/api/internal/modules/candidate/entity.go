package candidate

import (
	"time"
)

type CandidateApplication struct {
	ID             string     `db:"id"`
	RegistrationID string     `db:"registration_id"`
	Vision         string     `db:"vision"`
	Mission        string     `db:"mission"`
	WorkProgram    string     `db:"work_program"`
	PhotoPath      *string    `db:"photo_path"`
	DocumentPath   *string    `db:"document_path"`
	Status         string     `db:"status"`
	ReviewedBy     *string    `db:"reviewed_by"`
	ReviewedAt     *time.Time `db:"reviewed_at"`
	CreatedAt      time.Time  `db:"created_at"`
	UpdatedAt      time.Time  `db:"updated_at"`
}

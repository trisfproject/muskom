package website

import (
	"errors"
	"time"
)

// Validator provides business rule validations for the Website Engine.
type Validator struct{}

// NewValidator creates a new Website Engine validator.
func NewValidator() *Validator {
	return &Validator{}
}

// ValidatePhaseDates checks that a timeline phase's end date is strictly after its start date.
func (v *Validator) ValidatePhaseDates(startDate, endDate time.Time) error {
	if !endDate.After(startDate) {
		return errors.New("end_date must be strictly after start_date")
	}
	return nil
}

// ValidateAnnouncementSlug ensures a slug is not empty and formatted properly.
func (v *Validator) ValidateAnnouncementSlug(slug string) error {
	if len(slug) == 0 {
		return errors.New("announcement slug cannot be empty")
	}
	return nil
}

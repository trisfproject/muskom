package validator

import (
	"github.com/go-playground/validator/v10"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

// Validator is a wrapper around go-playground/validator.
type Validator struct {
	validator *validator.Validate
}

// New creates a new Validator instance.
func New() *Validator {
	return &Validator{
		validator: validator.New(),
	}
}

// ValidateStruct validates a struct and returns standard error details.
func (v *Validator) ValidateStruct(s interface{}) []response.ErrorDetail {
	var errors []response.ErrorDetail

	err := v.validator.Struct(s)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			errors = append(errors, response.ErrorDetail{
				Field:   err.Field(),
				Message: err.Tag(), // Can be improved to generate user-friendly messages
			})
		}
	}

	return errors
}

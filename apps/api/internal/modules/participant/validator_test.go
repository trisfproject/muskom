package participant

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func TestValidateUpdateRequest(t *testing.T) {
	val := validator.New()

	t.Run("valid update request with partial fields", func(t *testing.T) {
		req := &UpdateParticipantRequest{
			Email:          "john@example.com",
			Phone:          "08123456789",
			CompanyName:    "Acme Corp",
			JobTitle:       "Software Engineer",
			IndustrialArea: "Area 1",
		}
		errs := ValidateUpdateRequest(val, req)
		assert.Empty(t, errs)
	})

	t.Run("valid update request with all fields empty or omitted", func(t *testing.T) {
		req := &UpdateParticipantRequest{}
		errs := ValidateUpdateRequest(val, req)
		assert.Empty(t, errs)
	})

	t.Run("invalid email in update request", func(t *testing.T) {
		req := &UpdateParticipantRequest{
			Email: "invalid-email",
		}
		errs := ValidateUpdateRequest(val, req)
		assert.NotEmpty(t, errs)
		assert.Equal(t, "Email", errs[0].Field)
	})
}

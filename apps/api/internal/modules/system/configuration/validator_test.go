package configuration

import (
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"testing"
)

func TestValidation(t *testing.T) {
	val := validator.New()
	payload := []byte(`{"community_name": ""}`)
	err := ValidateConfigPayload("website_identity", payload, val)
	if err == nil {
		t.Fatal("Expected validation to fail")
	}
	t.Logf("Failed successfully: %v", err)
}

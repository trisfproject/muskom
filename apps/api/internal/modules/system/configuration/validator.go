package configuration

import (
	"encoding/json"
	"fmt"

	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

// ValidateConfigPayload checks if the incoming JSON raw message can be unmarshaled
// into the corresponding typed struct and validates its constraints based on the group name.
func ValidateConfigPayload(groupName string, payload json.RawMessage, val *validator.Validator) error {
	var err error
	var configStruct interface{}

	switch groupName {
	case "website_identity":
		var c WebsiteIdentityConfig
		err = json.Unmarshal(payload, &c)
		configStruct = c
	case "publication":
		var c PublicationConfig
		err = json.Unmarshal(payload, &c)
		configStruct = c
	case "registration":
		var c RegistrationConfig
		err = json.Unmarshal(payload, &c)
		configStruct = c
	case "seo":
		var c SEOConfig
		err = json.Unmarshal(payload, &c)
		configStruct = c
	case "feature_flags":
		var c FeatureFlagsConfig
		err = json.Unmarshal(payload, &c)
		configStruct = c
	case "contact":
		var c ContactConfig
		err = json.Unmarshal(payload, &c)
		configStruct = c
	case "smtp":
		var c SMTPConfig
		err = json.Unmarshal(payload, &c)
		configStruct = c
	case "event":
		var c EventConfig
		err = json.Unmarshal(payload, &c)
		configStruct = c
	default:
		return fmt.Errorf("unknown configuration group: %s", groupName)
	}

	if err != nil {
		return fmt.Errorf("invalid payload format for group %s: %w", groupName, err)
	}

	// Validate against tags
	if errs := val.ValidateStruct(configStruct); len(errs) > 0 {
		return fmt.Errorf("validation failed: %v", errs)
	}

	return nil
}

package configuration

import (
	"encoding/json"
	"fmt"
)

// ValidateConfigPayload checks if the incoming JSON raw message can be unmarshaled
// into the corresponding typed struct based on the group name.
func ValidateConfigPayload(groupName string, payload json.RawMessage) error {
	var err error

	switch groupName {
	case "website_identity":
		var c WebsiteIdentityConfig
		err = json.Unmarshal(payload, &c)
	case "publication":
		var c PublicationConfig
		err = json.Unmarshal(payload, &c)
	case "registration":
		var c RegistrationConfig
		err = json.Unmarshal(payload, &c)
	case "timeline":
		var c TimelineConfig
		err = json.Unmarshal(payload, &c)
	case "contact":
		var c ContactConfig
		err = json.Unmarshal(payload, &c)
	default:
		return fmt.Errorf("unknown configuration group: %s", groupName)
	}

	if err != nil {
		return fmt.Errorf("invalid payload format for group %s: %w", groupName, err)
	}

	return nil
}

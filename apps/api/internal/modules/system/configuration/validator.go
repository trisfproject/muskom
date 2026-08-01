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
	case "website":
		var c WebsiteConfig
		err = json.Unmarshal(payload, &c)
	case "event":
		var c EventConfig
		err = json.Unmarshal(payload, &c)
	case "registration":
		var c RegistrationConfig
		err = json.Unmarshal(payload, &c)
	case "voting":
		var c VotingConfig
		err = json.Unmarshal(payload, &c)
	case "attendance":
		var c AttendanceConfig
		err = json.Unmarshal(payload, &c)
	case "notification":
		var c NotificationConfig
		err = json.Unmarshal(payload, &c)
	case "security":
		var c SecurityConfig
		err = json.Unmarshal(payload, &c)
	case "feature_flags":
		var c FeatureFlagsConfig
		err = json.Unmarshal(payload, &c)
	default:
		return fmt.Errorf("unknown configuration group: %s", groupName)
	}

	if err != nil {
		return fmt.Errorf("invalid payload format for group %s: %w", groupName, err)
	}

	return nil
}

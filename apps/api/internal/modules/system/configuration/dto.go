package configuration

import (
	"encoding/json"
)

type UpdateConfigRequest struct {
	GroupName string          `json:"group_name" validate:"required"`
	Settings  json.RawMessage `json:"settings" validate:"required"`
}

type SystemConfigResponse struct {
	Message string           `json:"message"`
	Data    FullSystemConfig `json:"data"`
}

package participant

import (
	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

// ValidateCreateRequest validates the CreateParticipantRequest payload
func ValidateCreateRequest(v *validator.Validator, req *CreateParticipantRequest) []response.ErrorDetail {
	return v.ValidateStruct(req)
}

// ValidateUpdateRequest validates the UpdateParticipantRequest payload
func ValidateUpdateRequest(v *validator.Validator, req *UpdateParticipantRequest) []response.ErrorDetail {
	return v.ValidateStruct(req)
}

// ValidateStatusRequest validates the UpdateStatusRequest payload
func ValidateStatusRequest(v *validator.Validator, req *UpdateStatusRequest) []response.ErrorDetail {
	return v.ValidateStruct(req)
}

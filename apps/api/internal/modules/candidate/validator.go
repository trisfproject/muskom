package candidate

type ValidationError struct {
	Details interface{}
}

func (v *ValidationError) Error() string {
	return "validation failed"
}

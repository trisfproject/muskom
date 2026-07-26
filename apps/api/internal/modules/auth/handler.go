package auth

type Handler struct {
	service Service
}

// NewHandler creates a new Auth Handler foundation.
func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

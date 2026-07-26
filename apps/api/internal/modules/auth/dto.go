package auth

// LoginRequest is the payload for the login endpoint.
type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// UserData represents the user object returned inside the login response.
type UserData struct {
	ID       string `json:"id"`
	FullName string `json:"full_name"`
	Username string `json:"username"`
	Role     string `json:"role"`
}

// LoginResponse represents the standard data returned on successful login.
type LoginResponse struct {
	AccessToken string   `json:"access_token"`
	ExpiresAt   string   `json:"expires_at"`
	User        UserData `json:"user"`
}

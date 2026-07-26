package auth

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type UserData struct {
	ID       string `json:"id"`
	FullName string `json:"full_name"`
	Username string `json:"username"`
	Role     string `json:"role"`
}

type LoginResponse struct {
	AccessToken string   `json:"access_token"`
	ExpiresAt   string   `json:"expires_at"`
	User        UserData `json:"user"`
}

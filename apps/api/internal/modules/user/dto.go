package user

import "time"

type CreateUserRequest struct {
	FullName string `json:"full_name" validate:"required,max=255"`
	Email    string `json:"email" validate:"required,email,max=255"`
	Username string `json:"username" validate:"required,max=100"`
	Password string `json:"password" validate:"required,min=8"`
	RoleID   string `json:"role_id" validate:"required,uuid"`
}

type UpdateRoleRequest struct {
	RoleID string `json:"role_id" validate:"required,uuid"`
}

type UpdateStatusRequest struct {
	IsActive bool `json:"is_active"`
}

type ResetPasswordRequest struct {
	NewPassword string `json:"new_password" validate:"required,min=8"`
}

type UpdateProfileRequest struct {
	FullName string `json:"full_name" validate:"required,max=255"`
	Email    string `json:"email" validate:"required,email,max=255"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=8"`
}

type UserResponse struct {
	ID          string     `json:"id"`
	FullName    string     `json:"full_name"`
	Email       string     `json:"email"`
	Username    string     `json:"username"`
	RoleID      string     `json:"role_id"`
	RoleCode    string     `json:"role_code"`
	RoleName    string     `json:"role_name"`
	IsActive    bool       `json:"is_active"`
	LastLoginAt *time.Time `json:"last_login_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type ListUsersResponse struct {
	Data       []UserResponse `json:"data"`
	Total      int            `json:"total"`
	Page       int            `json:"page"`
	Limit      int            `json:"limit"`
	TotalPages int            `json:"total_pages"`
}

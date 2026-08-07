package user

import (
	"context"
	"errors"
	"math"

	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserNotFound  = errors.New("user not found")
	ErrUsernameTaken = errors.New("username is already taken")
	ErrEmailTaken    = errors.New("email is already registered")
)

type Service interface {
	ListUsers(ctx context.Context, search string, roleID string, status string, page, limit int) (*ListUsersResponse, error)
	GetUser(ctx context.Context, id string) (*UserResponse, error)
	CreateUser(ctx context.Context, req *CreateUserRequest) (*UserResponse, error)
	UpdateRole(ctx context.Context, id string, req *UpdateRoleRequest) error
	UpdateStatus(ctx context.Context, id string, req *UpdateStatusRequest) error
	ResetPassword(ctx context.Context, id string, req *ResetPasswordRequest) error
	UpdateProfile(ctx context.Context, id string, req *UpdateProfileRequest) (*UserResponse, error)
	ChangePassword(ctx context.Context, id string, req *ChangePasswordRequest) error
}

type service struct {
	repo Repository
	log  *zap.Logger
}

func NewService(repo Repository, log *zap.Logger) Service {
	return &service{repo: repo, log: log}
}

func (s *service) ListUsers(ctx context.Context, search string, roleID string, status string, page, limit int) (*ListUsersResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	users, total, err := s.repo.ListUsers(ctx, search, roleID, status, page, limit)
	if err != nil {
		s.log.Error("Failed to list users", zap.Error(err))
		return nil, err
	}

	var data []UserResponse
	for _, u := range users {
		data = append(data, *s.mapEntityToResponse(&u))
	}

	if data == nil {
		data = []UserResponse{}
	}

	return &ListUsersResponse{
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: int(math.Ceil(float64(total) / float64(limit))),
	}, nil
}

func (s *service) GetUser(ctx context.Context, id string) (*UserResponse, error) {
	u, err := s.repo.GetUserByID(ctx, id)
	if err != nil {
		s.log.Error("Failed to get user", zap.Error(err))
		return nil, err
	}
	if u == nil {
		return nil, ErrUserNotFound
	}
	return s.mapEntityToResponse(u), nil
}

func (s *service) CreateUser(ctx context.Context, req *CreateUserRequest) (*UserResponse, error) {
	usernameExists, err := s.repo.CheckUsernameExists(ctx, req.Username)
	if err != nil {
		return nil, err
	}
	if usernameExists {
		return nil, ErrUsernameTaken
	}

	emailExists, err := s.repo.CheckEmailExists(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if emailExists {
		return nil, ErrEmailTaken
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &User{
		FullName:     req.FullName,
		Email:        req.Email,
		Username:     req.Username,
		PasswordHash: string(hash),
		RoleID:       req.RoleID,
	}

	if err := s.repo.CreateUserTransaction(ctx, user); err != nil {
		s.log.Error("Failed to create user", zap.Error(err))
		return nil, err
	}

	// Fetch complete user for response
	return s.GetUser(ctx, user.ID)
}

func (s *service) UpdateRole(ctx context.Context, id string, req *UpdateRoleRequest) error {
	err := s.repo.UpdateUserRole(ctx, id, req.RoleID)
	if errors.Is(err, ErrUserNotFound) { // Wait sql.ErrNoRows mapped in repo or handler
		return err
	}
	return err
}

func (s *service) UpdateStatus(ctx context.Context, id string, req *UpdateStatusRequest) error {
	return s.repo.UpdateUserStatus(ctx, id, req.IsActive)
}

func (s *service) ResetPassword(ctx context.Context, id string, req *ResetPasswordRequest) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	return s.repo.UpdateUserPassword(ctx, id, string(hash))
}

func (s *service) UpdateProfile(ctx context.Context, id string, req *UpdateProfileRequest) (*UserResponse, error) {
	emailExists, err := s.repo.CheckEmailExistsExcludingUser(ctx, req.Email, id)
	if err != nil {
		return nil, err
	}
	if emailExists {
		return nil, ErrEmailTaken
	}

	if err := s.repo.UpdateUserProfile(ctx, id, req.FullName, req.Email); err != nil {
		s.log.Error("Failed to update user profile", zap.Error(err))
		return nil, err
	}

	return s.GetUser(ctx, id)
}

func (s *service) ChangePassword(ctx context.Context, id string, req *ChangePasswordRequest) error {
	u, err := s.repo.GetUserByID(ctx, id)
	if err != nil {
		return err
	}
	if u == nil {
		return ErrUserNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.OldPassword)); err != nil {
		return errors.New("kata sandi lama tidak sesuai")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.repo.UpdateUserPassword(ctx, id, string(hash))
}

func (s *service) mapEntityToResponse(u *User) *UserResponse {
	return &UserResponse{
		ID:          u.ID,
		FullName:    u.FullName,
		Email:       u.Email,
		Username:    u.Username,
		RoleID:      u.RoleID,
		RoleCode:    u.RoleCode,
		RoleName:    u.RoleName,
		IsActive:    u.IsActive,
		LastLoginAt: u.LastLoginAt,
		CreatedAt:   u.CreatedAt,
		UpdatedAt:   u.UpdatedAt,
	}
}

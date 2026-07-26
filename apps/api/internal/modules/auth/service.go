package auth

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"

	"github.com/trisfproject/muskom/apps/api/platform/config"
)

type Service interface {
	Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error)
}

type service struct {
	repo Repository
	cfg  *config.Config
	log  *zap.Logger
}

// NewService creates a new Auth Service.
func NewService(repo Repository, cfg *config.Config, log *zap.Logger) Service {
	return &service{repo: repo, cfg: cfg, log: log}
}

var (
	ErrInvalidCredentials = errors.New("invalid username or password")
	ErrUserInactive       = errors.New("user account is inactive")
)

func (s *service) Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {
	s.log.Debug("attempting login", zap.String("username", req.Username))

	user, err := s.repo.GetUserByUsername(ctx, req.Username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrInvalidCredentials
		}
		s.log.Error("failed to get user", zap.Error(err))
		return nil, err
	}

	if !user.IsActive {
		return nil, ErrUserInactive
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// Generate JWT
	exp := time.Now().Add(24 * time.Hour)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":      user.ID,
		"username": user.Username,
		"role":     user.RoleCode,
		"exp":      exp.Unix(),
	})

	tokenString, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		s.log.Error("failed to sign token", zap.Error(err))
		return nil, err
	}

	// Async update last login
	go func(id string) {
		bgCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := s.repo.UpdateLastLogin(bgCtx, id); err != nil {
			s.log.Error("failed to update last login", zap.Error(err), zap.String("user_id", id))
		}
	}(user.ID)

	return &LoginResponse{
		AccessToken: tokenString,
		ExpiresAt:   exp.Format(time.RFC3339),
		User: UserData{
			ID:       user.ID,
			FullName: user.FullName,
			Username: user.Username,
			Role:     user.RoleCode,
		},
	}, nil
}

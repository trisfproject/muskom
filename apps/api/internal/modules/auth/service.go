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
	Authenticate(ctx context.Context, username, password string) (*LoginResponse, error)
}

type service struct {
	repo Repository
	cfg  *config.Config
	log  *zap.Logger
}

func NewService(repo Repository, cfg *config.Config, log *zap.Logger) Service {
	return &service{repo: repo, cfg: cfg, log: log}
}

var (
	ErrInvalidCredentials = errors.New("invalid username or password")
	ErrUserInactive       = errors.New("user account is inactive")
)

func (s *service) Authenticate(ctx context.Context, username, password string) (*LoginResponse, error) {
	user, err := s.repo.FindByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	if !user.IsActive {
		return nil, ErrUserInactive
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	exp := time.Now().Add(24 * time.Hour)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":      user.ID,
		"username": user.Username,
		"role":     user.RoleCode,
		"exp":      exp.Unix(),
	})

	tokenString, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return nil, err
	}

	go func(userID string) {
		bgCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = s.repo.UpdateLastLogin(bgCtx, userID, time.Now())
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

package auth

import (
	"context"
	
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"

	"github.com/trisfproject/muskom/apps/api/platform/config"
)

type Service interface {
	Authenticate(ctx context.Context, username, password string) (*LoginResponse, error)
	Refresh(ctx context.Context, refreshToken string) (*RefreshResponse, error)
	Logout(ctx context.Context, userID string) error
}

type service struct {
	repo  Repository
	redis *redis.Client
	cfg   *config.Config
	log   *zap.Logger
}

func NewService(repo Repository, rdb *redis.Client, cfg *config.Config, log *zap.Logger) Service {
	return &service{repo: repo, redis: rdb, cfg: cfg, log: log}
}

var (
	ErrInvalidCredentials = errors.New("invalid username or password")
	ErrUserInactive       = errors.New("user account is inactive")
	ErrInvalidToken       = errors.New("invalid or expired refresh token")
)

func (s *service) generateTokens(user *AuthUser) (string, string, string, error) {
	// 1. Access Token
	exp := time.Now().Add(24 * time.Hour)
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":      user.ID,
		"username": user.Username,
		"role":     user.RoleCode,
		"exp":      exp.Unix(),
	})
	accessTokenString, err := accessToken.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return "", "", "", err
	}

	// 2. Refresh Token
	refreshExp := time.Now().Add(s.cfg.JWTRefreshTTL)
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":      user.ID,
		"username": user.Username,
		"exp":      refreshExp.Unix(),
	})
	refreshTokenString, err := refreshToken.SignedString([]byte(s.cfg.JWTRefreshSecret))
	if err != nil {
		return "", "", "", err
	}

	return accessTokenString, refreshTokenString, exp.Format(time.RFC3339), nil
}

func (s *service) Authenticate(ctx context.Context, username, password string) (*LoginResponse, error) {
	users, err := s.repo.FindAllByUsernameOrEmail(ctx, username)
	if err != nil {
		return nil, err
	}
	if len(users) == 0 {
		return nil, ErrInvalidCredentials
	}

	var matchedUser *AuthUser
	var hasInactive bool

	for _, user := range users {
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err == nil {
			if !user.IsActive {
				hasInactive = true
				continue
			}
			matchedUser = user
			break
		}
	}

	if matchedUser == nil {
		if hasInactive {
			return nil, ErrUserInactive
		}
		return nil, ErrInvalidCredentials
	}

	accessToken, refreshToken, expiresAt, err := s.generateTokens(matchedUser)
	if err != nil {
		return nil, err
	}

	// Store Refresh Token in Redis
	redisKey := fmt.Sprintf("muskom:refresh:%s", matchedUser.ID)
	if err := s.redis.Set(ctx, redisKey, refreshToken, s.cfg.JWTRefreshTTL).Err(); err != nil {
		s.log.Error("Failed to store refresh token in Redis", zap.Error(err))
		return nil, err
	}

	go func(userID string) {
		bgCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = s.repo.UpdateLastLogin(bgCtx, userID, time.Now())
	}(matchedUser.ID)

	return &LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
		User: UserData{
			ID:       matchedUser.ID,
			FullName: matchedUser.FullName,
			Username: matchedUser.Username,
			Role:     matchedUser.RoleCode,
		},
	}, nil
}

func (s *service) Refresh(ctx context.Context, refreshTokenString string) (*RefreshResponse, error) {
	// 1. Parse and validate Refresh Token JWT
	token, err := jwt.Parse(refreshTokenString, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(s.cfg.JWTRefreshSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, ErrInvalidToken
	}

	userID, ok := claims["sub"].(string)
	if !ok {
		return nil, ErrInvalidToken
	}

	username, ok := claims["username"].(string)
	if !ok {
		return nil, ErrInvalidToken
	}

	// 2. Validate against Redis
	redisKey := fmt.Sprintf("muskom:refresh:%s", userID)
	storedToken, err := s.redis.Get(ctx, redisKey).Result()
	if err != nil || storedToken != refreshTokenString {
		return nil, ErrInvalidToken
	}

	// 3. Verify user is still active
	users, err := s.repo.FindAllByUsernameOrEmail(ctx, username)
	if err != nil || len(users) == 0 {
		_ = s.redis.Del(ctx, redisKey) // revoke on failure
		return nil, ErrUserInactive
	}

	var matchedUser *AuthUser
	for _, u := range users {
		if u.Username == username && u.IsActive {
			matchedUser = u
			break
		}
	}
	if matchedUser == nil {
		_ = s.redis.Del(ctx, redisKey) // revoke on failure
		return nil, ErrUserInactive
	}

	// 4. Generate new tokens
	accessToken, newRefreshToken, expiresAt, err := s.generateTokens(matchedUser)
	if err != nil {
		return nil, err
	}

	// 5. Rotate Refresh Token in Redis
	if err := s.redis.Set(ctx, redisKey, newRefreshToken, s.cfg.JWTRefreshTTL).Err(); err != nil {
		s.log.Error("Failed to rotate refresh token in Redis", zap.Error(err))
		return nil, err
	}

	return &RefreshResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresAt:    expiresAt,
	}, nil
}

func (s *service) Logout(ctx context.Context, userID string) error {
	redisKey := fmt.Sprintf("muskom:refresh:%s", userID)
	if err := s.redis.Del(ctx, redisKey).Err(); err != nil {
		s.log.Error("Failed to delete refresh token from Redis during logout", zap.String("user_id", userID), zap.Error(err))
		return err
	}
	s.log.Info("Administrator logged out successfully", zap.String("user_id", userID))
	return nil
}

package auth

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/go-redis/redismock/v9"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.uber.org/zap/zaptest"
	"golang.org/x/crypto/bcrypt"

	"github.com/trisfproject/muskom/apps/api/platform/config"
)

func TestService_Authenticate(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	mockRepo := new(MockRepository)
	rdb, rmock := redismock.NewClientMock()
	cfg := &config.Config{
		JWTSecret:        "secret",
		JWTRefreshSecret: "refresh_secret",
		JWTRefreshTTL:    24 * time.Hour,
	}

	svc := NewService(mockRepo, rdb, cfg, log)

	t.Run("Success", func(t *testing.T) {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		user := &AuthUser{
			ID:           "usr1",
			Username:     "admin",
			PasswordHash: string(hash),
			IsActive:     true,
			RoleCode:     "ADMIN",
		}

		mockRepo.On("FindByUsername", mock.Anything, "admin").Return(user, nil).Once()
		mockRepo.On("UpdateLastLogin", mock.Anything, "usr1", mock.Anything).Return(nil).Once()

		rmock.Regexp().ExpectSet("muskom:refresh:usr1", `.*`, cfg.JWTRefreshTTL).SetVal("OK")

		res, err := svc.Authenticate(ctx, "admin", "password123")
		assert.NoError(t, err)
		assert.NotNil(t, res)
		assert.NotEmpty(t, res.AccessToken)
		assert.NotEmpty(t, res.RefreshToken)
		assert.Equal(t, "usr1", res.User.ID)
	})

	t.Run("Invalid Username", func(t *testing.T) {
		mockRepo.On("FindByUsername", mock.Anything, "invalid").Return(nil, sql.ErrNoRows).Once()
		res, err := svc.Authenticate(ctx, "invalid", "password123")
		assert.ErrorIs(t, err, ErrInvalidCredentials)
		assert.Nil(t, res)
	})

	t.Run("Invalid Password", func(t *testing.T) {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		user := &AuthUser{
			Username:     "admin",
			PasswordHash: string(hash),
			IsActive:     true,
		}

		mockRepo.On("FindByUsername", mock.Anything, "admin").Return(user, nil).Once()
		res, err := svc.Authenticate(ctx, "admin", "wrong")
		assert.ErrorIs(t, err, ErrInvalidCredentials)
		assert.Nil(t, res)
	})

	t.Run("Inactive User", func(t *testing.T) {
		user := &AuthUser{
			Username: "admin",
			IsActive: false,
		}

		mockRepo.On("FindByUsername", mock.Anything, "admin").Return(user, nil).Once()
		res, err := svc.Authenticate(ctx, "admin", "password123")
		assert.ErrorIs(t, err, ErrUserInactive)
		assert.Nil(t, res)
	})
}

func TestService_Logout(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	mockRepo := new(MockRepository)
	rdb, rmock := redismock.NewClientMock()
	cfg := &config.Config{}

	svc := NewService(mockRepo, rdb, cfg, log)

	t.Run("Success", func(t *testing.T) {
		rmock.ExpectDel("muskom:refresh:usr1").SetVal(1)
		err := svc.Logout(ctx, "usr1")
		assert.NoError(t, err)
	})
}

func TestService_Refresh(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	mockRepo := new(MockRepository)
	rdb, rmock := redismock.NewClientMock()
	cfg := &config.Config{
		JWTSecret:        "secret",
		JWTRefreshSecret: "refresh_secret",
		JWTRefreshTTL:    24 * time.Hour,
	}

	svc := NewService(mockRepo, rdb, cfg, log)

	t.Run("Success", func(t *testing.T) {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub":      "usr1",
			"username": "admin",
			"exp":      time.Now().Add(1 * time.Hour).Unix(),
		})
		tokenString, _ := token.SignedString([]byte("refresh_secret"))

		rmock.ExpectGet("muskom:refresh:usr1").SetVal(tokenString)

		user := &AuthUser{
			ID:       "usr1",
			Username: "admin",
			IsActive: true,
			RoleCode: "ADMIN",
		}
		mockRepo.On("FindByUsername", mock.Anything, "admin").Return(user, nil).Once()

		rmock.Regexp().ExpectSet("muskom:refresh:usr1", `.*`, cfg.JWTRefreshTTL).SetVal("OK")

		res, err := svc.Refresh(ctx, tokenString)
		assert.NoError(t, err)
		assert.NotNil(t, res)
		assert.NotEmpty(t, res.AccessToken)
		assert.NotEmpty(t, res.RefreshToken)
	})

	t.Run("Invalid Token Signature", func(t *testing.T) {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub":      "usr1",
			"username": "admin",
			"exp":      time.Now().Add(1 * time.Hour).Unix(),
		})
		tokenString, _ := token.SignedString([]byte("wrong_secret"))

		res, err := svc.Refresh(ctx, tokenString)
		assert.ErrorIs(t, err, ErrInvalidToken)
		assert.Nil(t, res)
	})

	t.Run("Token Not In Redis", func(t *testing.T) {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub":      "usr1",
			"username": "admin",
			"exp":      time.Now().Add(1 * time.Hour).Unix(),
		})
		tokenString, _ := token.SignedString([]byte("refresh_secret"))

		rmock.ExpectGet("muskom:refresh:usr1").RedisNil()

		res, err := svc.Refresh(ctx, tokenString)
		assert.ErrorIs(t, err, ErrInvalidToken)
		assert.Nil(t, res)
	})

	t.Run("User Inactive", func(t *testing.T) {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub":      "usr1",
			"username": "admin",
			"exp":      time.Now().Add(1 * time.Hour).Unix(),
		})
		tokenString, _ := token.SignedString([]byte("refresh_secret"))

		rmock.ExpectGet("muskom:refresh:usr1").SetVal(tokenString)

		user := &AuthUser{
			ID:       "usr1",
			Username: "admin",
			IsActive: false,
		}
		mockRepo.On("FindByUsername", mock.Anything, "admin").Return(user, nil).Once()
		rmock.ExpectDel("muskom:refresh:usr1").SetVal(1)

		res, err := svc.Refresh(ctx, tokenString)
		assert.ErrorIs(t, err, ErrUserInactive)
		assert.Nil(t, res)
	})
}

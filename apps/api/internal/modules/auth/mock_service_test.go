package auth

import (
	"context"

	"github.com/stretchr/testify/mock"
)

type MockService struct {
	mock.Mock
}

func (m *MockService) Authenticate(ctx context.Context, username, password string) (*LoginResponse, error) {
	args := m.Called(ctx, username, password)
	if args.Get(0) != nil {
		return args.Get(0).(*LoginResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) Refresh(ctx context.Context, refreshToken string) (*RefreshResponse, error) {
	args := m.Called(ctx, refreshToken)
	if args.Get(0) != nil {
		return args.Get(0).(*RefreshResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) Logout(ctx context.Context, userID string) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

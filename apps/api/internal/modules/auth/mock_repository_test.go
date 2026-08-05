package auth

import (
	"context"
	"time"

	"github.com/stretchr/testify/mock"
)

type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) FindAllByUsernameOrEmail(ctx context.Context, username string) ([]*AuthUser, error) {
	args := m.Called(ctx, username)
	if args.Get(0) != nil {
		return args.Get(0).([]*AuthUser), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) UpdateLastLogin(ctx context.Context, userID string, loginAt time.Time) error {
	args := m.Called(ctx, userID, loginAt)
	return args.Error(0)
}

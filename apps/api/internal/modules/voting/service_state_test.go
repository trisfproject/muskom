package voting

import (
	"context"
	"testing"

	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"go.uber.org/zap"
)

func TestService_UpdateSessionStatus(t *testing.T) {
	sqlxDB := sqlx.NewDb(nil, "sqlmock")
	repo := new(MockRepository)
	svc := NewService(sqlxDB, repo, nil, zap.NewNop(), nil, &config.Config{})
	ctx := context.Background()

	t.Run("start allowed from NOT_STARTED", func(t *testing.T) {
		repo.On("GetSessionStatus", ctx).Return(SessionNotStarted, nil).Once()
		repo.On("UpdateSessionStatus", ctx, SessionRunning).Return(nil).Once()
		_, err := svc.UpdateSessionStatus(ctx, "evt-1", "start")
		assert.NoError(t, err)
		repo.AssertExpectations(t)
	})

	t.Run("start rejected from RUNNING", func(t *testing.T) {
		repo.On("GetSessionStatus", ctx).Return(SessionRunning, nil).Once()
		_, err := svc.UpdateSessionStatus(ctx, "evt-1", "start")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "cannot start session")
		repo.AssertExpectations(t)
	})
	
	t.Run("pause allowed from RUNNING", func(t *testing.T) {
		repo.On("GetSessionStatus", ctx).Return(SessionRunning, nil).Once()
		repo.On("UpdateSessionStatus", ctx, SessionPaused).Return(nil).Once()
		_, err := svc.UpdateSessionStatus(ctx, "evt-1", "pause")
		assert.NoError(t, err)
		repo.AssertExpectations(t)
	})
	
	t.Run("resume allowed from PAUSED", func(t *testing.T) {
		repo.On("GetSessionStatus", ctx).Return(SessionPaused, nil).Once()
		repo.On("UpdateSessionStatus", ctx, SessionRunning).Return(nil).Once()
		_, err := svc.UpdateSessionStatus(ctx, "evt-1", "resume")
		assert.NoError(t, err)
		repo.AssertExpectations(t)
	})
	
	t.Run("close rejected from NOT_STARTED", func(t *testing.T) {
		repo.On("GetSessionStatus", ctx).Return(SessionNotStarted, nil).Once()
		_, err := svc.UpdateSessionStatus(ctx, "evt-1", "close")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "cannot close session")
		repo.AssertExpectations(t)
	})
}

package announcement

import (
	"context"
	"errors"
	"testing"
	"time"

	"go.uber.org/zap"
)

type mockRepo struct {
	Repository
	getPendingBroadcastJobsFunc func(ctx context.Context) ([]BroadcastJob, error)
	updateBroadcastJobFunc      func(ctx context.Context, job *BroadcastJob) error
	getAnnouncementByIDFunc     func(ctx context.Context, id string) (*Announcement, error)
}

func (m *mockRepo) GetPendingBroadcastJobs(ctx context.Context) ([]BroadcastJob, error) {
	if m.getPendingBroadcastJobsFunc != nil {
		return m.getPendingBroadcastJobsFunc(ctx)
	}
	return []BroadcastJob{}, nil
}

func (m *mockRepo) UpdateBroadcastJob(ctx context.Context, job *BroadcastJob) error {
	if m.updateBroadcastJobFunc != nil {
		return m.updateBroadcastJobFunc(ctx, job)
	}
	return nil
}

func (m *mockRepo) GetAnnouncementByID(ctx context.Context, id string) (*Announcement, error) {
	if m.getAnnouncementByIDFunc != nil {
		return m.getAnnouncementByIDFunc(ctx, id)
	}
	return nil, nil
}

func TestWorker_ProcessPendingJobs_Empty(t *testing.T) {
	repo := &mockRepo{
		getPendingBroadcastJobsFunc: func(ctx context.Context) ([]BroadcastJob, error) {
			return []BroadcastJob{}, nil
		},
	}

	worker := NewWorker(repo, nil, nil, zap.NewNop())
	worker.processPendingJobs(context.Background())
}

func TestWorker_ProcessPendingJobs_TableNotExist(t *testing.T) {
	repo := &mockRepo{
		getPendingBroadcastJobsFunc: func(ctx context.Context) ([]BroadcastJob, error) {
			return nil, errors.New("relation \"broadcast_jobs\" does not exist (SQLSTATE 42P01)")
		},
	}

	worker := NewWorker(repo, nil, nil, zap.NewNop())
	// Should not panic or crash
	worker.processPendingJobs(context.Background())
}

func TestWorker_Start_GracefulExitWhenTableMissing(t *testing.T) {
	repo := &mockRepo{
		getPendingBroadcastJobsFunc: func(ctx context.Context) ([]BroadcastJob, error) {
			return nil, errors.New("relation \"broadcast_jobs\" does not exist (SQLSTATE 42P01)")
		},
	}

	worker := NewWorker(repo, nil, nil, zap.NewNop())
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()

	// Should exit immediately without hanging
	worker.Start(ctx)
}

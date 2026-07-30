package result

import (
	"context"
	"database/sql"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

func TestService_GetElectionResults(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()
	sqlxDB := sqlx.NewDb(db, "postgres")

	mockRepo := new(MockRepository)
	logger, _ := zap.NewDevelopment()
	svc := NewService(mockRepo, sqlxDB, logger)
	ctx := context.Background()
	eventID := uuid.New()

	t.Run("Empty event", func(t *testing.T) {
		mock.ExpectQuery("^SELECT 1 FROM events WHERE id = \\$1$").WithArgs(eventID).WillReturnError(sql.ErrNoRows)

		res, err := svc.GetElectionResults(ctx, eventID)
		assert.Error(t, err)
		assert.Nil(t, res)
		assert.Equal(t, ErrEventNotFound, err)
	})

	t.Run("Valid event, success", func(t *testing.T) {
		mock.ExpectQuery("^SELECT 1 FROM events WHERE id = \\$1$").WithArgs(eventID).WillReturnRows(sqlmock.NewRows([]string{"1"}).AddRow(1))

		expectedRes := &ElectionResultResponse{
			EventID:    eventID,
			TotalVotes: 10,
			ValidVotes: 10,
			Candidates: []CandidateResult{
				{CandidateName: "A", VoteCount: 10, Percentage: 100},
			},
		}
		mockRepo.On("GetElectionResults", ctx, eventID).Return(expectedRes, nil)

		res, err := svc.GetElectionResults(ctx, eventID)
		assert.NoError(t, err)
		assert.Equal(t, expectedRes, res)

		mockRepo.AssertExpectations(t)
	})
}

package result

import (
	"context"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"time"
)

func TestRepository_GetElectionResults(t *testing.T) {
	eventID := uuid.New()
	ctx := context.Background()

	t.Run("Single candidate winner", func(t *testing.T) {
		db, mock, err := sqlmock.New()
		assert.NoError(t, err)
		defer db.Close()
		sqlxDB := sqlx.NewDb(db, "postgres")
		repo := NewRepository(sqlxDB)

		// Mock event info
		mock.ExpectQuery("^SELECT name FROM events WHERE id = \\$1$").
			WithArgs(eventID).
			WillReturnRows(sqlmock.NewRows([]string{"name"}).AddRow("Test Event"))

		// Mock total votes
		mock.ExpectQuery("^SELECT COUNT\\(id\\) FROM votes$").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(100))

		// Mock stats per candidate
		c1 := uuid.New()
		rows := sqlmock.NewRows([]string{"candidate_id", "candidate_name", "vote_count"}).
			AddRow(c1, "Alice", 100)

		mock.ExpectQuery("^SELECT c.id as candidate_id").
			WillReturnRows(rows)

		res, err := repo.GetElectionResults(ctx, eventID)
		assert.NoError(t, err)
		assert.NotNil(t, res)
		assert.Equal(t, 100, res.TotalVotes)
		assert.Equal(t, c1, *res.WinnerID)
		assert.Equal(t, "Alice", res.WinnerName)
		assert.False(t, res.IsTie)
		assert.Len(t, res.Candidates, 1)
		assert.Equal(t, 100.0, res.Candidates[0].Percentage)
		assert.Nil(t, res.TiedCandidates)
	})

	t.Run("Multiple candidates winner", func(t *testing.T) {
		db, mock, err := sqlmock.New()
		assert.NoError(t, err)
		defer db.Close()
		sqlxDB := sqlx.NewDb(db, "postgres")
		repo := NewRepository(sqlxDB)

		// Mock event info
		mock.ExpectQuery("^SELECT name FROM events WHERE id = \\$1$").
			WithArgs(eventID).
			WillReturnRows(sqlmock.NewRows([]string{"name"}).AddRow("Test Event"))

		// Mock total votes
		mock.ExpectQuery("^SELECT COUNT\\(id\\) FROM votes$").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(150))

		// Mock stats per candidate
		c1 := uuid.New()
		c2 := uuid.New()
		rows := sqlmock.NewRows([]string{"candidate_id", "candidate_name", "vote_count"}).
			AddRow(c1, "Alice", 100).
			AddRow(c2, "Bob", 50)

		mock.ExpectQuery("^SELECT c.id as candidate_id").
			WillReturnRows(rows)

		res, err := repo.GetElectionResults(ctx, eventID)
		assert.NoError(t, err)
		assert.NotNil(t, res)
		assert.Equal(t, 150, res.TotalVotes)
		assert.Equal(t, c1, *res.WinnerID)
		assert.Equal(t, "Alice", res.WinnerName)
		assert.False(t, res.IsTie)
		assert.Len(t, res.Candidates, 2)
		assert.InDelta(t, 66.66, res.Candidates[0].Percentage, 0.01)
		assert.InDelta(t, 33.33, res.Candidates[1].Percentage, 0.01)
	})

	t.Run("Tie", func(t *testing.T) {
		db, mock, err := sqlmock.New()
		assert.NoError(t, err)
		defer db.Close()
		sqlxDB := sqlx.NewDb(db, "postgres")
		repo := NewRepository(sqlxDB)

		// Mock event info
		mock.ExpectQuery("^SELECT name FROM events WHERE id = \\$1$").
			WithArgs(eventID).
			WillReturnRows(sqlmock.NewRows([]string{"name"}).AddRow("Test Event"))

		// Mock total votes
		mock.ExpectQuery("^SELECT COUNT\\(id\\) FROM votes$").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(100))

		// Mock stats per candidate
		c1 := uuid.New()
		c2 := uuid.New()
		rows := sqlmock.NewRows([]string{"candidate_id", "candidate_name", "vote_count"}).
			AddRow(c1, "Alice", 50).
			AddRow(c2, "Bob", 50)

		mock.ExpectQuery("^SELECT c.id as candidate_id").
			WillReturnRows(rows)

		res, err := repo.GetElectionResults(ctx, eventID)
		assert.NoError(t, err)
		assert.NotNil(t, res)
		assert.Equal(t, 100, res.TotalVotes)
		assert.True(t, res.IsTie)
		assert.Nil(t, res.WinnerID)
		assert.Equal(t, "", res.WinnerName)
		assert.Len(t, res.Candidates, 2)
		assert.Len(t, res.TiedCandidates, 2)
	})

	t.Run("Large dataset simulation (mocked)", func(t *testing.T) {
		db, mock, err := sqlmock.New()
		assert.NoError(t, err)
		defer db.Close()
		sqlxDB := sqlx.NewDb(db, "postgres")
		repo := NewRepository(sqlxDB)

		// Mock event info
		mock.ExpectQuery("^SELECT name FROM events WHERE id = \\$1$").
			WithArgs(eventID).
			WillReturnRows(sqlmock.NewRows([]string{"name"}).AddRow("Test Event"))

		// Mock total votes - massive volume
		mock.ExpectQuery("^SELECT COUNT\\(id\\) FROM votes$").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(500000))

		// Mock stats per candidate (the database handles the aggregation, so the app only gets summary rows)
		c1 := uuid.New()
		c2 := uuid.New()
		c3 := uuid.New()
		c4 := uuid.New()
		c5 := uuid.New()

		rows := sqlmock.NewRows([]string{"candidate_id", "candidate_name", "vote_count"}).
			AddRow(c1, "Candidate 1", 200000).
			AddRow(c2, "Candidate 2", 150000).
			AddRow(c3, "Candidate 3", 100000).
			AddRow(c4, "Candidate 4", 50000).
			AddRow(c5, "Candidate 5", 0) // Testing 0 votes edge case

		mock.ExpectQuery("^SELECT c.id as candidate_id").
			WillReturnRows(rows)

		res, err := repo.GetElectionResults(ctx, eventID)
		assert.NoError(t, err)
		assert.NotNil(t, res)
		assert.Equal(t, 500000, res.TotalVotes)
		assert.Equal(t, c1, *res.WinnerID)
		assert.Len(t, res.Candidates, 5)
		assert.Equal(t, 40.0, res.Candidates[0].Percentage)
		assert.Equal(t, 0.0, res.Candidates[4].Percentage)
	})
}

func TestRepository_GetElectionOverview(t *testing.T) {
	eventID := uuid.New()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		db, mock, err := sqlmock.New()
		assert.NoError(t, err)
		defer db.Close()
		sqlxDB := sqlx.NewDb(db, "postgres")
		repo := NewRepository(sqlxDB)

		mock.ExpectQuery("^SELECT COUNT\\(id\\) FROM participants").WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(100))
		mock.ExpectQuery("^SELECT COUNT\\(a\\.id\\) FROM attendance").WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(80))
		mock.ExpectQuery("^SELECT COUNT\\(id\\) FROM votes").WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(60))

		res, err := repo.GetElectionOverview(ctx, eventID)
		assert.NoError(t, err)
		assert.Equal(t, 100, res.TotalEligible)
		assert.Equal(t, 80, res.TotalCheckedIn)
		assert.Equal(t, 60, res.TotalVotes)
		assert.Equal(t, 60.0, res.Participation)
	})
}

func TestRepository_GetAuditLogs(t *testing.T) {
	eventID := uuid.New()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		db, mock, err := sqlmock.New()
		assert.NoError(t, err)
		defer db.Close()
		sqlxDB := sqlx.NewDb(db, "postgres")
		repo := NewRepository(sqlxDB)

		mock.ExpectQuery("^SELECT COUNT\\(id\\) FROM audit_logs").WithArgs(eventID).WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		rows := sqlmock.NewRows([]string{"id", "user_id", "action", "ip_address", "metadata", "created_at"}).
			AddRow(uuid.New(), uuid.New(), "ACT", "ip", "meta", time.Now())
		mock.ExpectQuery("^SELECT (.+) FROM audit_logs").WillReturnRows(rows)

		logs, total, err := repo.GetAuditLogs(ctx, eventID, AdminListAuditRequest{})
		assert.NoError(t, err)
		assert.Equal(t, 1, total)
		assert.Len(t, logs, 1)
	})
}

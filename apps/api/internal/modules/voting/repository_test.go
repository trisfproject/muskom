package voting

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
)

func setupTestDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock, Repository) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	return db, mock, repo
}

func TestRepository_GetParticipantRegistration(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	uID := uuid.New()
	eID := uuid.New()
	rID := uuid.New()

	t.Run("Success", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"id"}).AddRow(rID)
		mock.ExpectQuery("^SELECT r.id FROM registrations r").WithArgs(uID, eID).WillReturnRows(rows)

		id, err := repo.GetParticipantRegistration(ctx, uID, eID)
		assert.NoError(t, err)
		assert.Equal(t, rID, id)
	})

	t.Run("NotFound", func(t *testing.T) {
		mock.ExpectQuery("^SELECT r.id FROM registrations r").WithArgs(uID, eID).WillReturnError(sql.ErrNoRows)

		id, err := repo.GetParticipantRegistration(ctx, uID, eID)
		assert.ErrorIs(t, err, ErrParticipantNotFound)
		assert.Equal(t, uuid.Nil, id)
	})
	
	t.Run("DBError", func(t *testing.T) {
		mock.ExpectQuery("^SELECT r.id FROM registrations r").WithArgs(uID, eID).WillReturnError(sql.ErrConnDone)

		id, err := repo.GetParticipantRegistration(ctx, uID, eID)
		assert.Error(t, err)
		assert.Equal(t, uuid.Nil, id)
	})
}

func TestRepository_CheckEventPhase(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	eID := uuid.New()

	t.Run("Success_Active", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"is_active"}).AddRow(true)
		mock.ExpectQuery("^SELECT is_active FROM event_phases").WithArgs(eID, "VOTING").WillReturnRows(rows)

		active, err := repo.CheckEventPhase(ctx, eID, "VOTING")
		assert.NoError(t, err)
		assert.True(t, active)
	})
	
	t.Run("Success_NoRows", func(t *testing.T) {
		mock.ExpectQuery("^SELECT is_active FROM event_phases").WithArgs(eID, "VOTING").WillReturnError(sql.ErrNoRows)

		active, err := repo.CheckEventPhase(ctx, eID, "VOTING")
		assert.NoError(t, err)
		assert.False(t, active)
	})
	
	t.Run("DBError", func(t *testing.T) {
		mock.ExpectQuery("^SELECT is_active FROM event_phases").WithArgs(eID, "VOTING").WillReturnError(sql.ErrConnDone)

		active, err := repo.CheckEventPhase(ctx, eID, "VOTING")
		assert.Error(t, err)
		assert.False(t, active)
	})
}

func TestRepository_CheckAttendance(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	rID := uuid.New()

	t.Run("Success", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"1"}).AddRow(1)
		mock.ExpectQuery("^SELECT 1 FROM attendance").WithArgs(rID).WillReturnRows(rows)

		exists, err := repo.CheckAttendance(ctx, rID)
		assert.NoError(t, err)
		assert.True(t, exists)
	})

	t.Run("NoRows", func(t *testing.T) {
		mock.ExpectQuery("^SELECT 1 FROM attendance").WithArgs(rID).WillReturnError(sql.ErrNoRows)

		exists, err := repo.CheckAttendance(ctx, rID)
		assert.NoError(t, err)
		assert.False(t, exists)
	})
	
	t.Run("DBError", func(t *testing.T) {
		mock.ExpectQuery("^SELECT 1 FROM attendance").WithArgs(rID).WillReturnError(sql.ErrConnDone)

		exists, err := repo.CheckAttendance(ctx, rID)
		assert.Error(t, err)
		assert.False(t, exists)
	})
}

func TestRepository_CheckCandidateEligibility(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	cID := uuid.New()
	eID := uuid.New()

	t.Run("Success", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"1"}).AddRow(1)
		mock.ExpectQuery("^SELECT 1 FROM candidates").WithArgs(cID, eID).WillReturnRows(rows)

		exists, err := repo.CheckCandidateEligibility(ctx, cID, eID)
		assert.NoError(t, err)
		assert.True(t, exists)
	})

	t.Run("NoRows", func(t *testing.T) {
		mock.ExpectQuery("^SELECT 1 FROM candidates").WithArgs(cID, eID).WillReturnError(sql.ErrNoRows)

		exists, err := repo.CheckCandidateEligibility(ctx, cID, eID)
		assert.NoError(t, err)
		assert.False(t, exists)
	})
	
	t.Run("DBError", func(t *testing.T) {
		mock.ExpectQuery("^SELECT 1 FROM candidates").WithArgs(cID, eID).WillReturnError(sql.ErrConnDone)

		exists, err := repo.CheckCandidateEligibility(ctx, cID, eID)
		assert.Error(t, err)
		assert.False(t, exists)
	})
}

func TestRepository_GetMyVoteStatus(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	rID := uuid.New()
	eID := uuid.New()

	t.Run("Success", func(t *testing.T) {
		now := time.Now()
		rows := sqlmock.NewRows([]string{"created_at"}).AddRow(now)
		mock.ExpectQuery("^SELECT created_at FROM votes").WithArgs(rID, eID).WillReturnRows(rows)

		status, err := repo.GetMyVoteStatus(ctx, rID, eID)
		assert.NoError(t, err)
		assert.True(t, status.HasVoted)
		assert.Equal(t, now, *status.VotedAt)
	})

	t.Run("NotVoted", func(t *testing.T) {
		mock.ExpectQuery("^SELECT created_at FROM votes").WithArgs(rID, eID).WillReturnError(sql.ErrNoRows)

		status, err := repo.GetMyVoteStatus(ctx, rID, eID)
		assert.NoError(t, err)
		assert.False(t, status.HasVoted)
		assert.Nil(t, status.VotedAt)
	})
	
	t.Run("DBError", func(t *testing.T) {
		mock.ExpectQuery("^SELECT created_at FROM votes").WithArgs(rID, eID).WillReturnError(sql.ErrConnDone)

		status, err := repo.GetMyVoteStatus(ctx, rID, eID)
		assert.Error(t, err)
		assert.Nil(t, status)
	})
}

func TestRepository_SubmitVote(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	eID := uuid.New()
	rID := uuid.New()
	cID := uuid.New()
	uID := uuid.New()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectBegin()
		mock.ExpectExec("^INSERT INTO votes").WithArgs(eID, rID, cID).WillReturnResult(sqlmock.NewResult(1, 1))
		
		actorRows := sqlmock.NewRows([]string{"id"}).AddRow(uID)
		mock.ExpectQuery("^SELECT u.id FROM users u").WithArgs(rID).WillReturnRows(actorRows)
		
		mock.ExpectExec("^INSERT INTO audit_logs").WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		err := repo.SubmitVote(ctx, eID, rID, cID, "meta")
		assert.NoError(t, err)
	})

	t.Run("BeginTxError", func(t *testing.T) {
		mock.ExpectBegin().WillReturnError(sql.ErrConnDone)

		err := repo.SubmitVote(ctx, eID, rID, cID, "meta")
		assert.Error(t, err)
	})

	t.Run("InsertVoteError", func(t *testing.T) {
		mock.ExpectBegin()
		mock.ExpectExec("^INSERT INTO votes").WithArgs(eID, rID, cID).WillReturnError(sql.ErrConnDone)
		mock.ExpectRollback()

		err := repo.SubmitVote(ctx, eID, rID, cID, "meta")
		assert.Error(t, err)
	})
}

func TestRepository_AdminListVotes(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	eID := uuid.New()
	cID := uuid.New()
	rID := uuid.New()

	t.Run("Success_Filters", func(t *testing.T) {
		countRows := sqlmock.NewRows([]string{"count"}).AddRow(1)
		mock.ExpectQuery("^SELECT COUNT\\(v.id\\) FROM votes v").WithArgs(eID, cID, rID).WillReturnRows(countRows)

		now := time.Now()
		rows := sqlmock.NewRows([]string{
			"id", "event_id", "registration_id", "candidate_id", "created_at", "participant_name", "candidate_name",
		}).AddRow(uuid.New(), eID, rID, cID, now, "Participant 1", "Candidate 1")

		mock.ExpectQuery("^SELECT (.+) FROM votes v").WithArgs(eID, cID, rID, 10, 0).WillReturnRows(rows)

		req := AdminListVotesRequest{
			EventID:        &eID,
			CandidateID:    &cID,
			RegistrationID: &rID,
			SortBy:         "candidate",
			SortOrder:      "ASC",
		}
		list, total, err := repo.AdminListVotes(ctx, req)
		assert.NoError(t, err)
		assert.Equal(t, 1, total)
		assert.Len(t, list, 1)
	})

	t.Run("EmptyCount", func(t *testing.T) {
		countRows := sqlmock.NewRows([]string{"count"}).AddRow(0)
		mock.ExpectQuery("^SELECT COUNT\\(v.id\\) FROM votes v").WillReturnRows(countRows)

		req := AdminListVotesRequest{}
		list, total, err := repo.AdminListVotes(ctx, req)
		assert.NoError(t, err)
		assert.Equal(t, 0, total)
		assert.Len(t, list, 0)
	})

	t.Run("CountError", func(t *testing.T) {
		mock.ExpectQuery("^SELECT COUNT\\(v.id\\) FROM votes v").WillReturnError(sql.ErrConnDone)

		req := AdminListVotesRequest{}
		list, total, err := repo.AdminListVotes(ctx, req)
		assert.Error(t, err)
		assert.Equal(t, 0, total)
		assert.Nil(t, list)
	})
	
	t.Run("DataError", func(t *testing.T) {
		countRows := sqlmock.NewRows([]string{"count"}).AddRow(1)
		mock.ExpectQuery("^SELECT COUNT\\(v.id\\) FROM votes v").WillReturnRows(countRows)

		mock.ExpectQuery("^SELECT (.+) FROM votes v").WillReturnError(sql.ErrConnDone)

		req := AdminListVotesRequest{
			SortBy: "registration",
		}
		list, total, err := repo.AdminListVotes(ctx, req)
		assert.Error(t, err)
		assert.Equal(t, 0, total)
		assert.Nil(t, list)
	})
}

func TestRepository_AdminGetVote(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	vID := uuid.New()

	t.Run("Success", func(t *testing.T) {
		now := time.Now()
		rows := sqlmock.NewRows([]string{
			"id", "event_id", "registration_id", "candidate_id", "created_at", "participant_name", "candidate_name",
		}).AddRow(vID, uuid.New(), uuid.New(), uuid.New(), now, "Part", "Cand")

		mock.ExpectQuery("^SELECT (.+) FROM votes v").WithArgs(vID).WillReturnRows(rows)

		vote, err := repo.AdminGetVote(ctx, vID)
		assert.NoError(t, err)
		assert.NotNil(t, vote)
	})

	t.Run("NotFound", func(t *testing.T) {
		mock.ExpectQuery("^SELECT (.+) FROM votes v").WithArgs(vID).WillReturnError(sql.ErrNoRows)

		vote, err := repo.AdminGetVote(ctx, vID)
		assert.Error(t, err)
		assert.Nil(t, vote)
		assert.Equal(t, "vote not found", err.Error())
	})
	
	t.Run("DBError", func(t *testing.T) {
		mock.ExpectQuery("^SELECT (.+) FROM votes v").WithArgs(vID).WillReturnError(sql.ErrConnDone)

		vote, err := repo.AdminGetVote(ctx, vID)
		assert.Error(t, err)
		assert.Nil(t, vote)
	})
}

func TestRepository_AdminGetVoteStatistics(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	eID := uuid.New()

	t.Run("Success", func(t *testing.T) {
		countRows := sqlmock.NewRows([]string{"count"}).AddRow(100)
		mock.ExpectQuery("^SELECT COUNT\\(id\\) FROM votes").WithArgs(eID).WillReturnRows(countRows)

		statRows := sqlmock.NewRows([]string{"candidate_id", "candidate_name", "vote_count"}).
			AddRow(uuid.New(), "Cand 1", 60).
			AddRow(uuid.New(), "Cand 2", 40)
		mock.ExpectQuery("^SELECT (.+) FROM candidates c").WithArgs(eID).WillReturnRows(statRows)

		stats, err := repo.AdminGetVoteStatistics(ctx, eID)
		assert.NoError(t, err)
		assert.NotNil(t, stats)
		assert.Equal(t, 100, stats.TotalVotes)
		assert.Len(t, stats.Candidates, 2)
		assert.Equal(t, 60.0, stats.Candidates[0].Percentage)
		assert.Equal(t, 40.0, stats.Candidates[1].Percentage)
	})
	
	t.Run("Success_ZeroTotal", func(t *testing.T) {
		countRows := sqlmock.NewRows([]string{"count"}).AddRow(0)
		mock.ExpectQuery("^SELECT COUNT\\(id\\) FROM votes").WithArgs(eID).WillReturnRows(countRows)

		statRows := sqlmock.NewRows([]string{"candidate_id", "candidate_name", "vote_count"}).
			AddRow(uuid.New(), "Cand 1", 0)
		mock.ExpectQuery("^SELECT (.+) FROM candidates c").WithArgs(eID).WillReturnRows(statRows)

		stats, err := repo.AdminGetVoteStatistics(ctx, eID)
		assert.NoError(t, err)
		assert.NotNil(t, stats)
		assert.Equal(t, 0, stats.TotalVotes)
		assert.Equal(t, 0.0, stats.Candidates[0].Percentage)
	})

	t.Run("CountError", func(t *testing.T) {
		mock.ExpectQuery("^SELECT COUNT\\(id\\) FROM votes").WithArgs(eID).WillReturnError(sql.ErrConnDone)

		stats, err := repo.AdminGetVoteStatistics(ctx, eID)
		assert.Error(t, err)
		assert.Nil(t, stats)
	})

	t.Run("DataError", func(t *testing.T) {
		countRows := sqlmock.NewRows([]string{"count"}).AddRow(100)
		mock.ExpectQuery("^SELECT COUNT\\(id\\) FROM votes").WithArgs(eID).WillReturnRows(countRows)

		mock.ExpectQuery("^SELECT (.+) FROM candidates c").WithArgs(eID).WillReturnError(sql.ErrConnDone)

		stats, err := repo.AdminGetVoteStatistics(ctx, eID)
		assert.Error(t, err)
		assert.Nil(t, stats)
	})
}

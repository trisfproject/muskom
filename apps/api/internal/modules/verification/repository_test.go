package verification

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
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

func TestRepository_GetVerifications(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		countRows := sqlmock.NewRows([]string{"count"}).AddRow(1)
		mock.ExpectQuery("^SELECT COUNT").WillReturnRows(countRows)

		now := time.Now()
		rows := sqlmock.NewRows([]string{
			"id", "queue_type", "applicant_name", "status", "created_at",
		}).AddRow("1", "participant", "John Doe", "SUBMITTED", now)

		mock.ExpectQuery("^WITH combined_queue").WillReturnRows(rows)

		filter := VerificationListRequest{
			QueueType:      "participant",
			Status:         "SUBMITTED",
			ApplicantName:  "John",
			SubmissionDate: "2026-07-30",
			SortBy:         "status",
			SortOrder:      "asc",
		}
		list, total, err := repo.GetVerifications(ctx, filter)
		assert.NoError(t, err)
		assert.Equal(t, 1, total)
		assert.Len(t, list, 1)
	})

	t.Run("Success_DefaultFilters", func(t *testing.T) {
		countRows := sqlmock.NewRows([]string{"count"}).AddRow(1)
		mock.ExpectQuery("^SELECT COUNT").WillReturnRows(countRows)

		now := time.Now()
		rows := sqlmock.NewRows([]string{
			"id", "queue_type", "applicant_name", "status", "created_at",
		}).AddRow("1", "participant", "John Doe", "SUBMITTED", now)

		mock.ExpectQuery("^WITH combined_queue").WillReturnRows(rows)

		filter := VerificationListRequest{}
		list, total, err := repo.GetVerifications(ctx, filter)
		assert.NoError(t, err)
		assert.Equal(t, 1, total)
		assert.Len(t, list, 1)
	})

	t.Run("CountError", func(t *testing.T) {
		mock.ExpectQuery("^SELECT COUNT").WillReturnError(sql.ErrConnDone)

		filter := VerificationListRequest{}
		list, total, err := repo.GetVerifications(ctx, filter)
		assert.Error(t, err)
		assert.Equal(t, 0, total)
		assert.Nil(t, list)
	})

	t.Run("DataError", func(t *testing.T) {
		countRows := sqlmock.NewRows([]string{"count"}).AddRow(1)
		mock.ExpectQuery("^SELECT COUNT").WillReturnRows(countRows)

		mock.ExpectQuery("^WITH combined_queue").WillReturnError(sql.ErrConnDone)

		filter := VerificationListRequest{}
		list, total, err := repo.GetVerifications(ctx, filter)
		assert.Error(t, err)
		assert.Equal(t, 0, total)
		assert.Nil(t, list)
	})
}

func TestRepository_GetVerificationSummary(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{
			"pending_participants", "pending_candidates",
		}).AddRow(5, 2)

		mock.ExpectQuery("^SELECT (.+) as pending_participants").WillReturnRows(rows)

		summary, err := repo.GetVerificationSummary(ctx)
		assert.NoError(t, err)
		assert.Equal(t, 7, summary.TotalPending)
		assert.Equal(t, 5, summary.PendingParticipants)
		assert.Equal(t, 2, summary.PendingCandidates)
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectQuery("^SELECT (.+) as pending_participants").WillReturnError(sql.ErrNoRows)

		summary, err := repo.GetVerificationSummary(ctx)
		assert.Error(t, err)
		assert.Nil(t, summary)
	})
}

func TestRepository_GetParticipantDetail(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		now := time.Now()
		rows := sqlmock.NewRows([]string{
			"id", "participant_category", "source", "status", "rejection_reason",
			"created_at", "updated_at", "person_id", "full_name", "email", "phone", "institution",
			"registration_number", "region", "community", "job_title",
		}).AddRow("reg1", "cat1", "src1", "status1", nil, now, now, "p1", "John", "e@mail", "12", "inst", "REG-001", "Area A", "Dept B", "Engineer")

		mock.ExpectQuery("^SELECT (.+) FROM registrations").WillReturnRows(rows)

		detail, err := repo.GetParticipantDetail(ctx, "reg1")
		assert.NoError(t, err)
		assert.NotNil(t, detail)
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectQuery("^SELECT (.+) FROM registrations").WillReturnError(sql.ErrNoRows)

		detail, err := repo.GetParticipantDetail(ctx, "reg1")
		assert.Error(t, err)
		assert.Nil(t, detail)
	})
}

func TestRepository_BeginTx(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectBegin()
		tx, err := repo.BeginTx(ctx)
		assert.NoError(t, err)
		assert.NotNil(t, tx)
		tx.Rollback()
	})
}

func TestRepository_LogAudit(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()
	ctx = context.WithValue(ctx, "user_id", "u1")

	t.Run("Success", func(t *testing.T) {
		mock.ExpectExec("^INSERT INTO audit_logs").WillReturnResult(sqlmock.NewResult(1, 1))
		err := repo.LogAudit(ctx, nil, "mod", "act", "ent", "id", "meta")
		assert.NoError(t, err)
	})
}

func TestRepository_UpdateParticipantStatus(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectBegin()
		tx, _ := repo.BeginTx(ctx)

		mock.ExpectExec("^UPDATE registrations").WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.UpdateParticipantStatus(ctx, tx, "reg1", "APPROVED", "u1", nil, nil)
		assert.NoError(t, err)
		tx.Rollback()
	})

	t.Run("NotFound", func(t *testing.T) {
		mock.ExpectExec("^UPDATE registrations").WillReturnResult(sqlmock.NewResult(1, 0))
		err := repo.UpdateParticipantStatus(ctx, nil, "reg1", "APPROVED", "u1", nil, nil)
		assert.Error(t, err)
		assert.Equal(t, "participant not found", err.Error())
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectExec("^UPDATE registrations").WillReturnError(sql.ErrConnDone)
		err := repo.UpdateParticipantStatus(ctx, nil, "reg1", "APPROVED", "u1", nil, nil)
		assert.Error(t, err)
	})
}

func TestRepository_GetCandidateDetail(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		now := time.Now()
		rows := sqlmock.NewRows([]string{
			"id", "registration_id", "participant_category", "source", "status",
			"created_at", "updated_at", "person_id", "full_name", "email", "phone", "institution",
			"vision", "mission", "work_program", "photo_path", "document_path",
		}).AddRow("ca1", "reg1", "cat1", "src1", "status1", now, now, "p1", "John", "e@mail", "12", "inst", nil, nil, nil, nil, nil)

		mock.ExpectQuery("^SELECT (.+) FROM candidates").WillReturnRows(rows)

		detail, err := repo.GetCandidateDetail(ctx, "ca1")
		assert.NoError(t, err)
		assert.NotNil(t, detail)
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectQuery("^SELECT (.+) FROM candidates").WillReturnError(sql.ErrNoRows)

		detail, err := repo.GetCandidateDetail(ctx, "ca1")
		assert.Error(t, err)
		assert.Nil(t, detail)
	})
}

func TestRepository_UpdateCandidateStatus(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectExec("^UPDATE candidates").WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.UpdateCandidateStatus(ctx, nil, "ca1", "ACCEPTED", "u1")
		assert.NoError(t, err)
	})

	t.Run("NotFound", func(t *testing.T) {
		mock.ExpectExec("^UPDATE candidates").WillReturnResult(sqlmock.NewResult(1, 0))
		err := repo.UpdateCandidateStatus(ctx, nil, "ca1", "ACCEPTED", "u1")
		assert.Error(t, err)
		assert.Equal(t, "candidate not found", err.Error())
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectExec("^UPDATE candidates").WillReturnError(sql.ErrConnDone)
		err := repo.UpdateCandidateStatus(ctx, nil, "ca1", "ACCEPTED", "u1")
		assert.Error(t, err)
	})
}

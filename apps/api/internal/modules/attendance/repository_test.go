package attendance

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

func TestRepository_GetParticipantStatus(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"status"}).AddRow("VERIFIED")
		mock.ExpectQuery("^SELECT status FROM registrations WHERE id = \\$1").
			WithArgs("reg1").
			WillReturnRows(rows)

		status, err := repo.GetParticipantStatus(ctx, "reg1")
		assert.NoError(t, err)
		assert.Equal(t, "VERIFIED", status)
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectQuery("^SELECT status FROM registrations WHERE id = \\$1").
			WithArgs("reg1").
			WillReturnError(sql.ErrNoRows)

		status, err := repo.GetParticipantStatus(ctx, "reg1")
		assert.Error(t, err)
		assert.Empty(t, status)
	})
}

func TestRepository_GetAttendanceDetail(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		now := time.Now()
		rows := sqlmock.NewRows([]string{
			"id", "registration_id", "checked_in_at", "checked_in_by", "created_at", "updated_at",
			"full_name", "email", "phone", "institution",
		}).AddRow("att1", "reg1", now, "op1", now, now, "John", "j@mail.com", "123", "Inst")

		mock.ExpectQuery("^SELECT (.+) FROM attendance a JOIN registrations reg").
			WithArgs("reg1").
			WillReturnRows(rows)

		detail, err := repo.GetAttendanceDetail(ctx, "reg1")
		assert.NoError(t, err)
		assert.NotNil(t, detail)
		assert.Equal(t, "att1", detail.ID)
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectQuery("^SELECT (.+) FROM attendance a JOIN registrations reg").
			WithArgs("reg1").
			WillReturnError(sql.ErrNoRows)

		detail, err := repo.GetAttendanceDetail(ctx, "reg1")
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

func TestRepository_CreateAttendance(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	t.Run("Success_WithTx", func(t *testing.T) {
		mock.ExpectBegin()
		tx, _ := repo.BeginTx(ctx)

		mock.ExpectExec("^INSERT INTO attendance").
			WithArgs("reg1", "op1").
			WillReturnResult(sqlmock.NewResult(1, 1))

		created, err := repo.CreateAttendance(ctx, tx, "reg1", "op1")
		assert.NoError(t, err)
		assert.True(t, created)
		tx.Rollback()
	})

	t.Run("Conflict", func(t *testing.T) {
		mock.ExpectExec("^INSERT INTO attendance").
			WithArgs("reg1", "op1").
			WillReturnResult(sqlmock.NewResult(1, 0))

		created, err := repo.CreateAttendance(ctx, nil, "reg1", "op1")
		assert.NoError(t, err)
		assert.False(t, created)
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectExec("^INSERT INTO attendance").
			WithArgs("reg1", "op1").
			WillReturnError(sql.ErrConnDone)

		created, err := repo.CreateAttendance(ctx, nil, "reg1", "op1")
		assert.Error(t, err)
		assert.False(t, created)
	})
}

func TestRepository_LogAudit(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()
	ctx = context.WithValue(ctx, "user_id", "u1")

	t.Run("Success", func(t *testing.T) {
		mock.ExpectExec("^INSERT INTO audit_logs").
			WithArgs("mod", "act", "ent", "id1", "u1", "meta").
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.LogAudit(ctx, nil, "mod", "act", "ent", "id1", "meta")
		assert.NoError(t, err)
	})
}

func TestRepository_ListAttendances(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	t.Run("Success_NoFilter", func(t *testing.T) {
		countRows := sqlmock.NewRows([]string{"count"}).AddRow(1)
		mock.ExpectQuery("^SELECT COUNT").WillReturnRows(countRows)

		now := time.Now()
		rows := sqlmock.NewRows([]string{
			"registration_id", "participant_name", "institution",
			"verification_status", "attendance_status", "checked_in_at",
		}).AddRow("reg1", "John", "Inst", "VERIFIED", "PRESENT", now)

		mock.ExpectQuery("^SELECT r.id as registration_id").
			WillReturnRows(rows)

		req := AttendanceListRequest{}
		items, total, err := repo.ListAttendances(ctx, req)
		assert.NoError(t, err)
		assert.Equal(t, 1, total)
		assert.Len(t, items, 1)
	})

	t.Run("Success_WithFilters", func(t *testing.T) {
		countRows := sqlmock.NewRows([]string{"count"}).AddRow(1)
		mock.ExpectQuery("^SELECT COUNT").WillReturnRows(countRows)

		rows := sqlmock.NewRows([]string{
			"registration_id", "participant_name", "institution",
			"verification_status", "attendance_status", "checked_in_at",
		}).AddRow("reg1", "John", "Inst", "VERIFIED", "PRESENT", nil)

		mock.ExpectQuery("^SELECT r.id as registration_id").
			WillReturnRows(rows)

		req := AttendanceListRequest{
			Page:               2,
			Limit:              5,
			SortBy:             "checked_in_at",
			SortDirection:      "asc",
			AttendanceStatus:   "PRESENT",
			ParticipantID:      "p1",
			ParticipantName:    "John",
			VerificationStatus: "VERIFIED",
			CheckInDate:        "2026-07-30",
		}
		items, total, err := repo.ListAttendances(ctx, req)
		assert.NoError(t, err)
		assert.Equal(t, 1, total)
		assert.Len(t, items, 1)
	})

	t.Run("Success_AbsentFilter", func(t *testing.T) {
		countRows := sqlmock.NewRows([]string{"count"}).AddRow(1)
		mock.ExpectQuery("^SELECT COUNT").WillReturnRows(countRows)

		rows := sqlmock.NewRows([]string{
			"registration_id", "participant_name", "institution",
			"verification_status", "attendance_status", "checked_in_at",
		}).AddRow("reg1", "John", "Inst", "VERIFIED", "ABSENT", nil)

		mock.ExpectQuery("^SELECT r.id as registration_id").
			WillReturnRows(rows)

		req := AttendanceListRequest{
			AttendanceStatus: "ABSENT",
			SortBy:           "participant_name",
		}
		items, total, err := repo.ListAttendances(ctx, req)
		assert.NoError(t, err)
		assert.Equal(t, 1, total)
		assert.Len(t, items, 1)
	})

	t.Run("CountError", func(t *testing.T) {
		mock.ExpectQuery("^SELECT COUNT").WillReturnError(sql.ErrConnDone)

		req := AttendanceListRequest{}
		items, total, err := repo.ListAttendances(ctx, req)
		assert.Error(t, err)
		assert.Equal(t, 0, total)
		assert.Nil(t, items)
	})

	t.Run("QueryError", func(t *testing.T) {
		countRows := sqlmock.NewRows([]string{"count"}).AddRow(1)
		mock.ExpectQuery("^SELECT COUNT").WillReturnRows(countRows)
		mock.ExpectQuery("^SELECT r.id as registration_id").WillReturnError(sql.ErrConnDone)

		req := AttendanceListRequest{}
		items, total, err := repo.ListAttendances(ctx, req)
		assert.Error(t, err)
		assert.Equal(t, 0, total)
		assert.Nil(t, items)
	})
}

func TestRepository_GetAttendanceByID(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		now := time.Now()
		rows := sqlmock.NewRows([]string{
			"id", "registration_id", "checked_in_at", "checked_in_by", "created_at", "updated_at",
			"full_name", "email", "phone", "institution",
		}).AddRow("att1", "reg1", now, "op1", now, now, "John", "j@mail.com", "123", "Inst")

		mock.ExpectQuery("^SELECT (.+) FROM attendance a JOIN registrations reg").
			WithArgs("att1").
			WillReturnRows(rows)

		detail, err := repo.GetAttendanceByID(ctx, "att1")
		assert.NoError(t, err)
		assert.NotNil(t, detail)
		assert.Equal(t, "att1", detail.ID)
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectQuery("^SELECT (.+) FROM attendance a JOIN registrations reg").
			WithArgs("att1").
			WillReturnError(sql.ErrNoRows)

		detail, err := repo.GetAttendanceByID(ctx, "att1")
		assert.Error(t, err)
		assert.Nil(t, detail)
	})
}

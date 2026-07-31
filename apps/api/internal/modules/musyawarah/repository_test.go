package musyawarah

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

func TestRepository_GetActiveEvent(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{
			"id", "name", "theme", "location", "banner_path", "logo_path", "cover_path", "status",
		}).AddRow("evt1", "Event", nil, nil, nil, nil, nil, "ACTIVE")

		mock.ExpectQuery("^SELECT (.+) FROM events").WillReturnRows(rows)

		e, err := repo.GetActiveEvent(ctx)
		assert.NoError(t, err)
		assert.NotNil(t, e)
		assert.Equal(t, "evt1", e.ID)
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectQuery("^SELECT (.+) FROM events").WillReturnError(sql.ErrNoRows)

		e, err := repo.GetActiveEvent(ctx)
		assert.Error(t, err)
		assert.Empty(t, e.ID) // e might be initialized but empty
	})
}

func TestRepository_GetSettings(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{
			"registration_limit", "registration_approval_mode", "candidate_approval_mode",
			"enable_attendance", "attendance_qr_expiration", "attendance_radius",
			"enable_voting", "allow_revote", "show_live_result", "publish_final_result",
			"allow_candidate_registration", "show_candidate_list", "show_timeline",
			"show_statistics", "show_announcements",
		}).AddRow(nil, "AUTO", "AUTO", true, 60, 100, true, false, true, true, true, true, true, true, true)

		mock.ExpectQuery("^SELECT (.+) FROM event_settings").WithArgs("evt1").WillReturnRows(rows)

		s, err := repo.GetSettings(ctx, "evt1")
		assert.NoError(t, err)
		assert.NotNil(t, s)
	})

	t.Run("NoRowsReturnsEmpty", func(t *testing.T) {
		mock.ExpectQuery("^SELECT (.+) FROM event_settings").WithArgs("evt1").WillReturnError(sql.ErrNoRows)

		s, err := repo.GetSettings(ctx, "evt1")
		assert.NoError(t, err) // Should return empty settings without error
		assert.NotNil(t, s)
	})

	t.Run("OtherError", func(t *testing.T) {
		mock.ExpectQuery("^SELECT (.+) FROM event_settings").WithArgs("evt1").WillReturnError(sql.ErrConnDone)

		s, err := repo.GetSettings(ctx, "evt1")
		assert.Error(t, err)
		assert.Empty(t, s.RegistrationApprovalMode)
	})
}

func TestRepository_GetPhases(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		now := time.Now()
		rows := sqlmock.NewRows([]string{"phase", "start_at", "end_at"}).AddRow("REGISTRATION", now, now)

		mock.ExpectQuery("^SELECT phase, start_at, end_at FROM event_phases").WithArgs("evt1").WillReturnRows(rows)

		p, err := repo.GetPhases(ctx, "evt1")
		assert.NoError(t, err)
		assert.Len(t, p, 1)
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectQuery("^SELECT phase, start_at, end_at FROM event_phases").WithArgs("evt1").WillReturnError(sql.ErrConnDone)

		p, err := repo.GetPhases(ctx, "evt1")
		assert.Error(t, err)
		assert.Nil(t, p)
	})
}

func TestRepository_UpdateEvent(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectBegin()
		tx, _ := repo.BeginTx(ctx)

		mock.ExpectExec("^UPDATE events SET").WillReturnResult(sqlmock.NewResult(1, 1))

		e := &MusyawarahEvent{ID: "evt1", Name: "Event"}
		err := repo.UpdateEvent(ctx, tx, e)
		assert.NoError(t, err)
		tx.Rollback()
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectBegin()
		tx, _ := repo.BeginTx(ctx)

		mock.ExpectExec("^UPDATE events SET").WillReturnError(sql.ErrConnDone)

		e := &MusyawarahEvent{ID: "evt1", Name: "Event"}
		err := repo.UpdateEvent(ctx, tx, e)
		assert.Error(t, err)
		tx.Rollback()
	})
}

func TestRepository_UpdateMedia(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()
	path := "path/to/media"

	t.Run("Success_Logo", func(t *testing.T) {
		mock.ExpectExec("^UPDATE events SET logo_path").WillReturnResult(sqlmock.NewResult(1, 1))
		err := repo.UpdateMedia(ctx, "evt1", "logo", &path)
		assert.NoError(t, err)
	})

	t.Run("Success_Banner", func(t *testing.T) {
		mock.ExpectExec("^UPDATE events SET banner_path").WillReturnResult(sqlmock.NewResult(1, 1))
		err := repo.UpdateMedia(ctx, "evt1", "banner", &path)
		assert.NoError(t, err)
	})

	t.Run("Success_Cover", func(t *testing.T) {
		mock.ExpectExec("^UPDATE events SET cover_path").WillReturnResult(sqlmock.NewResult(1, 1))
		err := repo.UpdateMedia(ctx, "evt1", "cover", &path)
		assert.NoError(t, err)
	})

	t.Run("InvalidType", func(t *testing.T) {
		err := repo.UpdateMedia(ctx, "evt1", "invalid", &path)
		assert.Error(t, err)
	})

	t.Run("DBError", func(t *testing.T) {
		mock.ExpectExec("^UPDATE events SET logo_path").WillReturnError(sql.ErrConnDone)
		err := repo.UpdateMedia(ctx, "evt1", "logo", &path)
		assert.Error(t, err)
	})
}

func TestRepository_UpdateSettings(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectBegin()
		tx, _ := repo.BeginTx(ctx)

		mock.ExpectExec("^INSERT INTO event_settings").WillReturnResult(sqlmock.NewResult(1, 1))

		s := &MusyawarahSettings{}
		err := repo.UpdateSettings(ctx, tx, "evt1", s)
		assert.NoError(t, err)
		tx.Rollback()
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectBegin()
		tx, _ := repo.BeginTx(ctx)

		mock.ExpectExec("^INSERT INTO event_settings").WillReturnError(sql.ErrConnDone)

		s := &MusyawarahSettings{}
		err := repo.UpdateSettings(ctx, tx, "evt1", s)
		assert.Error(t, err)
		tx.Rollback()
	})
}

func TestRepository_UpsertPhase(t *testing.T) {
	db, mock, repo := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectBegin()
		tx, _ := repo.BeginTx(ctx)

		mock.ExpectExec("^INSERT INTO event_phases").WillReturnResult(sqlmock.NewResult(1, 1))

		p := &MusyawarahPhase{Phase: "REGISTRATION"}
		err := repo.UpsertPhase(ctx, tx, "evt1", p)
		assert.NoError(t, err)
		tx.Rollback()
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectBegin()
		tx, _ := repo.BeginTx(ctx)

		mock.ExpectExec("^INSERT INTO event_phases").WillReturnError(sql.ErrConnDone)

		p := &MusyawarahPhase{Phase: "REGISTRATION"}
		err := repo.UpsertPhase(ctx, tx, "evt1", p)
		assert.Error(t, err)
		tx.Rollback()
	})
}

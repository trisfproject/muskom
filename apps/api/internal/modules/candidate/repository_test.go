package candidate

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
)

func setupTestDB(t *testing.T) (*sqlx.DB, sqlmock.Sqlmock, Repository) {
	mockDB, mock, err := sqlmock.New()
	assert.NoError(t, err)

	db := sqlx.NewDb(mockDB, "postgres")
	repo := NewRepository(db)

	return db, mock, repo
}

func TestRepository_CheckExistingApplication(t *testing.T) {
	ctx := context.Background()
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	t.Run("Success_Exists", func(t *testing.T) {
		mock.ExpectQuery("^SELECT EXISTS").WithArgs("reg1").WillReturnRows(sqlmock.NewRows([]string{"exists"}).AddRow(true))
		
		exists, err := repo.CheckExistingApplication(ctx, "reg1")
		assert.NoError(t, err)
		assert.True(t, exists)
	})

	t.Run("Success_NotExists", func(t *testing.T) {
		mock.ExpectQuery("^SELECT EXISTS").WithArgs("reg1").WillReturnRows(sqlmock.NewRows([]string{"exists"}).AddRow(false))
		
		exists, err := repo.CheckExistingApplication(ctx, "reg1")
		assert.NoError(t, err)
		assert.False(t, exists)
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectQuery("^SELECT EXISTS").WithArgs("reg1").WillReturnError(sql.ErrConnDone)
		
		exists, err := repo.CheckExistingApplication(ctx, "reg1")
		assert.Error(t, err)
		assert.False(t, exists)
	})
}

func TestRepository_GetEventActivePhase(t *testing.T) {
	ctx := context.Background()
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	t.Run("Success_Active", func(t *testing.T) {
		mock.ExpectQuery("^SELECT is_active FROM event_phases").WithArgs("evt1", "PHASE1").WillReturnRows(sqlmock.NewRows([]string{"is_active"}).AddRow(true))
		
		isActive, err := repo.GetEventActivePhase(ctx, "evt1", "PHASE1")
		assert.NoError(t, err)
		assert.True(t, isActive)
	})

	t.Run("NotFound", func(t *testing.T) {
		mock.ExpectQuery("^SELECT is_active FROM event_phases").WithArgs("evt1", "PHASE1").WillReturnError(sql.ErrNoRows)
		
		isActive, err := repo.GetEventActivePhase(ctx, "evt1", "PHASE1")
		assert.NoError(t, err)
		assert.False(t, isActive)
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectQuery("^SELECT is_active FROM event_phases").WithArgs("evt1", "PHASE1").WillReturnError(sql.ErrConnDone)
		
		isActive, err := repo.GetEventActivePhase(ctx, "evt1", "PHASE1")
		assert.Error(t, err)
		assert.False(t, isActive)
	})
}

func TestRepository_CreateCandidateApplication(t *testing.T) {
	ctx := context.Background()
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	app := &CandidateApplication{
		RegistrationID: "reg1",
		Vision: "v",
		Mission: "m",
		WorkProgram: "wp",
		Status: "PENDING",
	}

	t.Run("Success", func(t *testing.T) {
		mock.ExpectQuery("^INSERT INTO candidate_applications").
			WithArgs(app.RegistrationID, app.Vision, app.Mission, app.WorkProgram, app.Status).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("app1"))
		
		id, err := repo.CreateCandidateApplication(ctx, app)
		assert.NoError(t, err)
		assert.Equal(t, "app1", id)
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectQuery("^INSERT INTO candidate_applications").
			WillReturnError(sql.ErrConnDone)
		
		id, err := repo.CreateCandidateApplication(ctx, app)
		assert.Error(t, err)
		assert.Empty(t, id)
	})
}

func TestRepository_GetRegistrationDetails(t *testing.T) {
	ctx := context.Background()
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	t.Run("Success", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"event_id", "event_status", "registration_status"}).
			AddRow("evt1", "ONGOING", "APPROVED")
		mock.ExpectQuery("^SELECT r.event_id, e.status").WithArgs("reg1").WillReturnRows(rows)
		
		details, err := repo.GetRegistrationDetails(ctx, "reg1")
		assert.NoError(t, err)
		assert.Equal(t, "evt1", details.EventID)
	})

	t.Run("NotFound", func(t *testing.T) {
		mock.ExpectQuery("^SELECT r.event_id, e.status").WithArgs("reg1").WillReturnError(sql.ErrNoRows)
		
		details, err := repo.GetRegistrationDetails(ctx, "reg1")
		assert.ErrorIs(t, err, ErrRegistrationNotFound)
		assert.Nil(t, details)
	})
}

func TestRepository_GetCandidateApplicationByID(t *testing.T) {
	ctx := context.Background()
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	t.Run("Success", func(t *testing.T) {
		now := time.Now()
		rows := sqlmock.NewRows([]string{
			"id", "registration_id", "vision", "mission", "work_program", "photo_path", "document_path",
			"status", "reviewed_by", "reviewed_at", "created_at", "updated_at",
		}).AddRow("app1", "reg1", "v", "m", "wp", nil, nil, "PENDING", nil, nil, now, now)
		
		mock.ExpectQuery("^SELECT id, registration_id").WithArgs("app1").WillReturnRows(rows)
		
		app, err := repo.GetCandidateApplicationByID(ctx, "app1")
		assert.NoError(t, err)
		assert.Equal(t, "app1", app.ID)
	})

	t.Run("NotFound", func(t *testing.T) {
		mock.ExpectQuery("^SELECT id, registration_id").WithArgs("app1").WillReturnError(sql.ErrNoRows)
		
		app, err := repo.GetCandidateApplicationByID(ctx, "app1")
		assert.ErrorIs(t, err, ErrCandidateApplicationNotFound)
		assert.Nil(t, app)
	})
}

func TestRepository_GetAdminCandidateList(t *testing.T) {
	ctx := context.Background()
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	t.Run("Success", func(t *testing.T) {
		now := time.Now()
		mock.ExpectQuery("^SELECT COUNT\\(ca.id\\)").WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))
		
		rows := sqlmock.NewRows([]string{
			"id", "candidate_code", "registration_id", "name", "participant_category", "status", "created_at",
		}).AddRow("app1", "app1", "reg1", "John", "DELEGATE", "PENDING", now)
		mock.ExpectQuery("^SELECT ca.id, ca.id as candidate_code").WillReturnRows(rows)
		
		req := CandidateAdminListRequest{
			EventID: "evt1", Status: "PENDING", Search: "John", CandidateID: "app1", 
			RegistrationID: "reg1", SubmissionDate: "2023-01-01", SortBy: "status", SortOrder: "desc",
		}
		
		list, total, err := repo.GetAdminCandidateList(ctx, req)
		assert.NoError(t, err)
		assert.Equal(t, 1, total)
		assert.Len(t, list, 1)
	})
}

func TestRepository_GetAdminCandidateDetail(t *testing.T) {
	ctx := context.Background()
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	t.Run("Success", func(t *testing.T) {
		now := time.Now()
		rows := sqlmock.NewRows([]string{
			"id", "candidate_code", "registration_id", "name", "participant_category", "status", "created_at",
			"vision", "mission", "work_program", "photo_path", "document_path", "reviewed_by", "reviewed_at", "reviewer_name",
		}).AddRow("app1", "app1", "reg1", "John", "DELEGATE", "PENDING", now, "v", "m", "w", nil, nil, nil, nil, nil)
		
		mock.ExpectQuery("^SELECT ca.id, ca.id as candidate_code").WithArgs("app1").WillReturnRows(rows)
		
		detail, err := repo.GetAdminCandidateDetail(ctx, "app1")
		assert.NoError(t, err)
		assert.Equal(t, "app1", detail.ID)
	})

	t.Run("NotFound", func(t *testing.T) {
		mock.ExpectQuery(`^SELECT ca.id`).
			WithArgs("app1").
			WillReturnError(sql.ErrNoRows)

		res, err := repo.GetAdminCandidateDetail(ctx, "app1")
		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

func TestRepository_UpdateCandidateStatus(t *testing.T) {
	ctx := context.Background()
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectExec("^UPDATE candidate_applications SET status = \\$1").
			WithArgs("APPROVED", "admin1", "app1").
			WillReturnResult(sqlmock.NewResult(1, 1))
		
		err := repo.UpdateCandidateStatus(ctx, nil, "app1", "APPROVED", "admin1")
		assert.NoError(t, err)
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectExec("^UPDATE candidate_applications SET status = \\$1").
			WithArgs("APPROVED", "admin1", "app1").
			WillReturnError(sql.ErrConnDone)
		
		err := repo.UpdateCandidateStatus(ctx, nil, "app1", "APPROVED", "admin1")
		assert.Error(t, err)
	})
}

func TestRepository_AdminListCandidates(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success_NoFilter", func(t *testing.T) {
		mock.ExpectQuery(`^SELECT COUNT\(ca\.id\)`).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		mock.ExpectQuery(`^SELECT ca.id`).
			WillReturnRows(sqlmock.NewRows([]string{"id", "candidate_code", "registration_id", "name", "participant_category", "status", "created_at"}).
				AddRow("app1", "app1", "reg1", "John Doe", "PESERTA_PENUH", "SUBMITTED", time.Now()))

		filter := CandidateAdminListRequest{Page: 1, Limit: 10}
		res, total, err := repo.GetAdminCandidateList(ctx, filter)

		assert.NoError(t, err)
		assert.Equal(t, 1, total)
		assert.Len(t, res, 1)
	})

	t.Run("Success_WithFilter", func(t *testing.T) {
		mock.ExpectQuery(`^SELECT COUNT\(ca\.id\)`).
			WithArgs("APPROVED", "%john%").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		mock.ExpectQuery(`^SELECT ca.id`).
			WithArgs("APPROVED", "%john%", 10, 0).
			WillReturnRows(sqlmock.NewRows([]string{"id", "candidate_code", "registration_id", "name", "participant_category", "status", "created_at"}).
				AddRow("app1", "app1", "reg1", "John Doe", "PESERTA_PENUH", "APPROVED", time.Now()))

		filter := CandidateAdminListRequest{Search: "john", Status: "APPROVED", Page: 1, Limit: 10}
		res, total, err := repo.GetAdminCandidateList(ctx, filter)

		assert.NoError(t, err)
		assert.Equal(t, 1, total)
		assert.Len(t, res, 1)
	})
}

func TestRepository_UpdateCandidateDetails(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectBegin()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)

		mock.ExpectExec(`^UPDATE candidate_applications SET vision`).
			WithArgs("v2", "m2", "wp2", "app1").
			WillReturnResult(sqlmock.NewResult(1, 1))

		v2 := "v2"
		m2 := "m2"
		wp2 := "wp2"
		req := &CandidateAdminUpdateRequest{Vision: &v2, Mission: &m2, WorkProgram: &wp2}
		err = repo.UpdateCandidateDetails(ctx, tx, "app1", req)
		assert.NoError(t, err)
	})
}






func TestRepository_GetCandidateAuditHistory(t *testing.T) {
	ctx := context.Background()
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	t.Run("Success", func(t *testing.T) {
		now := time.Now()
		rows := sqlmock.NewRows([]string{"id", "action", "metadata", "created_at", "user_name"}).
			AddRow("log1", "UPDATE_STATUS", "{}", now, "Admin User")
		mock.ExpectQuery("^SELECT al.id, al.action").WithArgs("app1").WillReturnRows(rows)
		
		logs, err := repo.GetCandidateAuditHistory(ctx, "app1")
		assert.NoError(t, err)
		assert.Len(t, logs, 1)
	})

	t.Run("Error", func(t *testing.T) {
		mock.ExpectQuery("^SELECT al.id, al.action").WithArgs("app1").WillReturnError(sql.ErrConnDone)
		
		logs, err := repo.GetCandidateAuditHistory(ctx, "app1")
		assert.Error(t, err)
		assert.Nil(t, logs)
	})
}



func TestRepository_UpdateDocumentPaths(t *testing.T) {
	ctx := context.Background()
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	t.Run("Success", func(t *testing.T) {
		p1 := "path1"
		mock.ExpectExec("^UPDATE candidate_applications SET photo_path = COALESCE").
			WithArgs(&p1, nil, "app1").
			WillReturnResult(sqlmock.NewResult(1, 1))
		
		err := repo.UpdateDocumentPaths(ctx, nil, "app1", &p1, nil)
		assert.NoError(t, err)
	})
}

func TestRepository_LogAudit(t *testing.T) {
	ctx := context.Background()
	db, mock, repo := setupTestDB(t)
	defer db.Close()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectExec("^INSERT INTO audit_logs").
			WithArgs("action", "module", "table", "record", "meta").
			WillReturnResult(sqlmock.NewResult(1, 1))
		
		err := repo.LogAudit(ctx, nil, "action", "module", "table", "record", "meta")
		assert.NoError(t, err)
	})
}



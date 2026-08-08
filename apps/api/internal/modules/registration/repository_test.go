package registration

import (
	"context"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
)

func TestRepository_CountRegistrations(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectQuery("^SELECT COUNT\\(1\\) FROM registrations").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(5))

		count, err := repo.CountRegistrations(ctx, "evt1")
		assert.NoError(t, err)
		assert.Equal(t, 5, count)
	})
}

func TestRepository_IsPhaseActive(t *testing.T) {
	sqlxDB := sqlx.NewDb(nil, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Active", func(t *testing.T) {

		active, err := repo.IsPhaseActive(ctx, "evt1", "REGISTRATION")
		assert.NoError(t, err)
		assert.True(t, active)
	})
}

func TestRepository_GetActiveEventContext(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"settings"}).
			AddRow(`{"capacity_mode": "OPEN", "participant_limit": 99999}`)
		mock.ExpectQuery("^SELECT settings FROM system_configurations").WillReturnRows(rows)

		res, err := repo.GetActiveEventContext(ctx)
		assert.NoError(t, err)
		assert.Equal(t, "global", res.EventID)
	})
}

func TestRepository_CheckExistingRegistration(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Exists", func(t *testing.T) {
		mock.ExpectQuery("^SELECT COUNT\\(1\\)").
			WithArgs("test@test.com").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		exists, err := repo.CheckExistingRegistration(ctx, "evt1", "test@test.com")
		assert.NoError(t, err)
		assert.True(t, exists)
	})
}

func TestRepository_GetRegistrationStatus(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectQuery("^SELECT status FROM registrations").
			WithArgs("reg1").
			WillReturnRows(sqlmock.NewRows([]string{"status"}).AddRow("APPROVED"))

		status, err := repo.GetRegistrationStatus(ctx, "reg1")
		assert.NoError(t, err)
		assert.Equal(t, "APPROVED", status)
	})
}

func TestRepository_CheckExistingPhone(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Exists", func(t *testing.T) {
		mock.ExpectQuery("^SELECT COUNT\\(1\\)").
			WithArgs("123456").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		exists, err := repo.CheckExistingPhone(ctx, "evt1", "123456")
		assert.NoError(t, err)
		assert.True(t, exists)
	})
}

func TestRepository_GetRegistrationByID(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectQuery("^SELECT \\* FROM registrations").
			WithArgs("reg1").
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("reg1"))

		reg, err := repo.GetRegistrationByID(ctx, "reg1")
		assert.NoError(t, err)
		assert.Equal(t, "reg1", reg.ID)
	})
}

func TestRepository_LogAudit(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectBegin()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)

		mock.ExpectExec("^INSERT INTO audit_logs").
			WithArgs("module", "action", "entity", "id", "meta").
			WillReturnResult(sqlmock.NewResult(1, 1))

		err = repo.LogAudit(ctx, tx, "module", "action", "entity", "id", "meta")
		assert.NoError(t, err)
	})
}

func TestRepository_AttachmentsStubs(t *testing.T) {
	repo := NewRepository(nil)
	ctx := context.Background()

	_, err := repo.SaveAttachmentMetadata(ctx, "1", nil)
	assert.ErrorIs(t, err, ErrSchemaMissing)

	_, err = repo.GetAttachments(ctx, "1")
	assert.ErrorIs(t, err, ErrSchemaMissing)

	err = repo.DeleteAttachmentMetadata(ctx, "1")
	assert.ErrorIs(t, err, ErrSchemaMissing)
}

func TestRepository_UpdateRegistrationStatus(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectBegin()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)

		mock.ExpectExec("^UPDATE registrations").
			WithArgs("APPROVED", sqlmock.AnyArg(), "reg1").
			WillReturnResult(sqlmock.NewResult(1, 1))

		err = repo.UpdateRegistrationStatus(ctx, tx, "reg1", "APPROVED", "admin")
		assert.NoError(t, err)
	})

	t.Run("System", func(t *testing.T) {
		mock.ExpectBegin()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)

		mock.ExpectExec("^UPDATE registrations").
			WithArgs("APPROVED", "reg1").
			WillReturnResult(sqlmock.NewResult(1, 1))

		err = repo.UpdateRegistrationStatus(ctx, tx, "reg1", "APPROVED", "system")
		assert.NoError(t, err)
	})
}

func TestRepository_GetRegistrationConfirmation(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"registration_code", "status", "registration_date", "musyawarah_name", "participant_name"}).
			AddRow("reg1", "APPROVED", "2023-01-01", "Musyawarah 1", "John Doe")
		mock.ExpectQuery("^SELECT r.id").WillReturnRows(rows)

		res, err := repo.GetRegistrationConfirmation(ctx, "reg1")
		assert.NoError(t, err)
		assert.Equal(t, "reg1", res.RegistrationCode)
	})
}

func TestRepository_GetRegistrationAdminByID(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{
			"id", "event_id", "event_name", "participant_name", "email",
			"phone", "company", "job_title", "participant_category", "source",
			"status", "created_at", "updated_at",
		}).
			AddRow("reg1", "evt1", "Event 1", "John Doe", "john@test.com", "123", "Acme", "Dev", "DELEGATE", "WEB", "PENDING", "2023-01-01", "2023-01-01")
		mock.ExpectQuery("^SELECT r.id, r.event_id").WillReturnRows(rows)

		res, err := repo.GetRegistrationAdminByID(ctx, "reg1")
		assert.NoError(t, err)
		assert.Equal(t, "reg1", res.ID)
	})
}

func TestRepository_ListRegistrations(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		countRow := sqlmock.NewRows([]string{"count"}).AddRow(1)
		mock.ExpectQuery("^SELECT COUNT\\(1\\) FROM registrations r").WillReturnRows(countRow)

		rows := sqlmock.NewRows([]string{
			"id", "event_id", "event_name", "participant_name", "email",
			"phone", "company", "job_title", "participant_category", "source",
			"status", "created_at", "updated_at",
		}).
			AddRow("reg1", "evt1", "Event 1", "John Doe", "john@test.com", "123", "Acme", "Dev", "DELEGATE", "WEB", "PENDING", "2023-01-01", "2023-01-01")
		mock.ExpectQuery("^SELECT r.id, r.event_id").WillReturnRows(rows)

		req := AdminListRegistrationsRequest{
			Page:             1,
			Limit:            10,
			Status:           "PENDING",
			RegistrationCode: "reg1",
			ParticipantName:  "John",
			Email:            "john@test.com",
			Phone:            "123",
			RegistrationDate: "2023-01-01",
			SortBy:           "participant_name",
			SortOrder:        "asc",
		}
		res, total, err := repo.ListRegistrations(ctx, req)
		assert.NoError(t, err)
		assert.Equal(t, 1, total)
		assert.Len(t, res, 1)
	})
}

func TestRepository_Transactions(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("BeginTx", func(t *testing.T) {
		mock.ExpectBegin()
		tx, err := repo.BeginTx(ctx)
		assert.NoError(t, err)
		assert.NotNil(t, tx)
		tx.Rollback()
	})
}

func TestRepository_CreateRegistration(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mock.ExpectBegin()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)

		source := "PUBLIC_WEB"
		cat := "DELEGATE"
		reg := &Registration{
			PersonID:            "pers1",
			ParticipantCategory: &cat,
			Source:              &source,
			Status:              "PENDING",
			QrToken:             nil,
			Region:              nil,
			Community:           nil,
			SpecialNotes:        nil,
		}

		mock.ExpectQuery("^INSERT INTO registrations").
			WithArgs(reg.PersonID, reg.ParticipantCategory, reg.Source, reg.Status, reg.RegistrationNumber, reg.QrToken, reg.Region, reg.Community, reg.SpecialNotes).
			WillReturnRows(sqlmock.NewRows([]string{"id", "status", "registration_number"}).AddRow("reg1", "PENDING", "REG-000001"))

		err = repo.CreateRegistration(ctx, tx, reg)
		assert.NoError(t, err)
		assert.Equal(t, "reg1", reg.ID)
		assert.NotNil(t, reg.RegistrationNumber)
		assert.Equal(t, "REG-000001", *reg.RegistrationNumber)
	})
}

func TestRepository_FindOrCreatePerson(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("CreateNew", func(t *testing.T) {
		mock.ExpectBegin()
		tx, _ := sqlxDB.BeginTxx(ctx, nil)

		person := &Person{
			FullName: "John Doe",
			Email:    "john@test.com",
		}

		mock.ExpectQuery("^INSERT INTO persons").
			WithArgs(person.FullName, person.Email, person.Phone, person.Company, person.JobTitle).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("pers1"))

		err = repo.FindOrCreatePerson(ctx, tx, person)
		assert.NoError(t, err)
		assert.Equal(t, "pers1", person.ID)
	})
}

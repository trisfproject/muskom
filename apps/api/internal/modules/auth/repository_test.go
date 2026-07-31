package auth

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
)

func TestRepository_FindByUsername(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"id", "person_id", "role_id", "username", "password_hash", "is_active", "full_name", "role_code"}).
			AddRow("usr1", "per1", "rol1", "testuser", "hash123", true, "Test User", "ADMIN")

		mock.ExpectQuery("^SELECT u.id, u.person_id, u.role_id, u.username, u.password_hash, u.is_active, p.full_name, roles.code as role_code").
			WithArgs("testuser").
			WillReturnRows(rows)

		user, err := repo.FindByUsername(ctx, "testuser")
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, "usr1", user.ID)
		assert.Equal(t, "testuser", user.Username)
		assert.Equal(t, "ADMIN", user.RoleCode)
	})

	t.Run("Not Found", func(t *testing.T) {
		mock.ExpectQuery("^SELECT u.id, u.person_id, u.role_id, u.username, u.password_hash, u.is_active, p.full_name, roles.code as role_code").
			WithArgs("testuser").
			WillReturnError(sql.ErrNoRows)

		user, err := repo.FindByUsername(ctx, "testuser")
		assert.ErrorIs(t, err, sql.ErrNoRows)
		assert.Nil(t, user)
	})
}

func TestRepository_UpdateLastLogin(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		now := time.Now()
		mock.ExpectExec("^UPDATE users SET last_login_at = \\$1, updated_at = NOW\\(\\) WHERE id = \\$2$").
			WithArgs(now, "usr1").
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.UpdateLastLogin(ctx, "usr1", now)
		assert.NoError(t, err)
	})
}

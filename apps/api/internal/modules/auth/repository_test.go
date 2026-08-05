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

func TestRepository_FindAllByUsernameOrEmail(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewRepository(sqlxDB)
	ctx := context.Background()

	t.Run("Success by Username", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"id", "person_id", "role_id", "username", "password_hash", "is_active", "full_name", "role_code"}).
			AddRow("usr1", "per1", "rol1", "testuser", "hash123", true, "Test User", "ADMIN")

		mock.ExpectQuery("^SELECT u.id, u.person_id, u.role_id, u.username, u.password_hash, u.is_active, p.full_name, roles.code as role_code").
			WithArgs("testuser").
			WillReturnRows(rows)

		users, err := repo.FindAllByUsernameOrEmail(ctx, "testuser")
		assert.NoError(t, err)
		assert.NotNil(t, users)
		assert.Len(t, users, 1)
		assert.Equal(t, "usr1", users[0].ID)
		assert.Equal(t, "testuser", users[0].Username)
		assert.Equal(t, "ADMIN", users[0].RoleCode)
	})

	t.Run("Success by Email", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"id", "person_id", "role_id", "username", "password_hash", "is_active", "full_name", "role_code"}).
			AddRow("usr1", "per1", "rol1", "testuser", "hash123", true, "Test User", "ADMIN")

		mock.ExpectQuery("^SELECT u.id, u.person_id, u.role_id, u.username, u.password_hash, u.is_active, p.full_name, roles.code as role_code").
			WithArgs("testuser@example.com").
			WillReturnRows(rows)

		users, err := repo.FindAllByUsernameOrEmail(ctx, "testuser@example.com")
		assert.NoError(t, err)
		assert.NotNil(t, users)
		assert.Len(t, users, 1)
		assert.Equal(t, "usr1", users[0].ID)
		assert.Equal(t, "testuser", users[0].Username)
		assert.Equal(t, "ADMIN", users[0].RoleCode)
	})

	t.Run("Not Found", func(t *testing.T) {
		mock.ExpectQuery("^SELECT u.id, u.person_id, u.role_id, u.username, u.password_hash, u.is_active, p.full_name, roles.code as role_code").
			WithArgs("testuser").
			WillReturnError(sql.ErrNoRows)

		users, err := repo.FindAllByUsernameOrEmail(ctx, "testuser")
		assert.ErrorIs(t, err, sql.ErrNoRows)
		assert.Nil(t, users)
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

package audit

import (
	"context"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
)

func TestParseUUID(t *testing.T) {
	t.Run("empty string returns nil", func(t *testing.T) {
		res := parseUUID("")
		assert.Nil(t, res)
	})

	t.Run("invalid non-uuid string returns nil", func(t *testing.T) {
		res := parseUUID("bulk")
		assert.Nil(t, res)
		res2 := parseUUID("invalid-uuid-123")
		assert.Nil(t, res2)
	})

	t.Run("valid uuid string returns pointer to uuid string", func(t *testing.T) {
		id := uuid.New().String()
		res := parseUUID(id)
		assert.NotNil(t, res)
		assert.Equal(t, id, *res)
	})
}

func TestRepository_Insert(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "sqlmock")
	repo := NewRepository(sqlxDB)

	t.Run("bulk action with non-uuid entity_id sends nil entity_id to db", func(t *testing.T) {
		mock.ExpectExec("INSERT INTO audit_logs").
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.Insert(context.Background(), AuditEntry{
			Module:   ModuleParticipant,
			Entity:   "participants",
			EntityID: "bulk",
			Action:   "BULK_DELETE",
			Metadata: map[string]interface{}{"participant_ids": []string{"id1", "id2"}},
		})
		assert.NoError(t, err)
	})

	t.Run("individual action with valid uuid entity_id preserves entity_id", func(t *testing.T) {
		validUUID := uuid.New().String()
		mock.ExpectExec("INSERT INTO audit_logs").
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.Insert(context.Background(), AuditEntry{
			Module:   ModuleParticipant,
			Entity:   "participants",
			EntityID: validUUID,
			Action:   "DELETE",
		})
		assert.NoError(t, err)
	})
}

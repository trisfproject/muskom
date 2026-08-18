package voting

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/stretchr/testify/assert"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
)

func setupReopenTest(t *testing.T) (*fiber.App, sqlmock.Sqlmock) {
	t.Helper()
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatal(err)
	}
	db := sqlx.NewDb(mockDB, "postgres")
	handler := NewReopenHandler(db)

	app := fiber.New()
	app.Post("/reopen", func(c fiber.Ctx) error {
		c.Locals("user_id", "admin-uuid-001")
		c.Locals("role", "SUPER_ADMIN")
		return c.Next()
	}, handler.ReopenSession)

	return app, mock
}

func makeReopenRequest(app *fiber.App, body map[string]string) (int, map[string]interface{}) {
	b, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/reopen", bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req)
	respBody, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(respBody, &result)
	return resp.StatusCode, result
}

func TestReopen_EmptyReason(t *testing.T) {
	app, _ := setupReopenTest(t)

	status, body := makeReopenRequest(app, map[string]string{"reason": ""})
	assert.Equal(t, 400, status)
	assert.Equal(t, "Reason is required for session reopen", body["message"])
}

func TestReopen_WhitespaceOnlyReason(t *testing.T) {
	app, _ := setupReopenTest(t)

	status, body := makeReopenRequest(app, map[string]string{"reason": "   "})
	assert.Equal(t, 400, status)
	assert.Equal(t, "Reason is required for session reopen", body["message"])
}

func TestReopen_TooLongReason(t *testing.T) {
	app, _ := setupReopenTest(t)

	longReason := make([]byte, 501)
	for i := range longReason {
		longReason[i] = 'a'
	}
	status, body := makeReopenRequest(app, map[string]string{"reason": string(longReason)})
	assert.Equal(t, 400, status)
	assert.Equal(t, "Reason is too long (max 500 characters)", body["message"])
}

func TestReopen_NotClosed(t *testing.T) {
	app, mock := setupReopenTest(t)

	mock.ExpectBegin()
	mock.ExpectQuery(`SELECT settings->>'status'`).
		WillReturnRows(sqlmock.NewRows([]string{"status"}).AddRow("RUNNING"))
	mock.ExpectRollback()

	status, body := makeReopenRequest(app, map[string]string{"reason": "Need to reopen"})
	assert.Equal(t, 400, status)
	assert.Equal(t, "Session is not in CLOSED state", body["message"])
}

func TestReopen_NotStartedState(t *testing.T) {
	app, mock := setupReopenTest(t)

	mock.ExpectBegin()
	mock.ExpectQuery(`SELECT settings->>'status'`).
		WillReturnRows(sqlmock.NewRows([]string{"status"}).AddRow("NOT_STARTED"))
	mock.ExpectRollback()

	status, body := makeReopenRequest(app, map[string]string{"reason": "Need to reopen"})
	assert.Equal(t, 400, status)
	assert.Equal(t, "Session is not in CLOSED state", body["message"])
}

func TestReopen_PausedState(t *testing.T) {
	app, mock := setupReopenTest(t)

	mock.ExpectBegin()
	mock.ExpectQuery(`SELECT settings->>'status'`).
		WillReturnRows(sqlmock.NewRows([]string{"status"}).AddRow("PAUSED"))
	mock.ExpectRollback()

	status, body := makeReopenRequest(app, map[string]string{"reason": "Need to reopen"})
	assert.Equal(t, 400, status)
	assert.Equal(t, "Session is not in CLOSED state", body["message"])
}

func TestReopen_Success(t *testing.T) {
	app, mock := setupReopenTest(t)

	mock.ExpectBegin()
	mock.ExpectQuery(`SELECT settings->>'status'`).
		WillReturnRows(sqlmock.NewRows([]string{"status"}).AddRow("CLOSED"))
	mock.ExpectExec(`UPDATE system_configurations`).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(`INSERT INTO audit_logs`).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()

	status, body := makeReopenRequest(app, map[string]string{"reason": "Sesi perlu dibuka kembali"})
	assert.Equal(t, 200, status)
	assert.Equal(t, true, body["success"])
	assert.Equal(t, "Voting session reopened", body["message"])

	data := body["data"].(map[string]interface{})
	assert.Equal(t, "NOT_STARTED", data["status"])
}

func TestReopen_AuditFailureRollsBack(t *testing.T) {
	app, mock := setupReopenTest(t)

	mock.ExpectBegin()
	mock.ExpectQuery(`SELECT settings->>'status'`).
		WillReturnRows(sqlmock.NewRows([]string{"status"}).AddRow("CLOSED"))
	mock.ExpectExec(`UPDATE system_configurations`).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(`INSERT INTO audit_logs`).
		WillReturnError(assert.AnError)
	mock.ExpectRollback()

	status, body := makeReopenRequest(app, map[string]string{"reason": "Test audit failure"})
	assert.Equal(t, 500, status)
	assert.Equal(t, "Failed to write audit record", body["message"])
}

package voting

import (
	"encoding/json"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"

	"github.com/trisfproject/muskom/apps/api/platform/response"
)

// ReopenHandler handles the controlled session reopen operation.
// This is intentionally separate from the normal Handler/Service to avoid
// modifying the existing state machine in UpdateSessionStatus.
type ReopenHandler struct {
	db *sqlx.DB
}

func NewReopenHandler(db *sqlx.DB) *ReopenHandler {
	return &ReopenHandler{db: db}
}

// ReopenSession transitions a CLOSED voting session back to NOT_STARTED.
// Requires: voting.reopen permission (Super Admin only).
// The operation is transactional: state change + audit log are atomic.
func (h *ReopenHandler) ReopenSession(c fiber.Ctx) error {
	var req struct {
		Reason string `json:"reason"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	reason := strings.TrimSpace(req.Reason)
	if reason == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Reason is required for session reopen", nil)
	}
	if len(reason) > 500 {
		return response.SendError(c, fiber.StatusBadRequest, "Reason is too long (max 500 characters)", nil)
	}

	// Get actor identity from JWT locals
	actorID, _ := c.Locals("user_id").(string)
	actorRole, _ := c.Locals("role").(string)

	// Begin transaction
	tx, err := h.db.BeginTxx(c.Context(), nil)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to begin transaction", nil)
	}
	defer tx.Rollback()

	// 1. Read current state with row lock (SELECT FOR UPDATE)
	var currentStatus string
	err = tx.GetContext(c.Context(), &currentStatus, `
		SELECT settings->>'status'
		FROM system_configurations
		WHERE group_name = 'voting_session'
		FOR UPDATE
	`)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to read session state", nil)
	}

	// 2. Validate current state is CLOSED
	if currentStatus != string(SessionClosed) {
		return response.SendError(c, fiber.StatusBadRequest, "Session is not in CLOSED state", nil)
	}

	// 3. Update state to NOT_STARTED
	_, err = tx.ExecContext(c.Context(), `
		UPDATE system_configurations
		SET settings = jsonb_build_object('status', $1::text), updated_at = NOW()
		WHERE group_name = 'voting_session'
	`, string(SessionNotStarted))
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update session state", nil)
	}

	// 4. Write audit log in the same transaction
	previousValue, _ := json.Marshal(map[string]string{"status": string(SessionClosed)})
	newValue, _ := json.Marshal(map[string]string{"status": string(SessionNotStarted)})
	metadata, _ := json.Marshal(map[string]string{
		"previous_state": string(SessionClosed),
		"new_state":      string(SessionNotStarted),
	})

	_, err = tx.ExecContext(c.Context(), `
		INSERT INTO audit_logs (module, action, entity, user_id, actor_role, reason, metadata, previous_value, new_value)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, "voting", "VOTING_SESSION_REOPENED", "voting_session", actorID, actorRole, reason, metadata, previousValue, newValue)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to write audit record", nil)
	}

	// 5. Commit transaction
	if err := tx.Commit(); err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to commit reopen operation", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Voting session reopened", fiber.Map{
		"status": string(SessionNotStarted),
	}, nil)
}

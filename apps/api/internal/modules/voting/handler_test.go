package voting

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func setupTestApp(mockSvc Service) *fiber.App {
	app := fiber.New()
	handler := NewHandler(mockSvc, validator.New())

	// Middleware to inject locals
	app.Use(func(c fiber.Ctx) error {
		userID := c.Get("X-User-ID")
		if userID != "" {
			c.Locals("user_id", userID)
		}
		return c.Next()
	})

	app.Post("/voting", handler.SubmitVote)
	app.Get("/voting/status", handler.GetMyVoteStatus)

	app.Get("/admin/voting", handler.AdminListVotes)
	app.Get("/admin/voting/statistics", handler.AdminGetVoteStatistics)
	app.Get("/admin/voting/:id", handler.AdminGetVote)

	return app
}

func TestHandler_SubmitVote(t *testing.T) {
	mockSvc := new(MockService)
	app := setupTestApp(mockSvc)

	uID := uuid.New()
	eID := uuid.New()
	cID := uuid.New()

	t.Run("Success", func(t *testing.T) {
		reqBody := SubmitVoteRequest{EventID: eID, CandidateID: cID}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("SubmitVote", mock.Anything, uID, mock.Anything).Return(nil).Once()

		req := httptest.NewRequest("POST", "/voting", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-User-ID", uID.String())
		resp, _ := app.Test(req)
		assert.Equal(t, 201, resp.StatusCode)
	})

	t.Run("MissingUserID", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/voting", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 401, resp.StatusCode)
	})

	t.Run("InvalidBody", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/voting", bytes.NewReader([]byte("{invalid}")))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-User-ID", uID.String())
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("ValidationError", func(t *testing.T) {
		reqBody := SubmitVoteRequest{} // missing required fields
		body, _ := json.Marshal(reqBody)

		req := httptest.NewRequest("POST", "/voting", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-User-ID", uID.String())
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("ServiceError_AlreadyVoted", func(t *testing.T) {
		reqBody := SubmitVoteRequest{EventID: eID, CandidateID: cID}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("SubmitVote", mock.Anything, uID, mock.Anything).Return(ErrAlreadyVoted).Once()

		req := httptest.NewRequest("POST", "/voting", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-User-ID", uID.String())
		resp, _ := app.Test(req)
		assert.Equal(t, 409, resp.StatusCode)
	})

	t.Run("ServiceError_ParticipantNotFound", func(t *testing.T) {
		reqBody := SubmitVoteRequest{EventID: eID, CandidateID: cID}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("SubmitVote", mock.Anything, uID, mock.Anything).Return(ErrParticipantNotFound).Once()

		req := httptest.NewRequest("POST", "/voting", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-User-ID", uID.String())
		resp, _ := app.Test(req)
		assert.Equal(t, 403, resp.StatusCode)
	})

	t.Run("ServiceError_NotCheckedIn", func(t *testing.T) {
		reqBody := SubmitVoteRequest{EventID: eID, CandidateID: cID}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("SubmitVote", mock.Anything, uID, mock.Anything).Return(ErrNotCheckedIn).Once()

		req := httptest.NewRequest("POST", "/voting", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-User-ID", uID.String())
		resp, _ := app.Test(req)
		assert.Equal(t, 403, resp.StatusCode)
	})

	t.Run("ServiceError_VotingClosed", func(t *testing.T) {
		reqBody := SubmitVoteRequest{EventID: eID, CandidateID: cID}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("SubmitVote", mock.Anything, uID, mock.Anything).Return(ErrVotingClosed).Once()

		req := httptest.NewRequest("POST", "/voting", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-User-ID", uID.String())
		resp, _ := app.Test(req)
		assert.Equal(t, 403, resp.StatusCode)
	})

	t.Run("ServiceError_InvalidCandidate", func(t *testing.T) {
		reqBody := SubmitVoteRequest{EventID: eID, CandidateID: cID}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("SubmitVote", mock.Anything, uID, mock.Anything).Return(ErrInvalidCandidate).Once()

		req := httptest.NewRequest("POST", "/voting", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-User-ID", uID.String())
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("ServiceError_Internal", func(t *testing.T) {
		reqBody := SubmitVoteRequest{EventID: eID, CandidateID: cID}
		body, _ := json.Marshal(reqBody)

		mockSvc.On("SubmitVote", mock.Anything, uID, mock.Anything).Return(errors.New("db err")).Once()

		req := httptest.NewRequest("POST", "/voting", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-User-ID", uID.String())
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_GetMyVoteStatus(t *testing.T) {
	mockSvc := new(MockService)
	app := setupTestApp(mockSvc)

	uID := uuid.New()
	eID := uuid.New()

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("GetMyVoteStatus", mock.Anything, uID, eID).Return(&MyVoteStatusResponse{}, nil).Once()

		req := httptest.NewRequest("GET", "/voting/status?event_id="+eID.String(), nil)
		req.Header.Set("X-User-ID", uID.String())
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("MissingUserID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/voting/status?event_id="+eID.String(), nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 401, resp.StatusCode)
	})

	t.Run("MissingEventID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/voting/status", nil)
		req.Header.Set("X-User-ID", uID.String())
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("InvalidEventID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/voting/status?event_id=invalid", nil)
		req.Header.Set("X-User-ID", uID.String())
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("ServiceError", func(t *testing.T) {
		mockSvc.On("GetMyVoteStatus", mock.Anything, uID, eID).Return((*MyVoteStatusResponse)(nil), errors.New("err")).Once()

		req := httptest.NewRequest("GET", "/voting/status?event_id="+eID.String(), nil)
		req.Header.Set("X-User-ID", uID.String())
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_AdminListVotes(t *testing.T) {
	mockSvc := new(MockService)
	app := setupTestApp(mockSvc)

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("AdminListVotes", mock.Anything, mock.Anything).Return(&AdminListVotesResponse{}, nil).Once()

		req := httptest.NewRequest("GET", "/admin/voting", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("ServiceError", func(t *testing.T) {
		mockSvc.On("AdminListVotes", mock.Anything, mock.Anything).Return((*AdminListVotesResponse)(nil), errors.New("err")).Once()

		req := httptest.NewRequest("GET", "/admin/voting", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_AdminGetVote(t *testing.T) {
	mockSvc := new(MockService)
	app := setupTestApp(mockSvc)

	vID := uuid.New()

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("AdminGetVote", mock.Anything, vID).Return(&AdminVoteResponse{}, nil).Once()

		req := httptest.NewRequest("GET", "/admin/voting/"+vID.String(), nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("InvalidID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/admin/voting/invalid", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockSvc.On("AdminGetVote", mock.Anything, vID).Return((*AdminVoteResponse)(nil), ErrVoteNotFound).Once()

		req := httptest.NewRequest("GET", "/admin/voting/"+vID.String(), nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("InternalError", func(t *testing.T) {
		mockSvc.On("AdminGetVote", mock.Anything, vID).Return((*AdminVoteResponse)(nil), errors.New("err")).Once()

		req := httptest.NewRequest("GET", "/admin/voting/"+vID.String(), nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHandler_AdminGetVoteStatistics(t *testing.T) {
	mockSvc := new(MockService)
	app := setupTestApp(mockSvc)

	eID := uuid.New()

	t.Run("Success", func(t *testing.T) {
		mockSvc.On("AdminGetVoteStatistics", mock.Anything, eID).Return(&AdminVoteStatisticsResponse{}, nil).Once()

		req := httptest.NewRequest("GET", "/admin/voting/statistics?event_id="+eID.String(), nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("MissingEventID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/admin/voting/statistics", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("InvalidEventID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/admin/voting/statistics?event_id=invalid", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("ServiceError", func(t *testing.T) {
		mockSvc.On("AdminGetVoteStatistics", mock.Anything, eID).Return((*AdminVoteStatisticsResponse)(nil), errors.New("err")).Once()

		req := httptest.NewRequest("GET", "/admin/voting/statistics?event_id="+eID.String(), nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

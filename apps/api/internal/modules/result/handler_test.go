package result

import (
	"context"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockService struct {
	mock.Mock
}

func (m *MockService) GetElectionResults(ctx context.Context, eventID uuid.UUID) (*ElectionResultResponse, error) {
	args := m.Called(ctx, eventID)
	if args.Get(0) != nil {
		return args.Get(0).(*ElectionResultResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func TestHandler_AdminGetResults(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Get("/api/v1/admin/events/:eventId/results", handler.AdminGetResults)

	eventID := uuid.New()

	t.Run("Invalid Event ID", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodGet, "/api/v1/admin/events/invalid/results", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Event Not Found", func(t *testing.T) {
		mockSvc.On("GetElectionResults", mock.Anything, eventID).Return(nil, ErrEventNotFound).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/api/v1/admin/events/"+eventID.String()+"/results", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusNotFound, resp.StatusCode)
	})

	t.Run("Internal Error", func(t *testing.T) {
		mockSvc.On("GetElectionResults", mock.Anything, eventID).Return(nil, errors.New("db error")).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/api/v1/admin/events/"+eventID.String()+"/results", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})

	t.Run("Success", func(t *testing.T) {
		res := &ElectionResultResponse{
			EventID:    eventID,
			TotalVotes: 100,
		}
		mockSvc.On("GetElectionResults", mock.Anything, eventID).Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/api/v1/admin/events/"+eventID.String()+"/results", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		var body map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&body)
		assert.Equal(t, "Election results retrieved successfully", body["message"])
	})
}

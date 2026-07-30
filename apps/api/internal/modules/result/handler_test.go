package result

import (
	"context"
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

func (m *MockService) GetElectionOverview(ctx context.Context, eventID uuid.UUID) (*ElectionOverviewResponse, error) {
	args := m.Called(ctx, eventID)
	if args.Get(0) != nil {
		return args.Get(0).(*ElectionOverviewResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockService) GetAuditLogs(ctx context.Context, eventID uuid.UUID, req AdminListAuditRequest) (*AdminListAuditResponse, error) {
	args := m.Called(ctx, eventID, req)
	if args.Get(0) != nil {
		return args.Get(0).(*AdminListAuditResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func TestHandler_AdminEndpoints(t *testing.T) {
	app := fiber.New()
	mockSvc := new(MockService)
	handler := NewHandler(mockSvc)

	app.Get("/api/v1/admin/events/:eventId/results/overview", handler.AdminGetOverview)
	app.Get("/api/v1/admin/events/:eventId/results/summary", handler.AdminGetSummary)

	eventID := uuid.New()

	t.Run("Overview Success", func(t *testing.T) {
		res := &ElectionOverviewResponse{
			EventID: eventID,
		}
		mockSvc.On("GetElectionOverview", mock.Anything, eventID).Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/api/v1/admin/events/"+eventID.String()+"/results/overview", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Summary Success", func(t *testing.T) {
		res := &ElectionResultResponse{
			EventID: eventID,
		}
		mockSvc.On("GetElectionResults", mock.Anything, eventID).Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/api/v1/admin/events/"+eventID.String()+"/results/summary", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})
	app.Get("/api/v1/admin/events/:eventId/results/export/csv", handler.AdminExportResultCSV)
	app.Get("/api/v1/admin/events/:eventId/results/export/xlsx", handler.AdminExportResultXLSX)

	t.Run("CSV Export Success", func(t *testing.T) {
		res := &ElectionResultResponse{
			EventID:    eventID,
			EventName:  "Test Event",
			TotalVotes: 100,
			WinnerName: "Candidate A",
			Candidates: []CandidateResult{
				{CandidateName: "Candidate A", VoteCount: 60, Percentage: 60.0},
				{CandidateName: "Candidate B", VoteCount: 40, Percentage: 40.0},
			},
		}
		mockSvc.On("GetElectionResults", mock.Anything, eventID).Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/api/v1/admin/events/"+eventID.String()+"/results/export/csv", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
		assert.Equal(t, "text/csv", resp.Header.Get("Content-Type"))
	})

	t.Run("XLSX Export Success", func(t *testing.T) {
		res := &ElectionResultResponse{
			EventID:    eventID,
			EventName:  "Test Event",
			TotalVotes: 100,
			IsTie:      true,
			Candidates: []CandidateResult{
				{CandidateName: "Candidate A", VoteCount: 50, Percentage: 50.0},
				{CandidateName: "Candidate B", VoteCount: 50, Percentage: 50.0},
			},
		}
		mockSvc.On("GetElectionResults", mock.Anything, eventID).Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/api/v1/admin/events/"+eventID.String()+"/results/export/xlsx", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
		assert.Equal(t, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", resp.Header.Get("Content-Type"))
	})

	t.Run("Export Empty Event", func(t *testing.T) {
		res := &ElectionResultResponse{
			EventID:    eventID,
			EventName:  "Empty Event",
			TotalVotes: 0,
			WinnerName: "",
			Candidates: []CandidateResult{},
		}
		mockSvc.On("GetElectionResults", mock.Anything, eventID).Return(res, nil).Once()

		req := httptest.NewRequest(fiber.MethodGet, "/api/v1/admin/events/"+eventID.String()+"/results/export/csv", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})
}

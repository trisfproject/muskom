package result

import (
	"encoding/csv"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/trisfproject/muskom/apps/api/platform/response"
	"github.com/xuri/excelize/v2"
)

type Handler interface {
	AdminGetOverview(c fiber.Ctx) error
	AdminGetCandidates(c fiber.Ctx) error
	AdminGetSummary(c fiber.Ctx) error
	AdminGetAudit(c fiber.Ctx) error
	AdminExportResultCSV(c fiber.Ctx) error
	AdminExportResultXLSX(c fiber.Ctx) error
	// PublicGetResults is intentionally omitted pending PRD publication timing rules
}

type handler struct {
	svc Service
}

func NewHandler(svc Service) Handler {
	return &handler{svc: svc}
}

func (h *handler) AdminGetOverview(c fiber.Ctx) error {
	eventIDParam := c.Params("eventId")
	eventID, err := uuid.Parse(eventIDParam)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid event ID format", nil)
	}

	res, err := h.svc.GetElectionOverview(c.Context(), eventID)
	if err != nil {
		if err == ErrEventNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Event not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get overview", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Election overview retrieved successfully", res, nil)
}

func (h *handler) AdminGetCandidates(c fiber.Ctx) error {
	eventIDParam := c.Params("eventId")
	eventID, err := uuid.Parse(eventIDParam)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid event ID format", nil)
	}

	res, err := h.svc.GetElectionResults(c.Context(), eventID)
	if err != nil {
		if err == ErrEventNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Event not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to calculate election results", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Election candidates retrieved successfully", res.Candidates, nil)
}

func (h *handler) AdminGetSummary(c fiber.Ctx) error {
	eventIDParam := c.Params("eventId")
	eventID, err := uuid.Parse(eventIDParam)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid event ID format", nil)
	}

	res, err := h.svc.GetElectionResults(c.Context(), eventID)
	if err != nil {
		if err == ErrEventNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Event not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to calculate election results", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Election summary retrieved successfully", res, nil)
}

func (h *handler) AdminGetAudit(c fiber.Ctx) error {
	eventIDParam := c.Params("eventId")
	eventID, err := uuid.Parse(eventIDParam)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid event ID format", nil)
	}

	req := AdminListAuditRequest{}
	if err := c.Bind().Query(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid query parameters", nil)
	}

	res, err := h.svc.GetAuditLogs(c.Context(), eventID, req)
	if err != nil {
		if err == ErrEventNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Event not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve audit logs", nil)
	}

	meta := fiber.Map{
		"total":       res.Total,
		"page":        res.Page,
		"total_pages": res.TotalPages,
	}
	return response.SendSuccess(c, fiber.StatusOK, "Election audit logs retrieved successfully", res.Data, meta)
}

func (h *handler) AdminExportResultCSV(c fiber.Ctx) error {
	eventIDParam := c.Params("eventId")
	eventID, err := uuid.Parse(eventIDParam)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid event ID format", nil)
	}

	res, err := h.svc.GetElectionResults(c.Context(), eventID)
	if err != nil {
		if err == ErrEventNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Event not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve results for export", nil)
	}

	c.Set("Content-Type", "text/csv")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"election_results_%s.csv\"", eventID.String()))

	writer := csv.NewWriter(c.Response().BodyWriter())

	// Write meta info
	writer.Write([]string{"Event Name", res.EventName})
	writer.Write([]string{"Event ID", res.EventID.String()})
	writer.Write([]string{"Export Timestamp", time.Now().Format(time.RFC3339)})
	writer.Write([]string{"Total Votes", fmt.Sprintf("%d", res.TotalVotes)})

	status := "Winner: " + res.WinnerName
	if res.IsTie {
		status = "TIE - No single winner"
	} else if res.WinnerName == "" {
		status = "No votes cast"
	}
	writer.Write([]string{"Status", status})
	writer.Write([]string{}) // Empty row

	// Write Headers
	writer.Write([]string{"Rank", "Candidate Name", "Vote Count", "Percentage"})

	rank := 1
	prevVotes := -1
	for i, cand := range res.Candidates {
		if prevVotes != -1 && cand.VoteCount < prevVotes {
			rank = i + 1
		} else if prevVotes == -1 {
			rank = 1
		}

		writer.Write([]string{
			fmt.Sprintf("%d", rank),
			cand.CandidateName,
			fmt.Sprintf("%d", cand.VoteCount),
			fmt.Sprintf("%.2f%%", cand.Percentage),
		})
		prevVotes = cand.VoteCount
	}

	writer.Flush()
	return nil
}

func (h *handler) AdminExportResultXLSX(c fiber.Ctx) error {
	eventIDParam := c.Params("eventId")
	eventID, err := uuid.Parse(eventIDParam)
	if err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid event ID format", nil)
	}

	res, err := h.svc.GetElectionResults(c.Context(), eventID)
	if err != nil {
		if err == ErrEventNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Event not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve results for export", nil)
	}

	f := excelize.NewFile()
	sheet := "Sheet1"

	// Meta info
	f.SetCellValue(sheet, "A1", "Event Name")
	f.SetCellValue(sheet, "B1", res.EventName)

	f.SetCellValue(sheet, "A2", "Event ID")
	f.SetCellValue(sheet, "B2", res.EventID.String())

	f.SetCellValue(sheet, "A3", "Export Timestamp")
	f.SetCellValue(sheet, "B3", time.Now().Format(time.RFC3339))

	f.SetCellValue(sheet, "A4", "Total Votes")
	f.SetCellValue(sheet, "B4", res.TotalVotes)

	status := "Winner: " + res.WinnerName
	if res.IsTie {
		status = "TIE - No single winner"
	} else if res.WinnerName == "" {
		status = "No votes cast"
	}
	f.SetCellValue(sheet, "A5", "Status")
	f.SetCellValue(sheet, "B5", status)

	// Headers
	f.SetCellValue(sheet, "A7", "Rank")
	f.SetCellValue(sheet, "B7", "Candidate Name")
	f.SetCellValue(sheet, "C7", "Vote Count")
	f.SetCellValue(sheet, "D7", "Percentage")

	rank := 1
	prevVotes := -1
	row := 8
	for i, cand := range res.Candidates {
		if prevVotes != -1 && cand.VoteCount < prevVotes {
			rank = i + 1
		} else if prevVotes == -1 {
			rank = 1
		}

		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), rank)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), cand.CandidateName)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), cand.VoteCount)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), cand.Percentage)

		prevVotes = cand.VoteCount
		row++
	}

	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"election_results_%s.xlsx\"", eventID.String()))

	if err := f.Write(c.Response().BodyWriter()); err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to generate Excel file", nil)
	}

	return nil
}

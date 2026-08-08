package audit

import (
	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

type Handler struct {
	service AuditService
}

func NewHandler(service AuditService) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Search(c fiber.Ctx) error {
	var req AuditListRequest
	if err := c.Bind().Query(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid query parameters", nil)
	}

	if req.Page <= 0 {
		req.Page = 1
	}
	if req.Limit <= 0 {
		req.Limit = 10
	} else if req.Limit > 50 {
		req.Limit = 50
	}

	filter := AuditFilter{
		Page:      req.Page,
		Limit:     req.Limit,
		Module:    req.Module,
		Action:    req.Action,
		Entity:    req.Entity,
		EntityID:  req.EntityID,
		ActorID:   req.ActorID,
		StartDate: req.StartDate,
		EndDate:   req.EndDate,
	}

	operatorID, ok := c.Locals("user_id").(string)
	if !ok || operatorID == "" {
		return response.SendError(c, fiber.StatusUnauthorized, "Unauthorized access", nil)
	}

	items, total, err := h.service.Search(c.Context(), filter, operatorID)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	// Map domain entities to DTO responses
	var responses []AuditDetailResponse
	for _, item := range items {
		responses = append(responses, AuditDetailResponse{
			ID:            item.ID,
			Module:        string(item.Module),
			Entity:        item.Entity,
			EntityID:      item.EntityID,
			Action:        string(item.Action),
			ActorID:       item.ActorID,
			ActorRole:     item.ActorRole,
			Reason:        item.Reason,
			IPAddress:     item.IPAddress,
			UserAgent:     item.UserAgent,
			Metadata:      item.Metadata,
			PreviousValue: item.PreviousValue,
			NewValue:      item.NewValue,
			CorrelationID: item.CorrelationID,
			CreatedAt:     item.CreatedAt,
		})
	}

	if responses == nil {
		responses = []AuditDetailResponse{}
	}

	hasMore := total > (req.Page * req.Limit)

	return response.SendSuccess(c, fiber.StatusOK, "Audit logs retrieved", map[string]interface{}{
		"items":    responses,
		"total":    total,
		"page":     req.Page,
		"limit":    req.Limit,
		"has_more": hasMore,
	}, nil)
}

func (h *Handler) GetByID(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Audit ID is required", nil)
	}

	operatorID, ok := c.Locals("user_id").(string)
	if !ok || operatorID == "" {
		return response.SendError(c, fiber.StatusUnauthorized, "Unauthorized access", nil)
	}

	item, err := h.service.GetByID(c.Context(), id, operatorID)
	if err != nil {
		return response.SendError(c, fiber.StatusNotFound, "Audit record not found", nil)
	}

	res := AuditDetailResponse{
		ID:            item.ID,
		Module:        string(item.Module),
		Entity:        item.Entity,
		EntityID:      item.EntityID,
		Action:        string(item.Action),
		ActorID:       item.ActorID,
		ActorRole:     item.ActorRole,
		Reason:        item.Reason,
		IPAddress:     item.IPAddress,
		UserAgent:     item.UserAgent,
		Metadata:      item.Metadata,
		PreviousValue: item.PreviousValue,
		NewValue:      item.NewValue,
		CorrelationID: item.CorrelationID,
		CreatedAt:     item.CreatedAt,
	}

	return response.SendSuccess(c, fiber.StatusOK, "Audit log retrieved", res, nil)
}

func (h *Handler) Export(c fiber.Ctx) error {
	var req AuditListRequest
	if err := c.Bind().Query(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid query parameters", nil)
	}

	filter := AuditFilter{
		Page:      1,
		Limit:     10000, // Large limit for export
		Module:    req.Module,
		Action:    req.Action,
		Entity:    req.Entity,
		EntityID:  req.EntityID,
		ActorID:   req.ActorID,
		StartDate: req.StartDate,
		EndDate:   req.EndDate,
	}

	operatorID, ok := c.Locals("user_id").(string)
	if !ok || operatorID == "" {
		return response.SendError(c, fiber.StatusUnauthorized, "Unauthorized access", nil)
	}

	items, _, err := h.service.Search(c.Context(), filter, operatorID)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	format := c.Query("format", "json")
	if format == "csv" {
		// Basic CSV Generation
		c.Set("Content-Type", "text/csv")
		c.Set("Content-Disposition", "attachment; filename=audit_export.csv")

		csvData := "ID,Module,Entity,EntityID,Action,ActorID,ActorRole,CreatedAt\n"
		for _, item := range items {
			entityID := ""
			if item.EntityID != nil {
				entityID = *item.EntityID
			}
			csvData += item.ID + "," + string(item.Module) + "," + item.Entity + "," + entityID + "," + string(item.Action) + ","
			if item.ActorID != nil {
				csvData += *item.ActorID + ","
			} else {
				csvData += ","
			}
			if item.ActorRole != nil {
				csvData += *item.ActorRole + ","
			} else {
				csvData += ","
			}
			csvData += item.CreatedAt.String() + "\n"
		}

		return c.SendString(csvData)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Exported successfully", items, nil)
}

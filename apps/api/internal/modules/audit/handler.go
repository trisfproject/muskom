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
			ID:        item.ID,
			Module:    string(item.Module),
			Entity:    item.Entity,
			EntityID:  item.EntityID,
			Action:    string(item.Action),
			ActorID:   item.ActorID,
			ActorRole: item.ActorRole,
			Reason:    item.Reason,
			IPAddress: item.IPAddress,
			UserAgent: item.UserAgent,
			Metadata:  item.Metadata,
			CreatedAt: item.CreatedAt,
		})
	}
	
	if responses == nil {
		responses = []AuditDetailResponse{}
	}

	return response.SendSuccess(c, fiber.StatusOK, "Audit logs retrieved", map[string]interface{}{
		"items": responses,
		"total": total,
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
		ID:        item.ID,
		Module:    string(item.Module),
		Entity:    item.Entity,
		EntityID:  item.EntityID,
		Action:    string(item.Action),
		ActorID:   item.ActorID,
		ActorRole: item.ActorRole,
		Reason:    item.Reason,
		IPAddress: item.IPAddress,
		UserAgent: item.UserAgent,
		Metadata:  item.Metadata,
		CreatedAt: item.CreatedAt,
	}

	return response.SendSuccess(c, fiber.StatusOK, "Audit log retrieved", res, nil)
}

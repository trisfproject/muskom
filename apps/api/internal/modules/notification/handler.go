package notification

import (
	"strconv"
	"github.com/fasthttp/websocket"
	"github.com/gofiber/fiber/v3"
	"github.com/valyala/fasthttp"

	"github.com/trisfproject/muskom/apps/api/platform/realtime"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) ListJobs(c fiber.Ctx) error {

	jobs, err := h.service.ListJobs(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get jobs", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Jobs retrieved", jobs, nil)
}

func (h *Handler) ListHistory(c fiber.Ctx) error {
	pageStr := c.Query("page", "1")
	page, _ := strconv.Atoi(pageStr)
	if page <= 0 {
		page = 1
	}

	limitStr := c.Query("limit", "10")
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 {
		limit = 10
	} else if limit > 50 {
		limit = 50
	}

	history, total, err := h.service.ListHistory(c.Context(), page, limit)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get history", nil)
	}

	hasMore := total > (page * limit)

	return response.SendSuccess(c, fiber.StatusOK, "History retrieved", map[string]interface{}{
		"items":    history,
		"total":    total,
		"page":     page,
		"limit":    limit,
		"has_more": hasMore,
	}, nil)
}

func (h *Handler) ListTemplates(c fiber.Ctx) error {
	tpls, err := h.service.ListTemplates(c.Context())
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get templates", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Templates retrieved", tpls, nil)
}

func (h *Handler) GetTemplate(c fiber.Ctx) error {
	id := c.Params("id")
	tpl, err := h.service.GetTemplate(c.Context(), id)
	if err != nil {
		return response.SendError(c, fiber.StatusNotFound, "Template not found", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Template retrieved", tpl, nil)
}

func (h *Handler) UpdateTemplate(c fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Subject *string `json:"subject"`
		Body    string  `json:"body"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}
	
	err := h.service.UpdateTemplate(c.Context(), id, req.Subject, req.Body)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to update template", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Template updated", nil, nil)
}

func (h *Handler) RetryJob(c fiber.Ctx) error {
	id := c.Params("id")
	err := h.service.RetryJob(c.Context(), id)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to retry job", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Job queued for retry", nil, nil)
}

func (h *Handler) TestSMTP(c fiber.Ctx) error {
	var req struct {
		Email string `json:"email"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}
	
	err := h.service.TestSMTP(c.Context(), req.Email)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to send test email", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Test email queued", nil, nil)
}

func (h *Handler) TestTemplate(c fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Email string `json:"email"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request payload", nil)
	}

	err := h.service.TestTemplate(c.Context(), id, req.Email)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to send test template", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Test template email queued", nil, nil)
}

var upgrader = websocket.FastHTTPUpgrader{
	CheckOrigin: func(ctx *fasthttp.RequestCtx) bool { return true }, // Or properly check origin
}

func (h *Handler) WebSocketHandler(hub *realtime.Hub) fiber.Handler {
	return func(c fiber.Ctx) error {
		if websocket.FastHTTPIsWebSocketUpgrade(c.RequestCtx()) {
			// Extract user from locals if we have auth middleware before this
			userID := c.Locals("user_id")
			var uid string
			if userID != nil {
				uid = userID.(string)
			}
			clientID := c.Query("client_id", "anonymous")

			err := upgrader.Upgrade(c.RequestCtx(), func(conn *websocket.Conn) {
				client := &realtime.Client{
					ID:     clientID,
					UserID: uid,
					Conn:   conn,
					Send:   make(chan []byte, 256),
				}
				hub.Register() <- client
				go client.WritePump()
				client.ReadPump(hub)
			})
			return err
		}
		return fiber.ErrUpgradeRequired
	}
}

func (h *Handler) ListInAppNotifications(c fiber.Ctx) error {
	var uid *string
	userID := c.Locals("user_id")
	if userID != nil {
		u := userID.(string)
		uid = &u
	}
	
	limit := 50
	offset := 0
	if l := c.Query("limit"); l != "" {
		if pl, err := strconv.Atoi(l); err == nil && pl > 0 {
			limit = pl
		}
	}
	if o := c.Query("offset"); o != "" {
		if po, err := strconv.Atoi(o); err == nil && po >= 0 {
			offset = po
		}
	}

	notifs, total, err := h.service.ListInAppNotifications(c.Context(), uid, limit, offset)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get notifications", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Notifications retrieved", fiber.Map{
		"items": notifs,
		"total": total,
	}, nil)
}

func (h *Handler) GetUnreadInAppCount(c fiber.Ctx) error {
	var uid *string
	userID := c.Locals("user_id")
	if userID != nil {
		u := userID.(string)
		uid = &u
	}

	count, err := h.service.GetUnreadInAppCount(c.Context(), uid)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to get unread count", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Unread count retrieved", fiber.Map{
		"count": count,
	}, nil)
}

func (h *Handler) MarkInAppRead(c fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.MarkInAppRead(c.Context(), id); err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to mark as read", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Notification marked as read", nil, nil)
}

func (h *Handler) MarkAllInAppRead(c fiber.Ctx) error {
	var uid *string
	userID := c.Locals("user_id")
	if userID != nil {
		u := userID.(string)
		uid = &u
	}

	if err := h.service.MarkAllInAppRead(c.Context(), uid); err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to mark all as read", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "All notifications marked as read", nil, nil)
}

func (h *Handler) DeleteInAppNotification(c fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.DeleteInAppNotification(c.Context(), id); err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to delete notification", nil)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Notification deleted", nil, nil)
}

func (h *Handler) PreviewMusyawarahReminder(c fiber.Ctx) error {
	res, err := h.service.PreviewMusyawarahReminder(c.Context())
	if err != nil {
		if err == ErrTemplateNotFound {
			return response.SendError(c, fiber.StatusNotFound, "Template event_musyawarah_reminder not found", nil)
		}
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to generate reminder preview", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Preview generated", res, nil)
}

func (h *Handler) BlastMusyawarahReminder(c fiber.Ctx) error {
	operatorID, ok := c.Locals("user_id").(string)
	if !ok || operatorID == "" {
		return response.SendError(c, fiber.StatusUnauthorized, "Unauthorized operator", nil)
	}

	queued, err := h.service.BlastMusyawarahReminder(c.Context(), operatorID)
	if err != nil {
		return response.SendError(c, fiber.StatusInternalServerError, "Failed to queue reminder blast", nil)
	}

	return response.SendSuccess(c, fiber.StatusOK, "Reminder blast queued successfully", fiber.Map{
		"queued_count": queued,
	}, nil)
}


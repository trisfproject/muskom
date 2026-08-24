package notification

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/platform/mailer"
	"github.com/trisfproject/muskom/apps/api/platform/realtime"
	"go.uber.org/zap"
)

func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, m mailer.Mailer, hub *realtime.Hub) Service {
	repo := NewRepository(db)
	registry := NewProviderRegistry(m, hub, repo)
	svc := NewService(repo, registry, log)
	handler := NewHandler(svc)

	router.Get("/jobs", handler.ListJobs)
	router.Get("/history", handler.ListHistory)
	router.Get("/templates", handler.ListTemplates)
	router.Get("/templates/:id", handler.GetTemplate)
	router.Put("/templates/:id", handler.UpdateTemplate)
	router.Post("/templates/:id/test", handler.TestTemplate)
	
	router.Post("/jobs/:id/retry", handler.RetryJob)
	router.Post("/smtp/test", handler.TestSMTP)
	
	router.Get("/musyawarah-reminder/preview", handler.PreviewMusyawarahReminder)
	router.Post("/musyawarah-reminder/blast", handler.BlastMusyawarahReminder)
	
	// In-App Notification Routes
	router.Get("/in-app", handler.ListInAppNotifications)
	router.Get("/in-app/unread-count", handler.GetUnreadInAppCount)
	router.Patch("/in-app/read-all", handler.MarkAllInAppRead)
	router.Patch("/in-app/:id/read", handler.MarkInAppRead)
	router.Delete("/in-app/:id", handler.DeleteInAppNotification)
	
	router.Get("/ws", handler.WebSocketHandler(hub))
	
	return svc
}

func SetupAdminRoutesWithService(router fiber.Router, svc Service, hub *realtime.Hub) {
	handler := NewHandler(svc)
	router.Get("/jobs", handler.ListJobs)
	router.Get("/history", handler.ListHistory)
	router.Get("/templates", handler.ListTemplates)
	router.Get("/templates/:id", handler.GetTemplate)
	router.Put("/templates/:id", handler.UpdateTemplate)
	router.Post("/templates/:id/test", handler.TestTemplate)
	
	router.Post("/jobs/:id/retry", handler.RetryJob)
	router.Post("/smtp/test", handler.TestSMTP)
	
	router.Get("/musyawarah-reminder/preview", handler.PreviewMusyawarahReminder)
	router.Post("/musyawarah-reminder/blast", handler.BlastMusyawarahReminder)
	
	// In-App Notification Routes
	router.Get("/in-app", handler.ListInAppNotifications)
	router.Get("/in-app/unread-count", handler.GetUnreadInAppCount)
	router.Patch("/in-app/read-all", handler.MarkAllInAppRead)
	router.Patch("/in-app/:id/read", handler.MarkInAppRead)
	router.Delete("/in-app/:id", handler.DeleteInAppNotification)
	
	router.Get("/ws", handler.WebSocketHandler(hub))
}

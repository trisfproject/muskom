package announcement

import (
	"github.com/gofiber/fiber/v3"
)


func RegisterRoutes(router fiber.Router, h *Handler, requireAuth fiber.Handler, requirePermission func(string) fiber.Handler) {
	// Public routes
	public := router.Group("/public/announcements")
	public.Get("/", h.ListPublicAnnouncements)
	public.Get("/:slug", h.GetPublicAnnouncement)

	// Admin routes
	admin := router.Group("/admin/announcements", requireAuth)
	
	// Announcements CRUD
	admin.Get("/", requirePermission("announcement.view"), h.ListAdminAnnouncements)
	admin.Post("/", requirePermission("announcement.create"), h.CreateAnnouncement)

	// Broadcasts — must be BEFORE /:id to avoid capture as UUID
	admin.Get("/broadcasts", requirePermission("broadcast.send"), h.ListBroadcastJobs)
	admin.Post("/:id/broadcast", requirePermission("broadcast.send"), h.CreateBroadcast)

	// Dynamic routes
	admin.Get("/:id", requirePermission("announcement.view"), h.GetAnnouncement)
	admin.Put("/:id", requirePermission("announcement.create"), h.UpdateAnnouncement)
	admin.Delete("/:id", requirePermission("announcement.delete"), h.DeleteAnnouncement)
}

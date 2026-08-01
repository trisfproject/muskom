package website

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

// SetupPublicRoutes registers endpoints for public landing page consumers.
func SetupPublicRoutes(router fiber.Router, db *sqlx.DB, strg storage.Storage, val *validator.Validator, log *zap.Logger) {
	repo := NewRepository(db)
	svc := NewService(repo, strg, log)
	handler := NewHandler(svc, val)

	router.Get("/home", handler.GetPublicHome)
	router.Get("/timeline", handler.GetPublicTimeline)
	router.Get("/announcements", handler.GetPublicAnnouncements)
	router.Get("/announcements/:slug", handler.GetPublicAnnouncementBySlug)
	router.Get("/footer", handler.GetPublicFooter)
}

// SetupAdminRoutes registers CRUD endpoints for Admin Website CMS.
func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, strg storage.Storage, val *validator.Validator, log *zap.Logger) {
	repo := NewRepository(db)
	svc := NewService(repo, strg, log)
	handler := NewHandler(svc, val)

	// General
	router.Get("/general", handler.GetAdminGeneral)
	router.Put("/general", handler.UpdateAdminGeneral)

	// Hero
	router.Get("/hero", handler.GetAdminHero)
	router.Put("/hero", handler.UpdateAdminHero)

	// Timeline
	router.Get("/timeline", handler.GetAdminTimeline)
	router.Post("/timeline", handler.CreateAdminTimeline)
	router.Put("/timeline/reorder", handler.ReorderAdminTimeline)
	router.Get("/timeline/:id", handler.GetAdminTimelineByID)
	router.Put("/timeline/:id", handler.UpdateAdminTimeline)
	router.Delete("/timeline/:id", handler.DeleteAdminTimeline)

	// Announcements
	router.Get("/announcements", handler.GetAdminAnnouncements)
	router.Post("/announcements", handler.CreateAdminAnnouncement)
	router.Get("/announcements/:id", handler.GetAdminAnnouncementByID)
	router.Put("/announcements/:id", handler.UpdateAdminAnnouncement)
	router.Delete("/announcements/:id", handler.DeleteAdminAnnouncement)

	// Candidate CMS
	router.Get("/candidate", handler.GetAdminCandidateSettings)
	router.Put("/candidate", handler.UpdateAdminCandidateSettings)

	// Footer
	router.Get("/footer", handler.GetAdminFooter)
	router.Put("/footer", handler.UpdateAdminFooter)
}

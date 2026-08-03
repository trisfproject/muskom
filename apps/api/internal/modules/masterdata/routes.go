package masterdata

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

// SetupAdminRoutes registers masterdata admin CRUD routes (JWT-protected upstream).
func SetupAdminRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger) {
	svc := NewService(db, log)
	h := NewHandler(svc)

	// Industrial Areas
	ia := router.Group("/industrial-areas")
	ia.Get("/", h.ListIndustrialAreas)
	ia.Post("/", h.CreateIndustrialArea)
	ia.Get("/:id", h.GetIndustrialArea)
	ia.Put("/:id", h.UpdateIndustrialArea)
	ia.Delete("/:id", h.DeleteIndustrialArea)
	ia.Patch("/:id/restore", h.RestoreIndustrialArea)

	// Companies
	co := router.Group("/companies")
	co.Get("/", h.ListCompanies)
	co.Post("/", h.CreateCompany)
	co.Get("/:id", h.GetCompany)
	co.Put("/:id", h.UpdateCompany)
	co.Delete("/:id", h.DeleteCompany)
	co.Patch("/:id/restore", h.RestoreCompany)

	// Job Titles
	jt := router.Group("/job-titles")
	jt.Get("/", h.ListJobTitles)
	jt.Post("/", h.CreateJobTitle)
	jt.Get("/:id", h.GetJobTitle)
	jt.Put("/:id", h.UpdateJobTitle)
	jt.Delete("/:id", h.DeleteJobTitle)
	jt.Patch("/:id/restore", h.RestoreJobTitle)

	// Departments
	dept := router.Group("/departments")
	dept.Get("/", h.ListDepartments)
	dept.Post("/", h.CreateDepartment)
	dept.Get("/:id", h.GetDepartment)
	dept.Put("/:id", h.UpdateDepartment)
	dept.Delete("/:id", h.DeleteDepartment)
	dept.Patch("/:id/restore", h.RestoreDepartment)
}

// SetupPublicRoutes registers read-only public master data endpoints (no auth).
func SetupPublicRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger) {
	svc := NewService(db, log)
	h := NewHandler(svc)

	router.Get("/industrial-areas", h.PublicListIndustrialAreas)
	router.Get("/companies", h.PublicListCompanies)
	router.Get("/job-titles", h.PublicListJobTitles)
	router.Get("/departments", h.PublicListDepartments)
}

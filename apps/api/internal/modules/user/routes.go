package user

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/internal/modules/rbac"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func SetupRoutes(router fiber.Router, db *sqlx.DB, log *zap.Logger, val *validator.Validator, checker rbac.PermissionChecker) {
	repo := NewRepository(db)
	svc := NewService(repo, log)
	handler := NewHandler(svc, val)

	// Self profile routes (accessible to any authenticated admin/operator/committee)
	router.Get("/me", handler.GetMe)
	router.Put("/me", handler.UpdateMe)
	router.Put("/me/password", handler.ChangePassword)

	// User management routes (requires system.manage permission and SUPER_ADMIN role)
	manage := router.Group("/", checker.RequirePermission("system.manage"), func(c fiber.Ctx) error {
		role, _ := c.Locals("role").(string)
		if role != "SUPER_ADMIN" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Access denied: Only SUPER_ADMIN can manage users",
			})
		}
		return c.Next()
	})
	manage.Get("/", handler.List)
	manage.Post("/", handler.Create)
	manage.Get("/roles", handler.GetRoles)
	manage.Get("/:id", handler.Get)
	manage.Patch("/:id/role", handler.UpdateRole)
	manage.Patch("/:id/status", handler.UpdateStatus)
	manage.Post("/:id/password-reset", handler.ResetPassword)
}

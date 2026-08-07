package rbac

import (
	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

type Handler struct {
	authSvc AuthorizationService
}

func NewHandler(authSvc AuthorizationService) *Handler {
	return &Handler{authSvc: authSvc}
}

func (h *Handler) GetMyPermissions(c fiber.Ctx) error {
	roleCode, ok := c.Locals("role").(string)
	if !ok || roleCode == "" {
		// If no role, assume no permissions
		return response.SendSuccess(c, fiber.StatusOK, "Permissions retrieved", []string{}, nil)
	}

	perms := h.authSvc.GetPermissionsForRole(roleCode)

	return response.SendSuccess(c, fiber.StatusOK, "Permissions retrieved", perms, nil)
}

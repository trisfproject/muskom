package rbac

import (
	"context"

	"github.com/gofiber/fiber/v3"
)

// Role struct maps the DB roles table
type Role struct {
	ID          string `json:"id" db:"id"`
	Code        string `json:"code" db:"code"`
	Name        string `json:"name" db:"name"`
	Description string `json:"description" db:"description"`
}

// Permission struct maps the DB permissions table
type Permission struct {
	ID          string `json:"id" db:"id"`
	Code        string `json:"code" db:"code"`
	Module      string `json:"module" db:"module"`
	Description string `json:"description" db:"description"`
}

// AuthorizationService handles resolving permissions based on the role mapping
type AuthorizationService interface {
	HasPermission(roleCode, permissionCode string) bool
	GetPermissionsForRole(roleCode string) []string
	RefreshMatrix(ctx context.Context) error
}

// RBACRepository accesses the DB for role and permission data
type RBACRepository interface {
	GetRolePermissionMatrix(ctx context.Context) (map[string][]string, error)
	GetPermissionsByRole(ctx context.Context, roleCode string) ([]string, error)
}

// PermissionChecker defines the middleware interface
type PermissionChecker interface {
	RequirePermission(permissionCode string) fiber.Handler
}

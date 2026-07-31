package rbac

import (
	"context"

	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

type checker struct {
	authSvc AuthorizationService
	db      *sqlx.DB // used for logging audits decoupled from audit module
	log     *zap.Logger
}

func NewPermissionChecker(authSvc AuthorizationService, db *sqlx.DB, log *zap.Logger) PermissionChecker {
	return &checker{
		authSvc: authSvc,
		db:      db,
		log:     log,
	}
}

func (c *checker) logUnauthorized(ctx context.Context, userID, roleCode, permissionCode, ip, userAgent string) {
	query := `
		INSERT INTO audit_logs (
			module, action, entity, entity_id, user_id, actor_role, reason, ip_address, user_agent, metadata
		) VALUES (
			'system', 'UNAUTHORIZED_ACCESS', 'permission', $1, $2, $3, 'Attempted to access protected resource', $4, $5, $6
		)
	`
	metadata := map[string]interface{}{
		"requested_permission": permissionCode,
	}
	_, err := c.db.ExecContext(ctx, query, permissionCode, userID, roleCode, ip, userAgent, metadata)
	if err != nil {
		c.log.Error("Failed to write unauthorized audit log", zap.Error(err))
	}
}

func (c *checker) RequirePermission(permissionCode string) fiber.Handler {
	return func(ctx fiber.Ctx) error {
		roleCode, ok := ctx.Locals("role").(string)
		if !ok || roleCode == "" {
			return response.SendError(ctx, fiber.StatusForbidden, "Access denied: Missing role", nil)
		}

		if c.authSvc.HasPermission(roleCode, permissionCode) {
			return ctx.Next()
		}

		// Denied. Log the audit.
		userID, _ := ctx.Locals("user_id").(string)
		c.log.Warn("Unauthorized access attempt",
			zap.String("user_id", userID),
			zap.String("role", roleCode),
			zap.String("permission", permissionCode),
		)

		// Fire and forget the audit log to not block the request
		go c.logUnauthorized(context.Background(), userID, roleCode, permissionCode, ctx.IP(), string(ctx.Request().Header.UserAgent()))

		return response.SendError(ctx, fiber.StatusForbidden, "Access denied: Missing required permission", nil)
	}
}

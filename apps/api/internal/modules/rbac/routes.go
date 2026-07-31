package rbac

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

// SetupAuthRoutes adds RBAC endpoints directly onto the router
func SetupAuthRoutes(router fiber.Router, authSvc AuthorizationService) {
	h := NewHandler(authSvc)
	router.Get("/me/permissions", h.GetMyPermissions)
}

// InitRBAC initializes the entire RBAC module and returns the Checker and Service
func InitRBAC(db *sqlx.DB, log *zap.Logger) (PermissionChecker, AuthorizationService) {
	repo := NewRepository(db)
	svc := NewService(repo, log)
	checker := NewPermissionChecker(svc, db, log)

	return checker, svc
}

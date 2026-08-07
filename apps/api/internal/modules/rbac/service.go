package rbac

import (
	"context"
	"sync"
	"time"

	"go.uber.org/zap"
)

type service struct {
	repo   RBACRepository
	log    *zap.Logger
	matrix sync.Map // Maps roleCode -> map[string]bool for O(1) lookups
}

func NewService(repo RBACRepository, log *zap.Logger) AuthorizationService {
	s := &service{
		repo: repo,
		log:  log,
	}

	// Initial load
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := s.RefreshMatrix(ctx); err != nil {
		log.Error("Failed to initialize RBAC matrix", zap.Error(err))
	} else {
		log.Info("RBAC matrix initialized successfully")
	}

	return s
}

func (s *service) RefreshMatrix(ctx context.Context) error {
	mat, err := s.repo.GetRolePermissionMatrix(ctx)
	if err != nil {
		return err
	}

	// Convert map[string][]string to map[string]map[string]bool
	for roleCode, perms := range mat {
		permSet := make(map[string]bool)
		for _, p := range perms {
			permSet[p] = true
		}
		s.matrix.Store(roleCode, permSet)
	}
	return nil
}

func (s *service) HasPermission(roleCode, permissionCode string) bool {
	// SUPER_ADMIN override (optional, but good practice. We actually explicitly map SUPER_ADMIN in DB,
	// but this ensures they never get locked out even if DB mapping drops).
	if roleCode == "SUPER_ADMIN" {
		return true
	}

	val, ok := s.matrix.Load(roleCode)
	if !ok {
		return false
	}

	permSet := val.(map[string]bool)
	return permSet[permissionCode]
}

func (s *service) GetPermissionsForRole(roleCode string) []string {
	if roleCode == "SUPER_ADMIN" {
		// Just a marker that they have everything, but we can return the exact list from cache
		// Returning the exact list is better so frontend knows exactly what buttons to show.
	}

	val, ok := s.matrix.Load(roleCode)
	if !ok {
		return []string{}
	}

	permSet := val.(map[string]bool)
	var list []string
	for p := range permSet {
		list = append(list, p)
	}
	return list
}

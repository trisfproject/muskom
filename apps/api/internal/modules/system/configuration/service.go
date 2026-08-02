package configuration

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
	"go.uber.org/zap"
)

type Service interface {
	GetSystemConfig(ctx context.Context) (*FullSystemConfig, error)
	UpdateConfigGroup(ctx context.Context, req UpdateConfigRequest, updatedBy *string) error
}

type service struct {
	repo         Repository
	cache        Cache
	auditService audit.AuditService
	log          *zap.Logger
	val          *validator.Validator
}

func NewService(repo Repository, cache Cache, auditService audit.AuditService, log *zap.Logger, val *validator.Validator) Service {
	return &service{
		repo:         repo,
		cache:        cache,
		auditService: auditService,
		log:          log,
		val:          val,
	}
}

func (s *service) GetSystemConfig(ctx context.Context) (*FullSystemConfig, error) {
	// 1. Try Cache First
	cached, err := s.cache.GetFullConfig(ctx)
	if err != nil {
		s.log.Warn("Failed to get config from cache", zap.Error(err))
	} else if cached != nil {
		return cached, nil
	}

	// 2. Fetch from DB
	configs, err := s.repo.GetAllConfigs(ctx)
	if err != nil {
		s.log.Error("Failed to fetch configs from DB", zap.Error(err))
		return nil, err
	}

	fullConfig := &FullSystemConfig{}

	// Map DB rows to the FullSystemConfig struct
	for _, c := range configs {
		switch c.GroupName {
		case "website_identity":
			_ = json.Unmarshal(c.Settings, &fullConfig.WebsiteIdentity)
		case "publication":
			_ = json.Unmarshal(c.Settings, &fullConfig.Publication)
		case "registration":
			_ = json.Unmarshal(c.Settings, &fullConfig.Registration)
		case "contact":
			_ = json.Unmarshal(c.Settings, &fullConfig.Contact)
		case "seo":
			_ = json.Unmarshal(c.Settings, &fullConfig.SEO)
		case "feature_flags":
			_ = json.Unmarshal(c.Settings, &fullConfig.FeatureFlags)
		}
	}

	// 3. Set Cache
	if err := s.cache.SetFullConfig(ctx, fullConfig); err != nil {
		s.log.Warn("Failed to set config cache", zap.Error(err))
	}

	return fullConfig, nil
}

func (s *service) UpdateConfigGroup(ctx context.Context, req UpdateConfigRequest, updatedBy *string) error {
	// Validate the payload based on the group
	if err := ValidateConfigPayload(req.GroupName, req.Settings, s.val); err != nil {
		return fmt.Errorf("invalid configuration payload: %w", err)
	}

	// Fetch previous config for audit log
	var previousValue interface{}
	var entityID string
	prevConfig, _ := s.repo.GetConfigByGroup(ctx, req.GroupName)
	if prevConfig != nil {
		entityID = prevConfig.ID
		var pv map[string]interface{}
		_ = json.Unmarshal(prevConfig.Settings, &pv)
		previousValue = pv
	}

	// Update the database
	if err := s.repo.UpdateConfigGroup(ctx, req.GroupName, req.Settings, updatedBy); err != nil {
		s.log.Error("Failed to update config group in DB", zap.Error(err), zap.String("group", req.GroupName))
		return err
	}

	// Unmarshal new settings for audit
	var newValue map[string]interface{}
	_ = json.Unmarshal(req.Settings, &newValue)

	// Fire async audit log
	s.auditService.LogActivityAsync(ctx, audit.AuditEntry{
		Module:        audit.ModuleSystem,
		Action:        "UPDATE_CONFIG",
		Entity:        "system_configuration",
		EntityID:      entityID,
		ActorID:       updatedBy,
		PreviousValue: previousValue,
		NewValue:      newValue,
	})

	// Invalidate the cache so the next request rebuilds it
	if err := s.cache.InvalidateConfig(ctx); err != nil {
		s.log.Warn("Failed to invalidate config cache", zap.Error(err))
	}

	s.log.Info("Configuration group updated successfully", zap.String("group", req.GroupName))
	return nil
}

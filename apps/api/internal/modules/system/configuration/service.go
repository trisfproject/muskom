package configuration

import (
	"context"
	"encoding/json"
	"fmt"

	"go.uber.org/zap"
)

type Service interface {
	GetSystemConfig(ctx context.Context) (*FullSystemConfig, error)
	UpdateConfigGroup(ctx context.Context, req UpdateConfigRequest, updatedBy *string) error
}

type service struct {
	repo  Repository
	cache Cache
	log   *zap.Logger
}

func NewService(repo Repository, cache Cache, log *zap.Logger) Service {
	return &service{
		repo:  repo,
		cache: cache,
		log:   log,
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
		case "timeline":
			_ = json.Unmarshal(c.Settings, &fullConfig.Timeline)
		case "contact":
			_ = json.Unmarshal(c.Settings, &fullConfig.Contact)
		case "social_media":
			_ = json.Unmarshal(c.Settings, &fullConfig.SocialMedia)
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
	if err := ValidateConfigPayload(req.GroupName, req.Settings); err != nil {
		return fmt.Errorf("invalid configuration payload: %w", err)
	}

	// Update the database
	if err := s.repo.UpdateConfigGroup(ctx, req.GroupName, req.Settings, updatedBy); err != nil {
		s.log.Error("Failed to update config group in DB", zap.Error(err), zap.String("group", req.GroupName))
		return err
	}

	// Invalidate the cache so the next request rebuilds it
	if err := s.cache.InvalidateConfig(ctx); err != nil {
		s.log.Warn("Failed to invalidate config cache", zap.Error(err))
	}

	s.log.Info("Configuration group updated successfully", zap.String("group", req.GroupName))
	return nil
}

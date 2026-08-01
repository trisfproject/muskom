package configuration

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type Cache interface {
	GetFullConfig(ctx context.Context) (*FullSystemConfig, error)
	SetFullConfig(ctx context.Context, config *FullSystemConfig) error
	InvalidateConfig(ctx context.Context) error
}

type cacheImpl struct {
	redis *redis.Client
}

const (
	configCacheKey = "system:configuration:full"
	cacheTTL       = 24 * time.Hour
)

func NewCache(r *redis.Client) Cache {
	return &cacheImpl{redis: r}
}

func (c *cacheImpl) GetFullConfig(ctx context.Context) (*FullSystemConfig, error) {
	val, err := c.redis.Get(ctx, configCacheKey).Result()
	if err == redis.Nil {
		return nil, nil // Cache miss
	} else if err != nil {
		return nil, err
	}

	var config FullSystemConfig
	if err := json.Unmarshal([]byte(val), &config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal cached config: %w", err)
	}

	return &config, nil
}

func (c *cacheImpl) SetFullConfig(ctx context.Context, config *FullSystemConfig) error {
	data, err := json.Marshal(config)
	if err != nil {
		return err
	}
	return c.redis.Set(ctx, configCacheKey, data, cacheTTL).Err()
}

func (c *cacheImpl) InvalidateConfig(ctx context.Context) error {
	return c.redis.Del(ctx, configCacheKey).Err()
}

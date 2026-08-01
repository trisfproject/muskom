package website

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

const (
	// PublicHomeCacheKey is the Redis key storing aggregated public home data.
	PublicHomeCacheKey = "muskom:website:public:home"
	// DefaultCacheTTL is the 5-minute TTL for public home data.
	DefaultCacheTTL = 5 * time.Minute
)

// Cache defines the caching operations for the Website Engine.
type Cache interface {
	GetPublicHome(ctx context.Context) (*PublicHomeResponse, error)
	SetPublicHome(ctx context.Context, data *PublicHomeResponse, ttl time.Duration) error
	InvalidatePublicHome(ctx context.Context) error
}

type redisCache struct {
	client *redis.Client
	logger *zap.Logger
}

// NewRedisCache creates a new Redis-backed Cache adapter for Website Engine.
func NewRedisCache(client *redis.Client, logger *zap.Logger) Cache {
	return &redisCache{
		client: client,
		logger: logger,
	}
}

// GetPublicHome retrieves cached public home payload from Redis.
func (c *redisCache) GetPublicHome(ctx context.Context) (*PublicHomeResponse, error) {
	if c.client == nil {
		return nil, errors.New("redis client not initialized")
	}

	val, err := c.client.Get(ctx, PublicHomeCacheKey).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, nil // Cache miss
		}
		c.logger.Warn("Redis cache get error", zap.Error(err), zap.String("key", PublicHomeCacheKey))
		return nil, err
	}

	var res PublicHomeResponse
	if err := json.Unmarshal([]byte(val), &res); err != nil {
		c.logger.Warn("Failed to unmarshal cached public home JSON", zap.Error(err))
		return nil, err
	}

	return &res, nil
}

// SetPublicHome serializes and stores public home payload into Redis with TTL.
func (c *redisCache) SetPublicHome(ctx context.Context, data *PublicHomeResponse, ttl time.Duration) error {
	if c.client == nil || data == nil {
		return nil
	}

	if ttl <= 0 {
		ttl = DefaultCacheTTL
	}

	bytes, err := json.Marshal(data)
	if err != nil {
		c.logger.Warn("Failed to marshal public home for caching", zap.Error(err))
		return err
	}

	if err := c.client.Set(ctx, PublicHomeCacheKey, bytes, ttl).Err(); err != nil {
		c.logger.Warn("Failed to set Redis cache for public home", zap.Error(err), zap.String("key", PublicHomeCacheKey))
		return err
	}

	return nil
}

// InvalidatePublicHome removes the public home cache entry from Redis.
func (c *redisCache) InvalidatePublicHome(ctx context.Context) error {
	if c.client == nil {
		return nil
	}

	if err := c.client.Del(ctx, PublicHomeCacheKey).Err(); err != nil {
		c.logger.Warn("Failed to invalidate Redis cache for public home", zap.Error(err), zap.String("key", PublicHomeCacheKey))
		return err
	}

	c.logger.Info("Website Engine public home cache invalidated", zap.String("key", PublicHomeCacheKey))
	return nil
}

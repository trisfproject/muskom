package evoting

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

const (
	// Session cookie name
	CookieName = "evoting_session"
	// Session TTL
	SessionTTL = 4 * time.Hour

	// Rate limiting constants
	rateLimitMax    = 5
	rateLimitWindow = 60 * time.Second

	// Operational stats Redis keys
	StatsKeyAuthFailures = "evoting:stats:auth_failures"
	StatsKeyRateLimited  = "evoting:stats:rate_limited"
	StatsKeyVoteFailures = "evoting:stats:vote_failures"
	StatsKeyAlreadyVoted = "evoting:stats:already_voted"
)

// RateLimiter defines the interface for rate limiting operations.
type RateLimiter interface {
	// IncrementFailure increments the failure counter for the given key.
	// Returns the current count after increment.
	IncrementFailure(ctx context.Context, key string) (int64, error)
	// GetFailureCount returns the current failure count for the given key.
	GetFailureCount(ctx context.Context, key string) (int64, error)
}

// RedisRateLimiter implements RateLimiter using Redis.
type RedisRateLimiter struct {
	client *redis.Client
}

func NewRedisRateLimiter(client *redis.Client) *RedisRateLimiter {
	return &RedisRateLimiter{client: client}
}

func (r *RedisRateLimiter) IncrementFailure(ctx context.Context, key string) (int64, error) {
	pipe := r.client.Pipeline()
	incr := pipe.Incr(ctx, key)
	pipe.Expire(ctx, key, rateLimitWindow)
	_, err := pipe.Exec(ctx)
	if err != nil {
		return 0, err
	}
	return incr.Val(), nil
}

func (r *RedisRateLimiter) GetFailureCount(ctx context.Context, key string) (int64, error) {
	val, err := r.client.Get(ctx, key).Int64()
	if err == redis.Nil {
		return 0, nil
	}
	return val, err
}

// IncrStat increments an operational stats counter (no TTL).
func (r *RedisRateLimiter) IncrStat(ctx context.Context, key string) {
	r.client.Incr(ctx, key)
}

type Handler struct {
	cfg     *config.Config
	log     *zap.Logger
	limiter RateLimiter
}

func NewHandler(cfg *config.Config, log *zap.Logger, limiter RateLimiter) *Handler {
	return &Handler{cfg: cfg, log: log, limiter: limiter}
}

// rateLimitKey returns the Redis key for the given client IP.
func rateLimitKey(ip string) string {
	return fmt.Sprintf("evoting:auth:fail:%s", ip)
}

// getClientIP returns the client IP using X-Real-IP header (set by nginx)
// with fallback to Fiber's c.IP().
func getClientIP(c fiber.Ctx) string {
	if ip := c.Get("X-Real-IP"); ip != "" {
		return ip
	}
	return c.IP()
}

// Authenticate validates the access code and issues a session cookie.
func (h *Handler) Authenticate(c fiber.Ctx) error {
	clientIP := getClientIP(c)

	// Check rate limit before processing
	if h.limiter != nil {
		count, err := h.limiter.GetFailureCount(c.Context(), rateLimitKey(clientIP))
		if err == nil && count >= rateLimitMax {
			h.log.Warn("E-Voting auth rate limited",
				zap.String("ip", clientIP),
			)
			if rl, ok := h.limiter.(*RedisRateLimiter); ok {
				rl.IncrStat(c.Context(), StatsKeyRateLimited)
			}
			c.Set("Retry-After", "60")
			return response.SendError(c, fiber.StatusTooManyRequests, "Too many access attempts. Please try again later.", nil)
		}
	}

	var req struct {
		Code string `json:"code"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Invalid request body", nil)
	}

	if req.Code == "" {
		return response.SendError(c, fiber.StatusBadRequest, "Access code is required", nil)
	}

	// Validate against configured access code
	if h.cfg.EvotingAccessCode == "" {
		h.log.Error("EVOTING_ACCESS_CODE is not configured")
		return response.SendError(c, fiber.StatusServiceUnavailable, "E-Voting access is not configured", nil)
	}

	if req.Code != h.cfg.EvotingAccessCode {
		// Increment failure counter
		if h.limiter != nil {
			count, _ := h.limiter.IncrementFailure(c.Context(), rateLimitKey(clientIP))
			if count >= rateLimitMax {
				h.log.Warn("E-Voting auth rate limited after threshold",
					zap.String("ip", clientIP),
				)
				if rl, ok := h.limiter.(*RedisRateLimiter); ok {
					rl.IncrStat(c.Context(), StatsKeyRateLimited)
				}
				c.Set("Retry-After", "60")
				return response.SendError(c, fiber.StatusTooManyRequests, "Too many access attempts. Please try again later.", nil)
			}
		}
		// Increment auth failure stats
		if rl, ok := h.limiter.(*RedisRateLimiter); ok {
			rl.IncrStat(c.Context(), StatsKeyAuthFailures)
		}
		h.log.Warn("Invalid e-voting access code attempt",
			zap.String("ip", clientIP),
		)
		return response.SendError(c, fiber.StatusUnauthorized, "Kode akses tidak valid", nil)
	}

	// Generate session token (HMAC-signed timestamp)
	token := generateSessionToken(h.cfg.JWTSecret)

	// Set HttpOnly cookie
	cookie := &fiber.Cookie{
		Name:     CookieName,
		Value:    token,
		Expires:  time.Now().Add(SessionTTL),
		HTTPOnly: true,
		Secure:   h.cfg.AppEnv == "production",
		SameSite: fiber.CookieSameSiteLaxMode,
		Path:     "/",
	}
	c.Cookie(cookie)

	return response.SendSuccess(c, fiber.StatusOK, "E-Voting session created", fiber.Map{
		"expires_in": int(SessionTTL.Seconds()),
	}, nil)
}

// CheckSession returns the session validity status.
func (h *Handler) CheckSession(c fiber.Ctx) error {
	return response.SendSuccess(c, fiber.StatusOK, "Session valid", nil, nil)
}

// generateSessionToken creates an HMAC-signed token encoding the expiry.
func generateSessionToken(secret string) string {
	expiry := time.Now().Add(SessionTTL).Unix()
	payload := time.Unix(expiry, 0).Format(time.RFC3339)

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	sig := hex.EncodeToString(mac.Sum(nil))

	return payload + "." + sig
}

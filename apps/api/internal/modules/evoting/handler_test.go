package evoting

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http/httptest"
	"sync"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap/zaptest"

	"github.com/trisfproject/muskom/apps/api/platform/config"
)

// ─── Mock Rate Limiter ────────────────────────────────────────────────────────

type mockRateLimiter struct {
	mu       sync.Mutex
	counters map[string]int64
}

func newMockRateLimiter() *mockRateLimiter {
	return &mockRateLimiter{counters: make(map[string]int64)}
}

func (m *mockRateLimiter) IncrementFailure(_ context.Context, key string) (int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.counters[key]++
	return m.counters[key], nil
}

func (m *mockRateLimiter) GetFailureCount(_ context.Context, key string) (int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.counters[key], nil
}

func (m *mockRateLimiter) Reset(key string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.counters, key)
}

func (m *mockRateLimiter) GetCount(key string) int64 {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.counters[key]
}

// ─── Test Helpers ─────────────────────────────────────────────────────────────

func setupTestApp(t *testing.T, limiter RateLimiter) (*fiber.App, *Handler) {
	t.Helper()
	cfg := &config.Config{
		EvotingAccessCode: "097356",
		JWTSecret:         "test-secret",
		AppEnv:            "development",
	}
	log := zaptest.NewLogger(t)
	handler := NewHandler(cfg, log, limiter)

	app := fiber.New()
	app.Post("/auth", handler.Authenticate)
	return app, handler
}

func makeAuthRequest(app *fiber.App, code string, ip string) (*httptest.ResponseRecorder, map[string]interface{}) {
	body, _ := json.Marshal(map[string]string{"code": code})
	req := httptest.NewRequest("POST", "/auth", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	if ip != "" {
		req.Header.Set("X-Real-IP", ip)
	}

	resp, _ := app.Test(req)
	respBody, _ := io.ReadAll(resp.Body)

	var result map[string]interface{}
	json.Unmarshal(respBody, &result)

	recorder := httptest.NewRecorder()
	recorder.Code = resp.StatusCode
	for k, v := range resp.Header {
		for _, val := range v {
			recorder.Header().Add(k, val)
		}
	}

	return recorder, result
}

// ─── Tests ────────────────────────────────────────────────────────────────────

func TestAuthenticate_FirstFailedAttempt(t *testing.T) {
	limiter := newMockRateLimiter()
	app, _ := setupTestApp(t, limiter)

	resp, body := makeAuthRequest(app, "wrongcode", "192.168.1.1")

	assert.Equal(t, fiber.StatusUnauthorized, resp.Code)
	assert.Equal(t, false, body["success"])
	assert.Equal(t, "Kode akses tidak valid", body["message"])
	assert.Equal(t, int64(1), limiter.GetCount(rateLimitKey("192.168.1.1")))
}

func TestAuthenticate_FiveFailedAttemptsStillNormalResponse(t *testing.T) {
	limiter := newMockRateLimiter()
	app, _ := setupTestApp(t, limiter)

	// First 4 failures should return normal 401
	for i := 0; i < 4; i++ {
		resp, body := makeAuthRequest(app, "wrongcode", "10.0.0.1")
		assert.Equal(t, fiber.StatusUnauthorized, resp.Code)
		assert.Equal(t, "Kode akses tidak valid", body["message"])
	}

	// 5th failure triggers rate limit (count reaches 5 on increment)
	resp, body := makeAuthRequest(app, "wrongcode", "10.0.0.1")
	assert.Equal(t, fiber.StatusTooManyRequests, resp.Code)
	assert.Equal(t, "Too many access attempts. Please try again later.", body["message"])
}

func TestAuthenticate_SixthAttemptBlockedByPreCheck(t *testing.T) {
	limiter := newMockRateLimiter()
	app, _ := setupTestApp(t, limiter)

	// Fill up 5 failures
	for i := 0; i < 5; i++ {
		makeAuthRequest(app, "wrongcode", "10.0.0.2")
	}

	// 6th attempt — blocked at the pre-check stage (before code validation)
	resp, body := makeAuthRequest(app, "wrongcode", "10.0.0.2")
	assert.Equal(t, fiber.StatusTooManyRequests, resp.Code)
	assert.Equal(t, "Too many access attempts. Please try again later.", body["message"])
	assert.Equal(t, "60", resp.Header().Get("Retry-After"))
}

func TestAuthenticate_DifferentIPsIndependent(t *testing.T) {
	limiter := newMockRateLimiter()
	app, _ := setupTestApp(t, limiter)

	// Fill up IP1 to the limit
	for i := 0; i < 5; i++ {
		makeAuthRequest(app, "wrongcode", "10.0.0.10")
	}

	// IP2 should still be able to attempt
	resp, body := makeAuthRequest(app, "wrongcode", "10.0.0.20")
	assert.Equal(t, fiber.StatusUnauthorized, resp.Code)
	assert.Equal(t, "Kode akses tidak valid", body["message"])

	// IP1 is rate limited
	resp2, _ := makeAuthRequest(app, "wrongcode", "10.0.0.10")
	assert.Equal(t, fiber.StatusTooManyRequests, resp2.Code)
}

func TestAuthenticate_SuccessfulAuthNotAffectedByOtherIPRateLimit(t *testing.T) {
	limiter := newMockRateLimiter()
	app, _ := setupTestApp(t, limiter)

	// Rate-limit IP1
	for i := 0; i < 6; i++ {
		makeAuthRequest(app, "wrongcode", "10.0.0.30")
	}

	// IP2 can still authenticate successfully
	resp, body := makeAuthRequest(app, "097356", "10.0.0.40")
	assert.Equal(t, fiber.StatusOK, resp.Code)
	assert.Equal(t, true, body["success"])
	assert.Equal(t, "E-Voting session created", body["message"])
}

func TestAuthenticate_SuccessDoesNotIncrementCounter(t *testing.T) {
	limiter := newMockRateLimiter()
	app, _ := setupTestApp(t, limiter)

	// Successful auth
	resp, _ := makeAuthRequest(app, "097356", "10.0.0.50")
	assert.Equal(t, fiber.StatusOK, resp.Code)

	// Counter should remain at 0
	assert.Equal(t, int64(0), limiter.GetCount(rateLimitKey("10.0.0.50")))
}

func TestAuthenticate_SuccessDoesNotResetOtherIPCounter(t *testing.T) {
	limiter := newMockRateLimiter()
	app, _ := setupTestApp(t, limiter)

	// Add 3 failures for IP1
	for i := 0; i < 3; i++ {
		makeAuthRequest(app, "wrongcode", "10.0.0.60")
	}

	// Successful auth from IP2
	makeAuthRequest(app, "097356", "10.0.0.70")

	// IP1 counter unchanged
	assert.Equal(t, int64(3), limiter.GetCount(rateLimitKey("10.0.0.60")))
}

func TestAuthenticate_ValidAuthFlowUnchanged(t *testing.T) {
	limiter := newMockRateLimiter()
	app, _ := setupTestApp(t, limiter)

	resp, body := makeAuthRequest(app, "097356", "192.168.1.100")

	assert.Equal(t, fiber.StatusOK, resp.Code)
	assert.Equal(t, true, body["success"])
	assert.Equal(t, "E-Voting session created", body["message"])

	data := body["data"].(map[string]interface{})
	assert.Equal(t, float64(14400), data["expires_in"])

	// Check cookie is set
	cookies := resp.Header().Values("Set-Cookie")
	assert.NotEmpty(t, cookies)
	found := false
	for _, c := range cookies {
		if len(c) > 0 && c[:16] == "evoting_session=" {
			found = true
			break
		}
	}
	assert.True(t, found, "evoting_session cookie should be set")
}

func TestAuthenticate_NilLimiterGraceful(t *testing.T) {
	// If limiter is nil, auth should still work (graceful degradation)
	cfg := &config.Config{
		EvotingAccessCode: "097356",
		JWTSecret:         "test-secret",
		AppEnv:            "development",
	}
	log := zaptest.NewLogger(t)
	handler := NewHandler(cfg, log, nil)

	app := fiber.New()
	app.Post("/auth", handler.Authenticate)

	// Valid auth works
	resp, body := makeAuthRequest(app, "097356", "10.0.0.80")
	assert.Equal(t, fiber.StatusOK, resp.Code)
	assert.Equal(t, true, body["success"])

	// Invalid auth works (just no rate limiting)
	resp2, body2 := makeAuthRequest(app, "wrong", "10.0.0.80")
	assert.Equal(t, fiber.StatusUnauthorized, resp2.Code)
	assert.Equal(t, "Kode akses tidak valid", body2["message"])
}

func TestAuthenticate_RetryAfterHeader(t *testing.T) {
	limiter := newMockRateLimiter()
	app, _ := setupTestApp(t, limiter)

	// Trigger rate limit
	for i := 0; i < 5; i++ {
		makeAuthRequest(app, "wrongcode", "10.0.0.90")
	}

	resp, _ := makeAuthRequest(app, "wrongcode", "10.0.0.90")
	assert.Equal(t, fiber.StatusTooManyRequests, resp.Code)
	assert.Equal(t, "60", resp.Header().Get("Retry-After"))
}

func TestAuthenticate_RateLimitedIPCanStillSucceedWithCorrectCode(t *testing.T) {
	limiter := newMockRateLimiter()
	app, _ := setupTestApp(t, limiter)

	// Fill up 3 failures (below threshold)
	for i := 0; i < 3; i++ {
		makeAuthRequest(app, "wrongcode", "10.0.0.95")
	}

	// Correct code still succeeds (below threshold)
	resp, body := makeAuthRequest(app, "097356", "10.0.0.95")
	assert.Equal(t, fiber.StatusOK, resp.Code)
	assert.Equal(t, true, body["success"])
}

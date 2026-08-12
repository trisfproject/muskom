package evoting

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"time"

	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"

	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

const (
	// Session cookie name
	CookieName = "evoting_session"
	// Session TTL
	SessionTTL = 4 * time.Hour
)

type Handler struct {
	cfg *config.Config
	log *zap.Logger
}

func NewHandler(cfg *config.Config, log *zap.Logger) *Handler {
	return &Handler{cfg: cfg, log: log}
}

// Authenticate validates the access code and issues a session cookie.
func (h *Handler) Authenticate(c fiber.Ctx) error {
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
		h.log.Warn("Invalid e-voting access code attempt")
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

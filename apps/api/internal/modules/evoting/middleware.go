package evoting

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

// SessionMiddleware validates the evoting_session cookie.
func SessionMiddleware(cfg *config.Config) fiber.Handler {
	return func(c fiber.Ctx) error {
		token := c.Cookies(CookieName)
		if token == "" {
			return response.SendError(c, fiber.StatusUnauthorized, "E-Voting session required", nil)
		}

		if !validateSessionToken(token, cfg.JWTSecret) {
			return response.SendError(c, fiber.StatusUnauthorized, "Invalid or expired e-voting session", nil)
		}

		return c.Next()
	}
}

// validateSessionToken verifies the HMAC signature and checks expiry.
func validateSessionToken(token, secret string) bool {
	// Token format: "RFC3339_timestamp.hex_signature"
	parts := strings.SplitN(token, ".", 2)
	if len(parts) != 2 {
		return false
	}

	payload := parts[0]
	providedSig := parts[1]

	// Verify HMAC signature
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(providedSig), []byte(expectedSig)) {
		return false
	}

	// Check expiry
	expiry, err := time.Parse(time.RFC3339, payload)
	if err != nil {
		return false
	}

	return time.Now().Before(expiry)
}

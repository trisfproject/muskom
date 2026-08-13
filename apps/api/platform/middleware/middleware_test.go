package middleware

import (
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/stretchr/testify/assert"

	"github.com/trisfproject/muskom/apps/api/platform/config"
)

func TestParseOrigins_Wildcard(t *testing.T) {
	assert.Equal(t, []string{"*"}, parseOrigins("*"))
}

func TestParseOrigins_Empty(t *testing.T) {
	assert.Equal(t, []string{"*"}, parseOrigins(""))
}

func TestParseOrigins_SingleOrigin(t *testing.T) {
	assert.Equal(t, []string{"https://muskom.komitkabe.com"}, parseOrigins("https://muskom.komitkabe.com"))
}

func TestParseOrigins_MultipleOrigins(t *testing.T) {
	result := parseOrigins("https://muskom.komitkabe.com, http://localhost:3000, http://localhost:80")
	assert.Equal(t, []string{
		"https://muskom.komitkabe.com",
		"http://localhost:3000",
		"http://localhost:80",
	}, result)
}

func TestParseOrigins_TrimsWhitespace(t *testing.T) {
	result := parseOrigins("  https://example.com  ,  http://localhost:3000  ")
	assert.Equal(t, []string{"https://example.com", "http://localhost:3000"}, result)
}

func TestParseOrigins_SkipsEmpty(t *testing.T) {
	result := parseOrigins("https://example.com,,http://localhost:3000")
	assert.Equal(t, []string{"https://example.com", "http://localhost:3000"}, result)
}

func TestParseOrigins_AllEmpty(t *testing.T) {
	assert.Equal(t, []string{"*"}, parseOrigins(",,,"))
}

func TestSetup_WildcardDoesNotPanic(t *testing.T) {
	// This test verifies that Setup does not panic when CORS_ALLOWED_ORIGINS is "*"
	// Previously, AllowCredentials:true + AllowOrigins:["*"] caused a Fiber panic.
	assert.NotPanics(t, func() {
		app := fiber.New()
		cfg := &config.Config{CorsAllowedOrigins: "*"}
		Setup(app, cfg, nil)
	})
}

func TestSetup_ExplicitOriginDoesNotPanic(t *testing.T) {
	assert.NotPanics(t, func() {
		app := fiber.New()
		cfg := &config.Config{CorsAllowedOrigins: "https://muskom.komitkabe.com"}
		Setup(app, cfg, nil)
	})
}

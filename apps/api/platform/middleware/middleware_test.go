package middleware

import (
	"testing"

	"github.com/stretchr/testify/assert"
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

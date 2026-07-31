package registration

import (
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap/zaptest"

	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

func TestSetupRoutes(t *testing.T) {
	app := fiber.New()
	log := zaptest.NewLogger(t)
	val := validator.New()
	strg := new(MockStorage)

	// nil db is fine just to test route registration, it shouldn't access DB during route setup
	SetupRoutes(app, nil, log, val, strg, 1024)

	assert.NotNil(t, app)
}

func TestSetupAdminRoutes(t *testing.T) {
	app := fiber.New()
	log := zaptest.NewLogger(t)
	val := validator.New()
	strg := new(MockStorage)

	SetupAdminRoutes(app, nil, log, val, strg, 1024)

	assert.NotNil(t, app)
}

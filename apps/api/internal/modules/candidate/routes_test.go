package candidate

import (
	"context"
	"io"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap/zaptest"

	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"github.com/trisfproject/muskom/apps/api/platform/validator"
)

// MockStorage for routes test
type MockStorage struct{}

func (m *MockStorage) Upload(ctx context.Context, r io.Reader, filename string) (*storage.FileInfo, error) {
	return nil, nil
}
func (m *MockStorage) Delete(ctx context.Context, filename string) error {
	return nil
}
func (m *MockStorage) Exists(ctx context.Context, filename string) (bool, error) {
	return true, nil
}
func (m *MockStorage) URL(filename string) string {
	return ""
}

func TestSetupRoutes(t *testing.T) {
	app := fiber.New()
	log := zaptest.NewLogger(t)
	val := validator.New()

	SetupRoutes(app, nil, log, val, nil, 1024)

	assert.NotNil(t, app)
}

func TestSetupAdminRoutes(t *testing.T) {
	app := fiber.New()
	log := zaptest.NewLogger(t)
	val := validator.New()

	SetupAdminRoutes(app, nil, log, val, nil, 1024)

	assert.NotNil(t, app)
}

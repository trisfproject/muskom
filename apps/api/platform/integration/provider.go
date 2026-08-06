package integration

import (
	"context"
)

// ExecutionResult captures the observability metrics of an integration attempt
type ExecutionResult struct {
	Success      bool
	ErrorMessage string
	DurationMs   int
	Retries      int
}

// Provider represents the strict boundary contract to external systems.
// Core domains must never implement this directly.
type Provider interface {
	// ID returns the unique identifier for this provider (e.g. "EmailProvider")
	ID() string

	// Execute performs the side-effect based on a dynamic config payload
	Execute(ctx context.Context, config map[string]interface{}) ExecutionResult

	// Health returns the connection/configuration status of the external service
	Health(ctx context.Context) error
}

// Ensure the contracts are defined abstractly as requested by the Epic
// These will be implemented in future sprints (e.g., mailgun, twilio, etc.)
type EmailProvider interface{ Provider }
type WhatsAppProvider interface{ Provider }
type TelegramProvider interface{ Provider }
type WebhookProvider interface{ Provider }
type GoogleSheetsProvider interface{ Provider }
type ExportProvider interface{ Provider }

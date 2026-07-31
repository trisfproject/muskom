package eventctx

import (
	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

// Middleware factory that injects EventContext into fiber locals
func Middleware(resolver EventResolver, log *zap.Logger) fiber.Handler {
	return func(c fiber.Ctx) error {
		headerID := c.Get("X-Event-ID")
		
		// Use standard context for DB query
		ctx := c.Context()

		eventCtx, err := resolver.Resolve(ctx, headerID)
		if err != nil {
			// If an event ID was explicitly requested and not found, it's an error.
			if headerID != "" {
				return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
					"error": "Requested event not found or inactive",
				})
			}
			
			// If no default active event, we simply don't inject it (or we could strictly block).
			// For a multi-tenant/event architecture, we usually want to block if operations demand an event.
			// However, some global admin endpoints might not strictly require an active event.
			// We inject nil and let the domain decide.
			log.Warn("No default active event found in system")
			return c.Next()
		}

		// Inject for Fiber access
		c.Locals("eventCtx", eventCtx)

		// Provide a helper to construct a Go context wrapped with the EventContext for downstream services
		// Services can do: ctx := eventctx.WithEventContext(c.Context(), eventCtx)
		// Or we can just pass the EventContext object directly to service methods.
		
		return c.Next()
	}
}

// Get extracts the EventContext from fiber locals
func Get(c fiber.Ctx) *EventContext {
	val, ok := c.Locals("eventCtx").(*EventContext)
	if !ok {
		return nil
	}
	return val
}

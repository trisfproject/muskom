package eventbus

import (
	"context"
	"go.uber.org/zap"
	"sync"
)

// SyncBus is a synchronous event dispatcher that fires handlers immediately.
// It uses goroutines to prevent blocking the HTTP request that triggered the event.
type SyncBus struct {
	handlers map[EventType][]EventHandler
	mu       sync.RWMutex
	log      *zap.Logger
}

func NewSyncBus(log *zap.Logger) *SyncBus {
	return &SyncBus{
		handlers: make(map[EventType][]EventHandler),
		log:      log,
	}
}

func (b *SyncBus) Subscribe(eventType EventType, handler EventHandler) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.handlers[eventType] = append(b.handlers[eventType], handler)
}

func (b *SyncBus) Publish(ctx context.Context, envelope *EventEnvelope) error {
	b.mu.RLock()
	handlers, exists := b.handlers[envelope.Type]
	b.mu.RUnlock()

	if !exists {
		b.log.Debug("No subscribers for event", zap.String("type", string(envelope.Type)))
		return nil
	}

	// Dispatch in background to avoid blocking the primary transaction
	for _, handler := range handlers {
		h := handler
		go func(env *EventEnvelope) {
			// Provide a background context since the HTTP request context will be cancelled
			bgCtx := context.Background()

			// Simple Retry Wrapper could be applied here
			err := h(bgCtx, env)
			if err != nil {
				b.log.Error("Event handler failed",
					zap.String("event_id", env.ID),
					zap.String("type", string(env.Type)),
					zap.Error(err),
				)
			}
		}(envelope)
	}

	return nil
}

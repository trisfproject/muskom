package eventbus

import (
	"context"
)

type EventHandler func(ctx context.Context, envelope *EventEnvelope) error

type EventDispatcher interface {
	Publish(ctx context.Context, envelope *EventEnvelope) error
	Subscribe(eventType EventType, handler EventHandler)
}

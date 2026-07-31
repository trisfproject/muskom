package notification

import (
	"context"
	"time"
)

// NotificationPayload represents the content of a notification
type NotificationPayload struct {
	ID        string            `json:"id"`
	Recipient string            `json:"recipient"`
	Subject   string            `json:"subject"`
	Body      string            `json:"body"`
	Channel   string            `json:"channel"` // EMAIL, PUSH, SMS
	Data      map[string]string `json:"data"`
	SentAt    time.Time         `json:"sent_at"`
}

// NotificationTemplate represents a reusable message template
type NotificationTemplate struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Subject  string `json:"subject"`
	BodyHTML string `json:"body_html"`
}

// NotificationService defines the logic for dispatching messages
type NotificationService interface {
	Send(ctx context.Context, payload *NotificationPayload) error
	Broadcast(ctx context.Context, templateID string, recipients []string) error
}

// NotificationRepository defines the persistence for logs
type NotificationRepository interface {
	SaveLog(ctx context.Context, payload *NotificationPayload) error
	GetTemplate(ctx context.Context, templateID string) (*NotificationTemplate, error)
}

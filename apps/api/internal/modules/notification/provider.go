package notification

import (
	"context"

	"github.com/trisfproject/muskom/apps/api/platform/mailer"
)

type Provider interface {
	Send(ctx context.Context, recipient string, subject *string, body string, payload map[string]interface{}) error
	Channel() Channel
}

// SMTP Provider
type SMTPProvider struct {
	mailer mailer.Mailer
}

func NewSMTPProvider(m mailer.Mailer) *SMTPProvider {
	return &SMTPProvider{mailer: m}
}

func (p *SMTPProvider) Send(ctx context.Context, recipient string, subject *string, body string, _ map[string]interface{}) error {
	subj := ""
	if subject != nil {
		subj = *subject
	}
	return p.mailer.SendRaw(recipient, subj, body)
}
func (p *SMTPProvider) Channel() Channel { return ChannelEmail }

// Mock WhatsApp Provider
type MockWhatsAppProvider struct{}

func (p *MockWhatsAppProvider) Send(ctx context.Context, recipient string, subject *string, body string, _ map[string]interface{}) error {
	// Simulated dispatch
	return nil
}
func (p *MockWhatsAppProvider) Channel() Channel { return ChannelWhatsApp }

// Mock Telegram Provider
type MockTelegramProvider struct{}

func (p *MockTelegramProvider) Send(ctx context.Context, recipient string, subject *string, body string, _ map[string]interface{}) error {
	// Simulated dispatch
	return nil
}
func (p *MockTelegramProvider) Channel() Channel { return ChannelTelegram }

// In-App Provider
type InAppProvider struct {
	repo Repository
	hub  interface {
		SendToUser(userID string, payload interface{})
		Broadcast(payload interface{})
	}
}

func (p *InAppProvider) Send(ctx context.Context, recipient string, subject *string, body string, payload map[string]interface{}) error {
	notifType := TypeInfo
	priority := PriorityNormal
	var actionURL *string

	if payload != nil {
		if t, ok := payload["type"].(string); ok {
			notifType = NotificationType(t)
		}
		if p, ok := payload["priority"].(string); ok {
			priority = NotificationPriority(p)
		}
		if au, ok := payload["action_url"].(string); ok {
			actionURL = &au
		}
	}

	title := "Notification"
	if subject != nil {
		title = *subject
	}

	var userID *string
	if recipient != "" && recipient != "system" {
		userID = &recipient
	}

	notif := &InAppNotification{
		UserID:    userID,
		Type:      notifType,
		Priority:  priority,
		Title:     title,
		Message:   body,
		ActionURL: actionURL,
	}

	err := p.repo.CreateInAppNotification(ctx, notif)
	if err != nil {
		return err
	}

	// Push via WebSocket
	if userID == nil {
		p.hub.Broadcast(map[string]interface{}{
			"event": "new_notification",
			"data":  notif,
		})
	} else {
		p.hub.SendToUser(recipient, map[string]interface{}{
			"event": "new_notification",
			"data":  notif,
		})
	}

	return nil
}
func (p *InAppProvider) Channel() Channel { return ChannelInApp }

// Registry
type ProviderRegistry struct {
	providers map[Channel]Provider
}

func NewProviderRegistry(m mailer.Mailer, hub interface {
	SendToUser(userID string, payload interface{})
	Broadcast(payload interface{})
}, repo Repository) *ProviderRegistry {
	r := &ProviderRegistry{
		providers: make(map[Channel]Provider),
	}
	r.Register(NewSMTPProvider(m))
	r.Register(&MockWhatsAppProvider{})
	r.Register(&MockTelegramProvider{})
	r.Register(&InAppProvider{repo: repo, hub: hub})
	return r
}

func (r *ProviderRegistry) Register(p Provider) {
	r.providers[p.Channel()] = p
}

func (r *ProviderRegistry) Get(channel Channel) Provider {
	return r.providers[channel]
}

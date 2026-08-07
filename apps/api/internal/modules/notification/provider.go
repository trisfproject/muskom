package notification

import (
	"context"

	"github.com/trisfproject/muskom/apps/api/platform/mailer"
)

type Provider interface {
	Send(ctx context.Context, recipient string, subject *string, body string) error
	Channel() Channel
}

// SMTP Provider
type SMTPProvider struct {
	mailer mailer.Mailer
}

func NewSMTPProvider(m mailer.Mailer) *SMTPProvider {
	return &SMTPProvider{mailer: m}
}

func (p *SMTPProvider) Send(ctx context.Context, recipient string, subject *string, body string) error {
	subj := ""
	if subject != nil {
		subj = *subject
	}
	return p.mailer.SendRaw(recipient, subj, body)
}
func (p *SMTPProvider) Channel() Channel { return ChannelEmail }

// Mock WhatsApp Provider
type MockWhatsAppProvider struct{}

func (p *MockWhatsAppProvider) Send(ctx context.Context, recipient string, subject *string, body string) error {
	// Simulated dispatch
	return nil
}
func (p *MockWhatsAppProvider) Channel() Channel { return ChannelWhatsApp }

// Mock Telegram Provider
type MockTelegramProvider struct{}

func (p *MockTelegramProvider) Send(ctx context.Context, recipient string, subject *string, body string) error {
	// Simulated dispatch
	return nil
}
func (p *MockTelegramProvider) Channel() Channel { return ChannelTelegram }

// Registry
type ProviderRegistry struct {
	providers map[Channel]Provider
}

func NewProviderRegistry(m mailer.Mailer) *ProviderRegistry {
	r := &ProviderRegistry{
		providers: make(map[Channel]Provider),
	}
	r.Register(NewSMTPProvider(m))
	r.Register(&MockWhatsAppProvider{})
	r.Register(&MockTelegramProvider{})
	return r
}

func (r *ProviderRegistry) Register(p Provider) {
	r.providers[p.Channel()] = p
}

func (r *ProviderRegistry) Get(channel Channel) Provider {
	return r.providers[channel]
}

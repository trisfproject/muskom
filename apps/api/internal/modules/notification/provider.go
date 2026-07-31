package notification

import (
	"context"
)

type Provider interface {
	Send(ctx context.Context, recipient string, subject *string, body string) error
	Channel() Channel
}

// Mock Email Provider
type MockEmailProvider struct{}

func (p *MockEmailProvider) Send(ctx context.Context, recipient string, subject *string, body string) error {
	// Simulated dispatch
	return nil
}
func (p *MockEmailProvider) Channel() Channel { return ChannelEmail }

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

func NewProviderRegistry() *ProviderRegistry {
	r := &ProviderRegistry{
		providers: make(map[Channel]Provider),
	}
	r.Register(&MockEmailProvider{})
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

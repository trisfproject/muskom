package automation

import (
	"github.com/trisfproject/muskom/apps/api/platform/eventbus"
)

type Rule struct {
	ID        string
	EventID   string
	Name      string
	EventType eventbus.EventType
	Provider  string // "EmailProvider", "WebhookProvider"
	Action    string // "SendVerificationEmail"
	Config    map[string]interface{}
	IsActive  bool
}

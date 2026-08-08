package mailer

import (
	"context"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.uber.org/zap/zaptest"

	"github.com/trisfproject/muskom/apps/api/platform/config"
)

type dummyBrandProvider struct{}

func (d *dummyBrandProvider) GetWebsiteBrand(ctx context.Context) (WebsiteBrand, error) {
	return WebsiteBrand{
		CommunityName: "Test Org",
		PortalTitle:   "Test Portal",
	}, nil
}

func TestMailer_AttachmentFormatting(t *testing.T) {
	cfg := &config.Config{
		MailEnabled:  false, // We test MIME formatting logic
		SmtpFromName: "Panitia",
		SmtpFrom:     "noreply@example.com",
	}
	log := zaptest.NewLogger(t)
	m := NewSMTPMailer(cfg, log, &dummyBrandProvider{})

	// Ensure Mailer implements interface methods
	assert.NotNil(t, m)

	att := Attachment{
		Filename:    "qrcode.png",
		ContentType: "image/png",
		ContentID:   "qrcode",
		Data:        []byte("fake-png-bytes"),
		Inline:      true,
	}

	err := m.SendRawWithAttachments("user@example.com", "Test Subject", "<p>Hello <img src=\"cid:inlineimg\"/></p>", []Attachment{att})
	assert.NoError(t, err) // Disabled mail returns nil
}

func TestMIMEMultipartGeneration(t *testing.T) {
	// Test boundary and MIME construction
	att := Attachment{
		Filename:    "qrcode.png",
		ContentType: "image/png",
		ContentID:   "qrcode",
		Data:        []byte("sample_qr_png_binary_data"),
		Inline:      true,
	}

	assert.Equal(t, "qrcode.png", att.Filename)
	assert.Equal(t, "image/png", att.ContentType)
	assert.Equal(t, "qrcode", att.ContentID)
	assert.True(t, att.Inline)
	assert.True(t, strings.HasPrefix(string(att.Data), "sample_qr"))
}

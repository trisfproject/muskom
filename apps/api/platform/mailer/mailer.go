package mailer

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/base64"
	"fmt"
	"html/template"
	"math/rand"
	"mime"
	"mime/quotedprintable"
	"net/smtp"
	"time"

	"github.com/trisfproject/muskom/apps/api/platform/config"
	"go.uber.org/zap"
)

type WebsiteBrand struct {
	CommunityName     string `json:"community_name"`
	PortalTitle       string `json:"portal_title"`
	PortalDescription string `json:"portal_description"`
	LogoURL           string `json:"logo_url"`
	WebsiteURL        string `json:"website_url"`
	ContactEmail      string `json:"contact_email"`
	ContactPhone      string `json:"contact_phone"`
}

type BrandProvider interface {
	GetWebsiteBrand(ctx context.Context) (WebsiteBrand, error)
}

type Attachment struct {
	Filename    string
	ContentType string
	ContentID   string // for inline images (e.g. "qrcode" referenced as cid:qrcode)
	Data        []byte
	Inline      bool
}

type Mailer interface {
	SendTestEmail(to string) error
	TestConnection() error
	SendRaw(to, subject, bodyHTML string) error
	SendRawWithAttachments(to, subject, bodyHTML string, attachments []Attachment) error
}

type smtpMailer struct {
	cfg *config.Config
	log *zap.Logger
	bp  BrandProvider
}

func NewSMTPMailer(cfg *config.Config, log *zap.Logger, bp BrandProvider) Mailer {
	return &smtpMailer{
		cfg: cfg,
		log: log,
		bp:  bp,
	}
}

func (m *smtpMailer) SendTestEmail(to string) error {
	if !m.cfg.MailEnabled {
		m.log.Info("Mail is disabled, skipping sending test email", zap.String("to", to))
		return fmt.Errorf("MAIL_ENABLED is false. Email cannot be sent.")
	}

	subject := "Test Email SMTP Konfigurasi {{.portal_title}}"

	htmlTemplate := `
	<html>
		<body>
			<h2>Konfigurasi SMTP Berhasil!</h2>
			<p>Halo, ini adalah email percobaan dari sistem {{.portal_title}}.</p>
			<p>Jika Anda menerima email ini, berarti pengaturan SMTP Anda sudah benar dan berfungsi dengan baik.</p>
			<p>Salam hangat,<br/>Sistem {{.portal_title}}</p>
		</body>
	</html>
	`
	
	data := m.getBrandMap()

	parsedSubject, err := m.parseAndExecute(subject, data)
	if err != nil {
		parsedSubject = "Test Email SMTP Konfigurasi"
	}

	parsedBody, err := m.parseAndExecute(htmlTemplate, data)
	if err != nil {
		m.log.Error("Failed to parse test email template", zap.Error(err))
		return fmt.Errorf("failed to parse template: %w", err)
	}

	var body bytes.Buffer
	body.WriteString(fmt.Sprintf("To: %s\r\n", to))
	body.WriteString(fmt.Sprintf("From: %s <%s>\r\n", mime.BEncoding.Encode("utf-8", m.cfg.SmtpFromName), m.cfg.SmtpFrom))
	body.WriteString(fmt.Sprintf("Subject: %s\r\n", mime.BEncoding.Encode("utf-8", parsedSubject)))
	body.WriteString("MIME-Version: 1.0\r\n")
	body.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")
	body.WriteString("Content-Transfer-Encoding: 8bit\r\n\r\n")
	body.WriteString(parsedBody)

	return m.sendSMTP(to, body.Bytes())
}

func (m *smtpMailer) SendRaw(to, subject, bodyHTML string) error {
	return m.SendRawWithAttachments(to, subject, bodyHTML, nil)
}

func (m *smtpMailer) SendRawWithAttachments(to, subject, bodyHTML string, attachments []Attachment) error {
	if !m.cfg.MailEnabled {
		m.log.Info("Mail is disabled, skipping SendRawWithAttachments", zap.String("to", to))
		return nil
	}

	brandMap := m.getBrandMap()

	parsedSubject, err := m.parseAndExecute(subject, brandMap)
	if err != nil {
		parsedSubject = subject // fallback
	}

	parsedBody, err := m.parseAndExecute(bodyHTML, brandMap)
	if err != nil {
		parsedBody = bodyHTML // fallback
	}

	var body bytes.Buffer
	body.WriteString(fmt.Sprintf("To: %s\r\n", to))
	body.WriteString(fmt.Sprintf("From: %s <%s>\r\n", mime.BEncoding.Encode("utf-8", m.cfg.SmtpFromName), m.cfg.SmtpFrom))
	body.WriteString(fmt.Sprintf("Subject: %s\r\n", mime.BEncoding.Encode("utf-8", parsedSubject)))
	body.WriteString("MIME-Version: 1.0\r\n")

	if len(attachments) == 0 {
		body.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")
		body.WriteString("Content-Transfer-Encoding: quoted-printable\r\n\r\n")
		w := quotedprintable.NewWriter(&body)
		w.Write([]byte(parsedBody))
		w.Close()
	} else {
		boundary := fmt.Sprintf("boundary_%d_%x", time.Now().UnixNano(), rand.Uint32())
		body.WriteString(fmt.Sprintf("Content-Type: multipart/related; boundary=\"%s\"\r\n\r\n", boundary))

		// HTML part
		body.WriteString(fmt.Sprintf("--%s\r\n", boundary))
		body.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")
		body.WriteString("Content-Transfer-Encoding: quoted-printable\r\n\r\n")
		w := quotedprintable.NewWriter(&body)
		w.Write([]byte(parsedBody))
		w.Close()
		body.WriteString("\r\n")

		// Attachments / Inline Images
		for _, att := range attachments {
			body.WriteString(fmt.Sprintf("--%s\r\n", boundary))
			cType := att.ContentType
			if cType == "" {
				cType = "application/octet-stream"
			}
			body.WriteString(fmt.Sprintf("Content-Type: %s; name=\"%s\"\r\n", cType, att.Filename))
			body.WriteString("Content-Transfer-Encoding: base64\r\n")
			if att.ContentID != "" {
				body.WriteString(fmt.Sprintf("Content-ID: <%s>\r\n", att.ContentID))
			}
			if att.Inline {
				body.WriteString(fmt.Sprintf("Content-Disposition: inline; filename=\"%s\"\r\n\r\n", att.Filename))
			} else {
				body.WriteString(fmt.Sprintf("Content-Disposition: attachment; filename=\"%s\"\r\n\r\n", att.Filename))
			}

			b64 := base64.StdEncoding.EncodeToString(att.Data)
			for i := 0; i < len(b64); i += 76 {
				end := i + 76
				if end > len(b64) {
					end = len(b64)
				}
				body.WriteString(b64[i:end] + "\r\n")
			}
		}
		body.WriteString(fmt.Sprintf("--%s--\r\n", boundary))
	}

	return m.sendSMTP(to, body.Bytes())
}

func (m *smtpMailer) getBrandMap() map[string]interface{} {
	brandMap := map[string]interface{}{
		"community_name":     "MUSKOM",
		"portal_title":       "MUSKOM",
		"portal_description": "",
		"logo_url":           "",
		"website_url":        m.cfg.AppBaseURL,
		"contact_email":      "",
		"contact_phone":      "",
	}

	if m.bp != nil {
		if brand, err := m.bp.GetWebsiteBrand(context.Background()); err == nil {
			brandMap["community_name"] = brand.CommunityName
			if brand.PortalTitle != "" {
				brandMap["portal_title"] = brand.PortalTitle
			}
			brandMap["portal_description"] = brand.PortalDescription
			brandMap["logo_url"] = brand.LogoURL
			brandMap["website_url"] = brand.WebsiteURL
			brandMap["contact_email"] = brand.ContactEmail
			brandMap["contact_phone"] = brand.ContactPhone
		}
	}
	return brandMap
}

func (m *smtpMailer) parseAndExecute(tmplStr string, data map[string]interface{}) (string, error) {
	tmpl, err := template.New("dynamic").Parse(tmplStr)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}

func (m *smtpMailer) sendSMTP(to string, body []byte) error {
	auth := smtp.PlainAuth("", m.cfg.SmtpUsername, m.cfg.SmtpPassword, m.cfg.SmtpHost)
	addr := fmt.Sprintf("%s:%d", m.cfg.SmtpHost, m.cfg.SmtpPort)

	var sendErr error
	if m.cfg.SmtpTls {
		if m.cfg.SmtpPort == 465 {
			tlsConfig := &tls.Config{
				InsecureSkipVerify: false,
				ServerName:         m.cfg.SmtpHost,
			}
			conn, err := tls.Dial("tcp", addr, tlsConfig)
			if err != nil {
				m.log.Error("Failed to dial TLS", zap.Error(err))
				return err
			}
			defer conn.Close()
			client, err := smtp.NewClient(conn, m.cfg.SmtpHost)
			if err != nil {
				m.log.Error("Failed to create SMTP client", zap.Error(err))
				return err
			}
			if err = client.Auth(auth); err != nil {
				m.log.Error("Failed to authenticate SMTP", zap.Error(err))
				return err
			}
			if err = client.Mail(m.cfg.SmtpFrom); err != nil {
				return err
			}
			if err = client.Rcpt(to); err != nil {
				return err
			}
			w, err := client.Data()
			if err != nil {
				return err
			}
			_, err = w.Write(body)
			if err != nil {
				return err
			}
			if err = w.Close(); err != nil {
				return err
			}
			sendErr = client.Quit()
		} else {
			sendErr = smtp.SendMail(addr, auth, m.cfg.SmtpFrom, []string{to}, body)
		}
	} else {
		sendErr = smtp.SendMail(addr, auth, m.cfg.SmtpFrom, []string{to}, body)
	}

	if sendErr != nil {
		m.log.Error("Failed to send SMTP email", zap.Error(sendErr))
		return fmt.Errorf("failed to send email: %w", sendErr)
	}
	return nil
}

func (m *smtpMailer) TestConnection() error {
	addr := fmt.Sprintf("%s:%d", m.cfg.SmtpHost, m.cfg.SmtpPort)
	if m.cfg.SmtpPort == 465 {
		tlsConfig := &tls.Config{
			InsecureSkipVerify: false,
			ServerName:         m.cfg.SmtpHost,
		}
		conn, err := tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			return fmt.Errorf("failed to connect via TLS to %s: %w", addr, err)
		}
		defer conn.Close()

		client, err := smtp.NewClient(conn, m.cfg.SmtpHost)
		if err != nil {
			return fmt.Errorf("failed to create SMTP client: %w", err)
		}
		defer client.Close()

		if m.cfg.SmtpUsername != "" {
			auth := smtp.PlainAuth("", m.cfg.SmtpUsername, m.cfg.SmtpPassword, m.cfg.SmtpHost)
			if err := client.Auth(auth); err != nil {
				return fmt.Errorf("authentication failed: %w", err)
			}
		}
		return nil
	}

	client, err := smtp.Dial(addr)
	if err != nil {
		return fmt.Errorf("failed to connect to %s: %w", addr, err)
	}
	defer client.Close()

	if m.cfg.SmtpTls {
		tlsConfig := &tls.Config{
			InsecureSkipVerify: false,
			ServerName:         m.cfg.SmtpHost,
		}
		if err := client.StartTLS(tlsConfig); err != nil {
			return fmt.Errorf("StartTLS failed: %w", err)
		}
	}

	if m.cfg.SmtpUsername != "" {
		auth := smtp.PlainAuth("", m.cfg.SmtpUsername, m.cfg.SmtpPassword, m.cfg.SmtpHost)
		if err := client.Auth(auth); err != nil {
			return fmt.Errorf("authentication failed: %w", err)
		}
	}

	return nil
}

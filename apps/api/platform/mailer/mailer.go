package mailer

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"html/template"
	"net/smtp"

	"context"
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

type Mailer interface {
	SendRegistrationConfirmation(to, participantName, regNumber, musyawarahName, company, regTime, status string) error
	SendVerification(to, participantName, regNumber, musyawarahName string) error
	SendRejection(to, participantName, musyawarahName, reason string) error
	SendTestEmail(to string) error
	TestConnection() error
	SendRaw(to, subject, bodyHTML string) error
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

func (m *smtpMailer) SendRegistrationConfirmation(to, participantName, regNumber, musyawarahName, company, regTime, status string) error {
	if !m.cfg.MailEnabled {
		m.log.Info("Mail is disabled, skipping sending registration confirmation", zap.String("to", to))
		return nil
	}

	subject := "Pendaftaran Peserta {{.portal_title}} Berhasil"

	htmlTemplate := `
	<html>
		<body>
			<p>Halo <strong>{{.participant_name}}</strong>,</p>
			<p>Terima kasih telah mendaftar pada acara <strong>{{.portal_title}}</strong>.</p>
			<p>Status Anda saat ini: <strong>Menunggu Verifikasi</strong>.</p>
			<p>Silakan cek status pendaftaran Anda secara berkala melalui tautan berikut:</p>
			<p><a href="{{.lookup_url}}">{{.lookup_url}}</a></p>
			<p>Salam hangat,<br/>Panitia {{.portal_title}}</p>
		</body>
	</html>
	`

	data := m.getBrandMap()
	data["participant_name"] = participantName
	data["lookup_url"] = fmt.Sprintf("%s/peserta", m.cfg.AppBaseURL)

	parsedSubject, err := m.parseAndExecute(subject, data)
	if err != nil {
		parsedSubject = "Pendaftaran Peserta Berhasil"
	}

	parsedBody, err := m.parseAndExecute(htmlTemplate, data)
	if err != nil {
		m.log.Error("Failed to parse email template", zap.Error(err))
		return fmt.Errorf("failed to parse template: %w", err)
	}

	// Create email body
	var body bytes.Buffer
	body.WriteString(fmt.Sprintf("To: %s\r\n", to))
	body.WriteString(fmt.Sprintf("From: %s <%s>\r\n", m.cfg.SmtpFromName, m.cfg.SmtpFrom))
	body.WriteString(fmt.Sprintf("Subject: %s\r\n", parsedSubject))
	body.WriteString("MIME-version: 1.0;\r\n")
	body.WriteString("Content-Type: text/html; charset=\"UTF-8\";\r\n\r\n")
	body.WriteString(parsedBody)

	if err := m.sendSMTP(to, body.Bytes()); err != nil {
		return err
	}

	m.log.Info("Participant registration email sent successfully", zap.String("to", to))
	return nil
}

func (m *smtpMailer) SendVerification(to, participantName, regNumber, musyawarahName string) error {
	if !m.cfg.MailEnabled {
		m.log.Info("Mail is disabled, skipping sending verification email", zap.String("to", to))
		return nil
	}

	subject := "Peserta Berhasil Diverifikasi"

	htmlTemplate := `
	<html>
		<body>
			<p>Selamat!</p>
			<p>Pendaftaran Anda telah diverifikasi.</p>
			<p>Nomor Registrasi:</p>
			<p><strong>{{.reg_number}}</strong></p>
			<p>Silakan membuka kartu peserta melalui:</p>
			<p><a href="{{.lookup_url}}">{{.lookup_url}}</a></p>
			<p>Salam hangat,<br/>Panitia {{.portal_title}}</p>
		</body>
	</html>
	`
	
	data := m.getBrandMap()
	data["participant_name"] = participantName
	data["reg_number"] = regNumber
	data["lookup_url"] = fmt.Sprintf("%s/peserta", m.cfg.AppBaseURL)

	parsedSubject, err := m.parseAndExecute(subject, data)
	if err != nil {
		parsedSubject = "Peserta Berhasil Diverifikasi"
	}

	parsedBody, err := m.parseAndExecute(htmlTemplate, data)
	if err != nil {
		m.log.Error("Failed to parse verification email template", zap.Error(err))
		return fmt.Errorf("failed to parse template: %w", err)
	}

	var body bytes.Buffer
	body.WriteString(fmt.Sprintf("To: %s\r\n", to))
	body.WriteString(fmt.Sprintf("From: %s <%s>\r\n", m.cfg.SmtpFromName, m.cfg.SmtpFrom))
	body.WriteString(fmt.Sprintf("Subject: %s\r\n", parsedSubject))
	body.WriteString("MIME-version: 1.0;\r\n")
	body.WriteString("Content-Type: text/html; charset=\"UTF-8\";\r\n\r\n")
	body.WriteString(parsedBody)

	return m.sendSMTP(to, body.Bytes())
}

func (m *smtpMailer) SendRejection(to, participantName, musyawarahName, reason string) error {
	if !m.cfg.MailEnabled {
		m.log.Info("Mail is disabled, skipping sending rejection email", zap.String("to", to))
		return nil
	}

	subject := "Status Pendaftaran Anda"

	htmlTemplate := `
	<html>
		<body>
			<p>Halo <strong>{{.participant_name}}</strong>,</p>
			<p>Mohon maaf, pendaftaran Anda untuk acara <strong>{{.portal_title}}</strong> <strong>Ditolak</strong> oleh panitia.</p>
			{{if .reason}}
			<p><strong>Alasan:</strong> {{.reason}}</p>
			{{end}}
			<p>Jika ada pertanyaan, silakan hubungi panitia melalui kontak yang tersedia di website.</p>
			<p>Salam hangat,<br/>Panitia {{.portal_title}}</p>
		</body>
	</html>
	`
	data := m.getBrandMap()
	data["participant_name"] = participantName
	data["reason"] = reason

	parsedSubject, err := m.parseAndExecute(subject, data)
	if err != nil {
		parsedSubject = "Status Pendaftaran Anda"
	}

	parsedBody, err := m.parseAndExecute(htmlTemplate, data)
	if err != nil {
		m.log.Error("Failed to parse rejection email template", zap.Error(err))
		return fmt.Errorf("failed to parse template: %w", err)
	}

	var body bytes.Buffer
	body.WriteString(fmt.Sprintf("To: %s\r\n", to))
	body.WriteString(fmt.Sprintf("From: %s <%s>\r\n", m.cfg.SmtpFromName, m.cfg.SmtpFrom))
	body.WriteString(fmt.Sprintf("Subject: %s\r\n", parsedSubject))
	body.WriteString("MIME-version: 1.0;\r\n")
	body.WriteString("Content-Type: text/html; charset=\"UTF-8\";\r\n\r\n")
	body.WriteString(parsedBody)

	return m.sendSMTP(to, body.Bytes())
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
	body.WriteString(fmt.Sprintf("From: %s <%s>\r\n", m.cfg.SmtpFromName, m.cfg.SmtpFrom))
	body.WriteString(fmt.Sprintf("Subject: %s\r\n", parsedSubject))
	body.WriteString("MIME-version: 1.0;\r\n")
	body.WriteString("Content-Type: text/html; charset=\"UTF-8\";\r\n\r\n")
	body.WriteString(parsedBody)

	return m.sendSMTP(to, body.Bytes())
}

func (m *smtpMailer) SendRaw(to, subject, bodyHTML string) error {
	if !m.cfg.MailEnabled {
		m.log.Info("Mail is disabled, skipping SendRaw", zap.String("to", to))
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
	body.WriteString(fmt.Sprintf("From: %s <%s>\r\n", m.cfg.SmtpFromName, m.cfg.SmtpFrom))
	body.WriteString(fmt.Sprintf("Subject: %s\r\n", parsedSubject))
	body.WriteString("MIME-version: 1.0;\r\n")
	body.WriteString("Content-Type: text/html; charset=\"UTF-8\";\r\n\r\n")
	body.WriteString(parsedBody)

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

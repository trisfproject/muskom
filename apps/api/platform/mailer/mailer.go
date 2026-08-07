package mailer

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"html/template"
	"net/smtp"

	"github.com/trisfproject/muskom/apps/api/platform/config"
	"go.uber.org/zap"
)

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
}

func NewSMTPMailer(cfg *config.Config, log *zap.Logger) Mailer {
	return &smtpMailer{
		cfg: cfg,
		log: log,
	}
}

func (m *smtpMailer) SendRegistrationConfirmation(to, participantName, regNumber, musyawarahName, company, regTime, status string) error {
	if !m.cfg.MailEnabled {
		m.log.Info("Mail is disabled, skipping sending registration confirmation", zap.String("to", to))
		return nil
	}

	subject := "Pendaftaran Peserta MUSKOM Berhasil"

	// Create email body
	var body bytes.Buffer
	body.WriteString(fmt.Sprintf("To: %s\r\n", to))
	body.WriteString(fmt.Sprintf("From: %s <%s>\r\n", m.cfg.SmtpFromName, m.cfg.SmtpFrom))
	body.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	body.WriteString("MIME-version: 1.0;\r\n")
	body.WriteString("Content-Type: text/html; charset=\"UTF-8\";\r\n\r\n")

	htmlTemplate := `
	<html>
		<body>
			<p>Halo <strong>{{.ParticipantName}}</strong>,</p>
			<p>Terima kasih telah mendaftar pada acara <strong>{{.MusyawarahName}}</strong>.</p>
			<p>Status Anda saat ini: <strong>Menunggu Verifikasi</strong>.</p>
			<p>Silakan cek status pendaftaran Anda secara berkala melalui tautan berikut:</p>
			<p><a href="{{.LookupURL}}">{{.LookupURL}}</a></p>
			<p>Salam hangat,<br/>Panitia {{.MusyawarahName}}</p>
		</body>
	</html>
	`

	tmpl, err := template.New("email").Parse(htmlTemplate)
	if err != nil {
		m.log.Error("Failed to parse email template", zap.Error(err))
		return fmt.Errorf("failed to parse template: %w", err)
	}

	data := struct {
		ParticipantName string
		MusyawarahName  string
		LookupURL       string
	}{
		ParticipantName: participantName,
		MusyawarahName:  musyawarahName,
		LookupURL:       fmt.Sprintf("%s/peserta", m.cfg.AppBaseURL),
	}

	if err := tmpl.Execute(&body, data); err != nil {
		m.log.Error("Failed to execute email template", zap.Error(err))
		return fmt.Errorf("failed to execute template: %w", err)
	}

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

	var body bytes.Buffer
	body.WriteString(fmt.Sprintf("To: %s\r\n", to))
	body.WriteString(fmt.Sprintf("From: %s <%s>\r\n", m.cfg.SmtpFromName, m.cfg.SmtpFrom))
	body.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	body.WriteString("MIME-version: 1.0;\r\n")
	body.WriteString("Content-Type: text/html; charset=\"UTF-8\";\r\n\r\n")

	htmlTemplate := `
	<html>
		<body>
			<p>Selamat!</p>
			<p>Pendaftaran Anda telah diverifikasi.</p>
			<p>Nomor Registrasi:</p>
			<p><strong>{{.RegNumber}}</strong></p>
			<p>Silakan membuka kartu peserta melalui:</p>
			<p><a href="{{.LookupURL}}">{{.LookupURL}}</a></p>
			<p>Salam hangat,<br/>Panitia {{.MusyawarahName}}</p>
		</body>
	</html>
	`
	tmpl, err := template.New("email").Parse(htmlTemplate)
	if err != nil {
		m.log.Error("Failed to parse verification email template", zap.Error(err))
		return fmt.Errorf("failed to parse template: %w", err)
	}

	data := struct {
		ParticipantName string
		MusyawarahName  string
		RegNumber       string
		LookupURL       string
	}{
		ParticipantName: participantName,
		MusyawarahName:  musyawarahName,
		RegNumber:       regNumber,
		LookupURL:       fmt.Sprintf("%s/peserta", m.cfg.AppBaseURL),
	}

	if err := tmpl.Execute(&body, data); err != nil {
		m.log.Error("Failed to execute verification email template", zap.Error(err))
		return fmt.Errorf("failed to execute template: %w", err)
	}

	return m.sendSMTP(to, body.Bytes())
}

func (m *smtpMailer) SendRejection(to, participantName, musyawarahName, reason string) error {
	if !m.cfg.MailEnabled {
		m.log.Info("Mail is disabled, skipping sending rejection email", zap.String("to", to))
		return nil
	}

	subject := "Status Pendaftaran Anda"

	var body bytes.Buffer
	body.WriteString(fmt.Sprintf("To: %s\r\n", to))
	body.WriteString(fmt.Sprintf("From: %s <%s>\r\n", m.cfg.SmtpFromName, m.cfg.SmtpFrom))
	body.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	body.WriteString("MIME-version: 1.0;\r\n")
	body.WriteString("Content-Type: text/html; charset=\"UTF-8\";\r\n\r\n")

	htmlTemplate := `
	<html>
		<body>
			<p>Halo <strong>{{.ParticipantName}}</strong>,</p>
			<p>Mohon maaf, pendaftaran Anda untuk acara <strong>{{.MusyawarahName}}</strong> <strong>Ditolak</strong> oleh panitia.</p>
			{{if .Reason}}
			<p><strong>Alasan:</strong> {{.Reason}}</p>
			{{end}}
			<p>Jika ada pertanyaan, silakan hubungi panitia melalui kontak yang tersedia di website.</p>
			<p>Salam hangat,<br/>Panitia {{.MusyawarahName}}</p>
		</body>
	</html>
	`
	tmpl, err := template.New("email").Parse(htmlTemplate)
	if err != nil {
		m.log.Error("Failed to parse rejection email template", zap.Error(err))
		return fmt.Errorf("failed to parse template: %w", err)
	}

	data := struct {
		ParticipantName string
		MusyawarahName  string
		Reason          string
	}{
		ParticipantName: participantName,
		MusyawarahName:  musyawarahName,
		Reason:          reason,
	}

	if err := tmpl.Execute(&body, data); err != nil {
		m.log.Error("Failed to execute rejection email template", zap.Error(err))
		return fmt.Errorf("failed to execute template: %w", err)
	}

	return m.sendSMTP(to, body.Bytes())
}

func (m *smtpMailer) SendTestEmail(to string) error {
	if !m.cfg.MailEnabled {
		m.log.Info("Mail is disabled, skipping sending test email", zap.String("to", to))
		return fmt.Errorf("MAIL_ENABLED is false. Email cannot be sent.")
	}

	subject := "Test Email SMTP Konfigurasi MUSKOM"

	var body bytes.Buffer
	body.WriteString(fmt.Sprintf("To: %s\r\n", to))
	body.WriteString(fmt.Sprintf("From: %s <%s>\r\n", m.cfg.SmtpFromName, m.cfg.SmtpFrom))
	body.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	body.WriteString("MIME-version: 1.0;\r\n")
	body.WriteString("Content-Type: text/html; charset=\"UTF-8\";\r\n\r\n")

	htmlTemplate := `
	<html>
		<body>
			<h2>Konfigurasi SMTP Berhasil!</h2>
			<p>Halo, ini adalah email percobaan dari sistem MUSKOM.</p>
			<p>Jika Anda menerima email ini, berarti pengaturan SMTP Anda sudah benar dan berfungsi dengan baik.</p>
			<p>Salam hangat,<br/>Sistem MUSKOM</p>
		</body>
	</html>
	`
	tmpl, err := template.New("email").Parse(htmlTemplate)
	if err != nil {
		m.log.Error("Failed to parse test email template", zap.Error(err))
		return fmt.Errorf("failed to parse template: %w", err)
	}

	if err := tmpl.Execute(&body, nil); err != nil {
		m.log.Error("Failed to execute test email template", zap.Error(err))
		return fmt.Errorf("failed to execute template: %w", err)
	}

	return m.sendSMTP(to, body.Bytes())
}

func (m *smtpMailer) SendRaw(to, subject, bodyHTML string) error {
	if !m.cfg.MailEnabled {
		m.log.Info("Mail is disabled, skipping SendRaw", zap.String("to", to))
		return nil
	}

	var body bytes.Buffer
	body.WriteString(fmt.Sprintf("To: %s\r\n", to))
	body.WriteString(fmt.Sprintf("From: %s <%s>\r\n", m.cfg.SmtpFromName, m.cfg.SmtpFrom))
	body.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	body.WriteString("MIME-version: 1.0;\r\n")
	body.WriteString("Content-Type: text/html; charset=\"UTF-8\";\r\n\r\n")
	body.WriteString(bodyHTML)

	if err := m.sendSMTP(to, body.Bytes()); err != nil {
		m.log.Error("Failed to send raw email", zap.Error(err))
		return err
	}

	m.log.Info("Raw email sent successfully", zap.String("to", to))
	return nil
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

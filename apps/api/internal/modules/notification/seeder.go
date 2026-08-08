package notification

import (
	"context"
	"database/sql"

	"go.uber.org/zap"
)

func SeedDefaultTemplates(ctx context.Context, repo Repository, log *zap.Logger) error {
	defaultTemplates := []NotificationTemplate{
		{
			Name:    "participant_registration_submitted",
			Channel: ChannelEmail,
			Subject: ptr("Pendaftaran Peserta Diterima — {{website_title}}"),
			Body: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pendaftaran Peserta Diterima</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .header { background-color: #1f2937; color: #ffffff; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 8px 0 0 0; font-size: 14px; color: #d1d5db; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-top: 0; margin-bottom: 16px; }
        .text { font-size: 16px; margin-bottom: 24px; }
        .info-card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .info-section { margin-bottom: 16px; }
        .info-section:last-child { margin-bottom: 0; }
        .info-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin: 0 0 4px 0; letter-spacing: 0.05em; }
        .status-badge { display: inline-block; padding: 6px 12px; background-color: #fef3c7; color: #92400e; border-radius: 9999px; font-size: 14px; font-weight: 600; margin-top: 8px; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; font-size: 14px; color: #6b7280; }
        .footer-logo { font-weight: 700; color: #374151; margin-top: 12px; }
        @media (prefers-color-scheme: dark) {
            body { background-color: #111827; color: #d1d5db; }
            .container { background-color: #1f2937; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5); }
            .header { background-color: #111827; border-bottom: 1px solid #374151; }
            .content { background-color: #1f2937; }
            .greeting, .footer-logo { color: #f3f4f6; }
            .info-card { background-color: #111827; border-color: #374151; }
            .footer { background-color: #111827; border-color: #374151; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{.website_title}}</h1>
            <p>{{.organization_name}}</p>
        </div>
        <div class="content">
            <p class="greeting">Halo {{.full_name}},</p>
            <div class="text">
                <p>Terima kasih. Pendaftaran Anda untuk <strong>{{.website_title}}</strong> telah kami terima.</p>
                <p>Data pendaftaran Anda sedang menunggu proses verifikasi oleh panitia.</p>
            </div>
            
            <div class="info-card">
                <div class="info-section">
                    <p class="info-title">Status</p>
                    <div class="status-badge">Menunggu Verifikasi</div>
                </div>
            </div>
            
            <div class="text" style="font-size: 14px; color: #6b7280;">
                <p>Peserta akan menerima email berikutnya setelah proses verifikasi selesai.</p>
            </div>
        </div>
        <div class="footer">
            <p>Email ini dikirimkan otomatis oleh sistem.</p>
            <div class="footer-logo">{{.website_title}}</div>
        </div>
    </div>
</body>
</html>`,
		},
		{
			Name:    "participant_registration_approved",
			Channel: ChannelEmail,
			Subject: ptr("Pendaftaran Peserta Disetujui — {{website_title}}"),
			Body: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pendaftaran Peserta Disetujui</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .header { background-color: #1f2937; color: #ffffff; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 8px 0 0 0; font-size: 14px; color: #d1d5db; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-top: 0; margin-bottom: 16px; }
        .text { font-size: 16px; margin-bottom: 24px; }
        .info-card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .info-section { margin-bottom: 16px; }
        .info-section:last-child { margin-bottom: 0; }
        .info-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin: 0 0 4px 0; letter-spacing: 0.05em; }
        .info-value { font-size: 16px; font-weight: 600; color: #111827; margin: 0; }
        .cta-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.2s; }
        .btn:hover { background-color: #1d4ed8; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; font-size: 14px; color: #6b7280; }
        .footer-logo { font-weight: 700; color: #374151; margin-top: 12px; }
        @media (prefers-color-scheme: dark) {
            body { background-color: #111827; color: #d1d5db; }
            .container { background-color: #1f2937; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5); }
            .header { background-color: #111827; border-bottom: 1px solid #374151; }
            .content { background-color: #1f2937; }
            .greeting, .info-value, .footer-logo { color: #f3f4f6; }
            .info-card { background-color: #111827; border-color: #374151; }
            .footer { background-color: #111827; border-color: #374151; }
            .btn { background-color: #3b82f6; }
            .btn:hover { background-color: #2563eb; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{.website_title}}</h1>
            <p>{{.organization_name}}</p>
        </div>
        <div class="content">
            <p class="greeting">Halo {{.full_name}},</p>
            <div class="text">
                <p>Selamat!</p>
                <p>Pendaftaran Anda untuk <strong>{{.website_title}}</strong> telah disetujui oleh panitia.</p>
            </div>
            
            <div class="info-card">
                <div class="info-section">
                    <p class="info-title">Informasi Peserta</p>
                    <p class="info-value">Nomor Registrasi: <span style="font-family: monospace; color: #2563eb;">{{.registration_number}}</span></p>
                </div>
                <div style="height: 1px; background-color: #e5e7eb; margin: 16px 0;"></div>
                <div class="info-section">
                    <p class="info-title">Informasi Acara</p>
                    <p class="info-value" style="font-size: 14px; margin-top: 4px;">Tanggal: {{.event_date}}</p>
                    <p class="info-value" style="font-size: 14px; margin-top: 4px;">Waktu: {{.event_time}}</p>
                    <p class="info-value" style="font-size: 14px; margin-top: 4px;">Lokasi: {{.event_location}}</p>
                </div>
            </div>
            
            <div class="cta-container">
                <a href="{{.participant_url}}" class="btn">Lihat / Download Kartu Peserta</a>
            </div>
        </div>
        <div class="footer">
            <p>Email ini dikirimkan otomatis oleh sistem.</p>
            <div class="footer-logo">{{.website_title}}</div>
        </div>
    </div>
</body>
</html>`,
		},
		{
			Name:    "participant_registration_rejected",
			Channel: ChannelEmail,
			Subject: ptr("Pendaftaran Peserta Belum Disetujui — {{website_title}}"),
			Body: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pendaftaran Peserta Belum Disetujui</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .header { background-color: #1f2937; color: #ffffff; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 8px 0 0 0; font-size: 14px; color: #d1d5db; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-top: 0; margin-bottom: 16px; }
        .text { font-size: 16px; margin-bottom: 24px; }
        .info-card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .info-section { margin-bottom: 16px; }
        .info-section:last-child { margin-bottom: 0; }
        .info-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin: 0 0 4px 0; letter-spacing: 0.05em; }
        .info-value { font-size: 16px; font-weight: 600; color: #111827; margin: 0; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; font-size: 14px; color: #6b7280; }
        .footer-logo { font-weight: 700; color: #374151; margin-top: 12px; }
        @media (prefers-color-scheme: dark) {
            body { background-color: #111827; color: #d1d5db; }
            .container { background-color: #1f2937; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5); }
            .header { background-color: #111827; border-bottom: 1px solid #374151; }
            .content { background-color: #1f2937; }
            .greeting, .info-value, .footer-logo { color: #f3f4f6; }
            .info-card { background-color: #111827; border-color: #374151; }
            .footer { background-color: #111827; border-color: #374151; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{.website_title}}</h1>
            <p>{{.organization_name}}</p>
        </div>
        <div class="content">
            <p class="greeting">Halo {{.full_name}},</p>
            <div class="text">
                <p>Setelah proses verifikasi, pendaftaran Anda belum dapat disetujui oleh panitia.</p>
            </div>
            
            {{if .rejection_reason}}
            <div class="info-card" style="background-color: #fef2f2; border-color: #fecaca;">
                <div class="info-section">
                    <p class="info-title" style="color: #991b1b;">Alasan</p>
                    <p class="info-value" style="color: #7f1d1d; font-size: 15px;">{{.rejection_reason}}</p>
                </div>
            </div>
            {{end}}
        </div>
        <div class="footer">
            <p>Email ini dikirimkan otomatis oleh sistem.</p>
            <div class="footer-logo">{{.website_title}}</div>
        </div>
    </div>
</body>
</html>`,
		},
		{
			Name:    "candidate_registration_submitted",
			Channel: ChannelEmail,
			Subject: ptr("Candidate Registration Received"),
			Body: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Candidate Registration Received</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        .status-badge { display: inline-block; padding: 6px 12px; background-color: #fef3c7; color: #92400e; border-radius: 9999px; font-size: 14px; font-weight: bold; margin: 15px 0; }
        @media (prefers-color-scheme: dark) {
            body { color: #e2e8f0; background-color: #0f172a; }
            .content { background-color: #1e293b; border-color: #334155; }
            .footer { color: #94a3b8; }
            .status-badge { background-color: #78350f; color: #fde68a; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>{{.event_name}}</h2>
    </div>
    <div class="content">
        <p>Halo <strong>{{.full_name}}</strong>,</p>
        <p>Terima kasih, berkas pendaftaran Anda sebagai Kandidat Ketua telah kami terima.</p>
        <div class="status-badge">Menunggu Verifikasi</div>
        <p>Panitia akan melakukan proses verifikasi dokumen administrasi. Kami akan menghubungi Anda jika ada dokumen yang perlu dilengkapi.</p>
    </div>
    <div class="footer">
        <p>Email ini dihasilkan otomatis oleh sistem {{.portal_title}}.</p>
    </div>
</body>
</html>`,
		},
		{
			Name:    "candidate_registration_approved",
			Channel: ChannelEmail,
			Subject: ptr("Candidate Registration Approved"),
			Body: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Candidate Registration Approved</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        @media (prefers-color-scheme: dark) {
            body { color: #e2e8f0; background-color: #0f172a; }
            .content { background-color: #1e293b; border-color: #334155; }
            .footer { color: #94a3b8; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Pendaftaran Kandidat Disetujui</h2>
    </div>
    <div class="content">
        <p>Selamat <strong>{{.full_name}}</strong>,</p>
        <p>Pendaftaran Anda sebagai Kandidat Ketua telah <strong>Disetujui</strong>.</p>
        <p>Nomor Kandidat Anda adalah: <strong>{{.candidate_number}}</strong></p>
    </div>
    <div class="footer">
        <p>Email ini dihasilkan otomatis oleh sistem {{.portal_title}}.</p>
    </div>
</body>
</html>`,
		},
		{
			Name:    "candidate_registration_rejected",
			Channel: ChannelEmail,
			Subject: ptr("Candidate Registration Rejected"),
			Body: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Candidate Registration Rejected</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        @media (prefers-color-scheme: dark) {
            body { color: #e2e8f0; background-color: #0f172a; }
            .content { background-color: #1e293b; border-color: #334155; }
            .footer { color: #94a3b8; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Pemberitahuan Pendaftaran Kandidat</h2>
    </div>
    <div class="content">
        <p>Halo <strong>{{.full_name}}</strong>,</p>
        <p>Mohon maaf, pendaftaran Anda sebagai Kandidat Ketua tidak dapat kami setujui.</p>
    </div>
    <div class="footer">
        <p>Email ini dihasilkan otomatis oleh sistem {{.portal_title}}.</p>
    </div>
</body>
</html>`,
		},
		{
			Name:    "candidate_published",
			Channel: ChannelEmail,
			Subject: ptr("Kandidat Dipublikasikan - {{portal_title}}"),
			Body: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Candidate Published</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        .btn { display: inline-block; background-color: #0f172a; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin-top: 15px; }
        @media (prefers-color-scheme: dark) {
            body { color: #e2e8f0; background-color: #0f172a; }
            .content { background-color: #1e293b; border-color: #334155; }
            .footer { color: #94a3b8; }
            .btn { background-color: #38bdf8; color: #0f172a; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Profil Kandidat Dipublikasikan</h2>
    </div>
    <div class="content">
        <p>Halo <strong>{{.full_name}}</strong>,</p>
        <p>Profil Anda sebagai kandidat nomor <strong>{{.candidate_number}}</strong> telah dipublikasikan di website resmi.</p>
        <div style="text-align: center; margin-top: 20px;">
            <a href="{{.candidate_profile_url}}" class="btn">Lihat Profil Anda</a>
        </div>
    </div>
    <div class="footer">
        <p>Email ini dihasilkan otomatis oleh sistem {{.portal_title}}.</p>
    </div>
</body>
</html>`,
		},
		{
			Name:    "password_reset",
			Channel: ChannelEmail,
			Subject: ptr("Password Reset Request"),
			Body: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        .btn { display: inline-block; background-color: #0f172a; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin-top: 15px; }
        @media (prefers-color-scheme: dark) {
            body { color: #e2e8f0; background-color: #0f172a; }
            .content { background-color: #1e293b; border-color: #334155; }
            .footer { color: #94a3b8; }
            .btn { background-color: #38bdf8; color: #0f172a; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Reset Password</h2>
    </div>
    <div class="content">
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk melakukan reset password akun Anda.</p>
        <div style="text-align: center; margin-top: 20px;">
            <a href="{{.verification_url}}" class="btn">Reset Password</a>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #64748b;">Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
    </div>
    <div class="footer">
        <p>Email ini dihasilkan otomatis oleh sistem {{.portal_title}}.</p>
    </div>
</body>
</html>`,
		},
		{
			Name:    "test_email",
			Channel: ChannelEmail,
			Subject: ptr("Test Email - {{.portal_title}}"),
			Body: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Email</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        @media (prefers-color-scheme: dark) {
            body { color: #e2e8f0; background-color: #0f172a; }
            .content { background-color: #1e293b; border-color: #334155; }
            .footer { color: #94a3b8; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>SMTP Configuration Test</h2>
    </div>
    <div class="content">
        <p>Halo,</p>
        <p>Jika Anda menerima email ini, berarti konfigurasi SMTP sistem {{.portal_title}} Anda telah berhasil.</p>
        <p>Waktu Pengujian: <strong>{{.timestamp}}</strong></p>
        <p>Terima kasih.</p>
    </div>
    <div class="footer">
        <p>Email ini dihasilkan otomatis oleh sistem {{.portal_title}}.</p>
    </div>
</body>
</html>`,
		},
		{
			Name:    "voting_invitation",
			Channel: ChannelEmail,
			Subject: ptr("Undangan E-Voting - {{.event_name}}"),
			Body: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Undangan E-Voting</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        .btn { display: inline-block; background-color: #0f172a; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin-top: 15px; }
        @media (prefers-color-scheme: dark) {
            body { color: #e2e8f0; background-color: #0f172a; }
            .content { background-color: #1e293b; border-color: #334155; }
            .footer { color: #94a3b8; }
            .btn { background-color: #38bdf8; color: #0f172a; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Sesi E-Voting Dimulai</h2>
    </div>
    <div class="content">
        <p>Halo,</p>
        <p>Sesi pemilihan ketua pada acara <strong>{{.event_name}}</strong> telah resmi dibuka.</p>
        <p>Silakan berikan hak suara Anda dengan menekan tombol di bawah ini:</p>
        <div style="text-align: center; margin-top: 20px;">
            <a href="{{.voting_url}}" class="btn">Masuk ke Bilik Suara</a>
        </div>
    </div>
    <div class="footer">
        <p>Email ini dihasilkan otomatis oleh sistem {{.portal_title}}.</p>
    </div>
</body>
</html>`,
		},
	}

	for _, tpl := range defaultTemplates {
		// Check if exists
		_, err := repo.GetTemplateByName(ctx, tpl.Name, tpl.Channel)
		if err != nil {
			if err == sql.ErrNoRows {
				// Insert template
				log.Info("Seeding default template", zap.String("name", tpl.Name))
				err = repo.CreateTemplate(ctx, &tpl)
				if err != nil {
					log.Error("Failed to seed template", zap.String("name", tpl.Name), zap.Error(err))
				}
			} else {
				log.Error("Error checking template", zap.String("name", tpl.Name), zap.Error(err))
			}
		}
	}

	return nil
}

func ptr(s string) *string {
	return &s
}

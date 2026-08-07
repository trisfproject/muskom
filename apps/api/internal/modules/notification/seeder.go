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
			Subject: ptr("Registration Received - MUSKOM 2026"),
			Body: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Received</title>
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
        <p>Terima kasih, data pendaftaran Anda telah kami terima.</p>
        <p>Status pendaftaran Anda saat ini:</p>
        <div class="status-badge">Menunggu Verifikasi</div>
        <p>Panitia akan melakukan verifikasi terhadap data dan dokumen yang Anda kirimkan. Proses ini mungkin memerlukan waktu.</p>
        <p>Jika pendaftaran Anda disetujui, kami akan mengirimkan Email Konfirmasi yang berisi <strong>Nomor Registrasi</strong> dan <strong>QR Code</strong> Anda untuk akses ke acara.</p>
        <p>Terima kasih atas partisipasi Anda.</p>
    </div>
    <div class="footer">
        <p>Email ini dihasilkan otomatis oleh sistem MUSKOM. Jangan membalas email ini.</p>
    </div>
</body>
</html>`,
		},
		{
			Name:    "participant_registration_approved",
			Channel: ChannelEmail,
			Subject: ptr("Registration Approved - MUSKOM 2026"),
			Body: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Approved</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        .btn { display: inline-block; background-color: #0f172a; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin-top: 15px; }
        .qr-container { text-align: center; margin: 20px 0; padding: 15px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; display: inline-block; }
        @media (prefers-color-scheme: dark) {
            body { color: #e2e8f0; background-color: #0f172a; }
            .content { background-color: #1e293b; border-color: #334155; }
            .info-box { background-color: #0f172a; border-color: #334155; }
            .footer { color: #94a3b8; }
            .btn { background-color: #38bdf8; color: #0f172a; }
            .qr-container { background: #fff; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Pendaftaran Disetujui!</h2>
    </div>
    <div class="content">
        <p>Selamat <strong>{{.full_name}}</strong>,</p>
        <p>Pendaftaran Anda untuk acara <strong>{{.event_name}}</strong> telah disetujui oleh panitia.</p>
        
        <div class="info-box">
            <p style="margin: 0 0 10px 0;"><strong>Nomor Registrasi:</strong> <span style="font-size: 18px; font-family: monospace;">{{.registration_number}}</span></p>
            <p style="margin: 0 0 5px 0;"><strong>Tanggal:</strong> {{.event_date}}</p>
            <p style="margin: 0;"><strong>Lokasi:</strong> {{.venue}}</p>
        </div>

        <div style="text-align: center;">
            <p>Tunjukkan QR Code ini kepada panitia saat registrasi ulang di lokasi acara:</p>
            <div class="qr-container">
                <img src="{{.qr_code}}" alt="QR Code" width="200" height="200">
            </div>
        </div>

        <div style="text-align: center; margin-top: 20px;">
            <a href="{{.participant_lookup_url}}" class="btn">Lihat Profil Peserta</a>
        </div>
    </div>
    <div class="footer">
        <p>Email ini dihasilkan otomatis oleh sistem MUSKOM. Jangan membalas email ini.</p>
    </div>
</body>
</html>`,
		},
		{
			Name:    "participant_registration_rejected",
			Channel: ChannelEmail,
			Subject: ptr("Registration Rejected - MUSKOM 2026"),
			Body: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Rejected</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .info-box { background-color: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        @media (prefers-color-scheme: dark) {
            body { color: #e2e8f0; background-color: #0f172a; }
            .content { background-color: #1e293b; border-color: #334155; }
            .info-box { background-color: #7f1d1d; border-color: #991b1b; color: #fecaca; }
            .footer { color: #94a3b8; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Pemberitahuan Pendaftaran</h2>
    </div>
    <div class="content">
        <p>Halo <strong>{{.full_name}}</strong>,</p>
        <p>Mohon maaf, pendaftaran Anda untuk acara <strong>{{.event_name}}</strong> tidak dapat kami setujui saat ini.</p>
        
        <p>Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi panitia melalui kontak yang tersedia di website resmi kami.</p>
        <p>Terima kasih atas partisipasi Anda.</p>
    </div>
    <div class="footer">
        <p>Email ini dihasilkan otomatis oleh sistem MUSKOM. Jangan membalas email ini.</p>
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
        <p>Email ini dihasilkan otomatis oleh sistem MUSKOM.</p>
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
        <p>Email ini dihasilkan otomatis oleh sistem MUSKOM.</p>
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
        <p>Email ini dihasilkan otomatis oleh sistem MUSKOM.</p>
    </div>
</body>
</html>`,
		},
		{
			Name:    "candidate_published",
			Channel: ChannelEmail,
			Subject: ptr("Kandidat Dipublikasikan - MUSKOM 2026"),
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
        <p>Email ini dihasilkan otomatis oleh sistem MUSKOM.</p>
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
        <p>Email ini dihasilkan otomatis oleh sistem MUSKOM.</p>
    </div>
</body>
</html>`,
		},
		{
			Name:    "test_email",
			Channel: ChannelEmail,
			Subject: ptr("Test Email - MUSKOM"),
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
        <p>Jika Anda menerima email ini, berarti konfigurasi SMTP sistem MUSKOM Anda telah berhasil.</p>
        <p>Waktu Pengujian: <strong>{{.timestamp}}</strong></p>
    </div>
    <div class="footer">
        <p>Email ini dihasilkan otomatis oleh sistem MUSKOM.</p>
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
        <p>Email ini dihasilkan otomatis oleh sistem MUSKOM.</p>
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

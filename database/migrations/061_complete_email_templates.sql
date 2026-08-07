-- 061_complete_email_templates.sql

-- 1. Update participant_registration_approved to include QR code
UPDATE notification_templates
SET body = '<!DOCTYPE html>
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

        <center>
            <div class="qr-container">
                <img src="{{.qr_code_url}}" alt="QR Code" width="200" height="200" />
            </div>
            <p style="margin-top: 10px; font-size: 14px;">Mohon tunjukkan QR Code ini saat check-in di lokasi acara.</p>
            <br>
            <a href="{{.participant_lookup_url}}" class="btn">Lihat Profil Peserta</a>
        </center>
    </div>
    <div class="footer">
        <p>&copy; 2026 Panitia {{.event_name}}. All rights reserved.</p>
    </div>
</body>
</html>'
WHERE name = 'participant_registration_approved' AND channel = 'EMAIL';


-- 2. Insert missing templates
INSERT INTO notification_templates (name, channel, subject, body) VALUES
('participant_registration_cancelled', 'EMAIL', 'Registration Cancelled',
'<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #475569; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        @media (prefers-color-scheme: dark) { body { color: #e2e8f0; background-color: #0f172a; } .content { background-color: #1e293b; border-color: #334155; } .footer { color: #94a3b8; } }
    </style>
</head>
<body>
    <div class="header"><h2>Pendaftaran Dibatalkan</h2></div>
    <div class="content">
        <p>Halo <strong>{{.full_name}}</strong>,</p>
        <p>Pendaftaran Anda untuk acara <strong>{{.event_name}}</strong> telah dibatalkan.</p>
        <p>Jika ini adalah kesalahan atau Anda memiliki pertanyaan, silakan hubungi tim panitia.</p>
    </div>
    <div class="footer"><p>&copy; 2026 Panitia {{.event_name}}. All rights reserved.</p></div>
</body>
</html>'),

('candidate_published', 'EMAIL', 'Candidate Profile Published',
'<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        .btn { display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin-top: 15px; }
        @media (prefers-color-scheme: dark) { body { color: #e2e8f0; background-color: #0f172a; } .content { background-color: #1e293b; border-color: #334155; } .btn { background-color: #3b82f6; } }
    </style>
</head>
<body>
    <div class="header"><h2>Profil Kandidat Dipublikasikan</h2></div>
    <div class="content">
        <p>Halo <strong>{{.full_name}}</strong>,</p>
        <p>Profil Anda sebagai kandidat untuk acara <strong>{{.event_name}}</strong> kini telah <strong>DIPUBLIKASIKAN</strong> dan dapat dilihat oleh peserta lainnya.</p>
        <center>
            <a href="{{.candidate_public_url}}" class="btn">Lihat Profil Publik Anda</a>
        </center>
    </div>
    <div class="footer"><p>&copy; 2026 Panitia {{.event_name}}. All rights reserved.</p></div>
</body>
</html>'),

('candidate_unpublished', 'EMAIL', 'Candidate Profile Unpublished',
'<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #d97706; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        @media (prefers-color-scheme: dark) { body { color: #e2e8f0; background-color: #0f172a; } .content { background-color: #1e293b; border-color: #334155; } }
    </style>
</head>
<body>
    <div class="header"><h2>Publikasi Profil Ditarik</h2></div>
    <div class="content">
        <p>Halo <strong>{{.full_name}}</strong>,</p>
        <p>Status profil Anda sebagai kandidat untuk acara <strong>{{.event_name}}</strong> saat ini telah diubah menjadi <strong>UNPUBLISHED</strong> (Tidak Dipublikasikan).</p>
        <p>Profil Anda tidak akan lagi terlihat oleh publik. Silakan hubungi panitia jika Anda membutuhkan informasi lebih lanjut.</p>
    </div>
    <div class="footer"><p>&copy; 2026 Panitia {{.event_name}}. All rights reserved.</p></div>
</body>
</html>'),

('password_reset', 'EMAIL', 'Reset Password - MUSKOM',
'<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        .btn { display: inline-block; background-color: #0f172a; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin-top: 15px; }
        @media (prefers-color-scheme: dark) { body { color: #e2e8f0; background-color: #0f172a; } .content { background-color: #1e293b; border-color: #334155; } .btn { background-color: #38bdf8; color: #0f172a; } }
    </style>
</head>
<body>
    <div class="header"><h2>Permintaan Reset Password</h2></div>
    <div class="content">
        <p>Halo <strong>{{.name}}</strong>,</p>
        <p>Kami menerima permintaan untuk mereset password akun Anda di MUSKOM.</p>
        <p>Jika Anda merasa tidak melakukan permintaan ini, Anda dapat mengabaikan email ini. Password Anda tidak akan berubah.</p>
        <center>
            <a href="{{.reset_link}}" class="btn">Reset Password</a>
        </center>
        <p style="margin-top: 20px; font-size: 12px; color: #64748b;">Link reset password ini hanya berlaku selama {{.expiry_minutes}} menit.</p>
    </div>
    <div class="footer"><p>&copy; 2026 MUSKOM. All rights reserved.</p></div>
</body>
</html>'),

('test_email', 'EMAIL', 'Test Email Delivery - MUSKOM',
'<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        @media (prefers-color-scheme: dark) { body { color: #e2e8f0; background-color: #0f172a; } .content { background-color: #1e293b; border-color: #334155; } }
    </style>
</head>
<body>
    <div class="header"><h2>Test Email Berhasil</h2></div>
    <div class="content">
        <p>Halo Administrator,</p>
        <p>Jika Anda menerima email ini, berarti <strong>konfigurasi SMTP Anda telah berfungsi dengan baik</strong>.</p>
        <p>Sistem notifikasi MUSKOM siap digunakan untuk mengirimkan email transaksional kepada para peserta dan kandidat.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">Waktu Test: {{.timestamp}}</p>
    </div>
    <div class="footer"><p>&copy; 2026 MUSKOM. All rights reserved.</p></div>
</body>
</html>');

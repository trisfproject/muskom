-- 060_create_default_email_templates.sql

-- Clear old templates if any exist to start fresh
DELETE FROM notification_templates WHERE channel = 'EMAIL';

-- 1. Participant Registration Submitted
INSERT INTO notification_templates (name, channel, subject, body) VALUES
('participant_registration_submitted', 'EMAIL', 'Registration Received - MUSKOM 2026',
'<!DOCTYPE html>
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
        <p>&copy; 2026 Panitia {{.event_name}}. All rights reserved.</p>
    </div>
</body>
</html>');

-- 2. Participant Registration Approved
INSERT INTO notification_templates (name, channel, subject, body) VALUES
('participant_registration_approved', 'EMAIL', 'Your Registration Has Been Approved',
'<!DOCTYPE html>
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
        @media (prefers-color-scheme: dark) {
            body { color: #e2e8f0; background-color: #0f172a; }
            .content { background-color: #1e293b; border-color: #334155; }
            .info-box { background-color: #0f172a; border-color: #334155; }
            .footer { color: #94a3b8; }
            .btn { background-color: #38bdf8; color: #0f172a; }
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

        <p>Anda dapat melihat kartu tanda peserta dan QR Code Anda dengan mengklik tombol di bawah ini:</p>
        <center>
            <a href="{{.participant_lookup_url}}" class="btn">Lihat Kartu Peserta & QR Code</a>
        </center>
        
        <p style="margin-top: 25px;">Mohon tunjukkan QR Code Anda kepada petugas registrasi saat tiba di lokasi acara.</p>
    </div>
    <div class="footer">
        <p>&copy; 2026 Panitia {{.event_name}}. All rights reserved.</p>
    </div>
</body>
</html>');

-- 3. Participant Registration Rejected
INSERT INTO notification_templates (name, channel, subject, body) VALUES
('participant_registration_rejected', 'EMAIL', 'Registration Status Update',
'<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Rejected</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e11d48; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .reason-box { background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 15px; margin: 20px 0; color: #9f1239; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        @media (prefers-color-scheme: dark) {
            body { color: #e2e8f0; background-color: #0f172a; }
            .content { background-color: #1e293b; border-color: #334155; }
            .reason-box { background-color: #4c0519; border-color: #e11d48; color: #fecdd3; }
            .footer { color: #94a3b8; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Status Pendaftaran</h2>
    </div>
    <div class="content">
        <p>Halo <strong>{{.full_name}}</strong>,</p>
        <p>Mohon maaf, pendaftaran Anda untuk acara <strong>{{.event_name}}</strong> belum dapat kami setujui.</p>
        
        <div class="reason-box">
            <strong>Alasan Penolakan:</strong><br>
            {{.rejection_reason}}
        </div>

        <p>Jika ada pertanyaan lebih lanjut, silakan hubungi tim sekretariat panitia.</p>
    </div>
    <div class="footer">
        <p>&copy; 2026 Panitia {{.event_name}}. All rights reserved.</p>
    </div>
</body>
</html>');

-- 4. Candidate Registration Submitted
INSERT INTO notification_templates (name, channel, subject, body) VALUES
('candidate_registration_submitted', 'EMAIL', 'Candidate Registration Received',
'<!DOCTYPE html>
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
        @media (prefers-color-scheme: dark) {
            body { color: #e2e8f0; background-color: #0f172a; }
            .content { background-color: #1e293b; border-color: #334155; }
            .footer { color: #94a3b8; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>{{.event_name}}</h2>
    </div>
    <div class="content">
        <p>Halo <strong>{{.full_name}}</strong>,</p>
        <p>Terima kasih, berkas pendaftaran kandidat Anda telah kami terima.</p>
        <p>Status aplikasi Anda saat ini sedang dalam peninjauan oleh tim panitia (Under Review).</p>
        <p>Kami akan menghubungi Anda kembali setelah proses verifikasi selesai dilakukan.</p>
        <p>Terima kasih atas partisipasi Anda.</p>
    </div>
    <div class="footer">
        <p>&copy; 2026 Panitia {{.event_name}}. All rights reserved.</p>
    </div>
</body>
</html>');

-- 5. Candidate Registration Approved
INSERT INTO notification_templates (name, channel, subject, body) VALUES
('candidate_registration_approved', 'EMAIL', 'Candidate Registration Approved',
'<!DOCTYPE html>
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
        <h2>Pendaftaran Kandidat Disetujui!</h2>
    </div>
    <div class="content">
        <p>Selamat <strong>{{.full_name}}</strong>,</p>
        <p>Profil dan pendaftaran Anda sebagai kandidat untuk acara <strong>{{.event_name}}</strong> telah diterima dan disetujui oleh panitia.</p>
        <p>Selanjutnya, profil Anda akan dipublikasikan di halaman resmi kandidat.</p>
    </div>
    <div class="footer">
        <p>&copy; 2026 Panitia {{.event_name}}. All rights reserved.</p>
    </div>
</body>
</html>');

-- 6. Candidate Registration Rejected
INSERT INTO notification_templates (name, channel, subject, body) VALUES
('candidate_registration_rejected', 'EMAIL', 'Candidate Registration Status Update',
'<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Candidate Registration Rejected</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e11d48; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .reason-box { background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 15px; margin: 20px 0; color: #9f1239; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
        @media (prefers-color-scheme: dark) {
            body { color: #e2e8f0; background-color: #0f172a; }
            .content { background-color: #1e293b; border-color: #334155; }
            .reason-box { background-color: #4c0519; border-color: #e11d48; color: #fecdd3; }
            .footer { color: #94a3b8; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Status Pendaftaran Kandidat</h2>
    </div>
    <div class="content">
        <p>Halo <strong>{{.full_name}}</strong>,</p>
        <p>Mohon maaf, aplikasi Anda sebagai kandidat untuk acara <strong>{{.event_name}}</strong> belum dapat disetujui.</p>
        
        <div class="reason-box">
            <strong>Alasan Penolakan:</strong><br>
            {{.rejection_reason}}
        </div>

        <p>Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi tim sekretariat panitia.</p>
    </div>
    <div class="footer">
        <p>&copy; 2026 Panitia {{.event_name}}. All rights reserved.</p>
    </div>
</body>
</html>');

-- Update participant_registration_approved template to final approved template without QR Code

UPDATE notification_templates
SET subject = 'Pendaftaran Peserta Disetujui — {{.website_title}}',
    body = '<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pendaftaran Peserta Disetujui</title>
    <style>
        body { font-family: ''Inter'', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 20px; }
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
        .btn { display: inline-block; padding: 12px 24px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; }
        .cta-container { text-align: center; margin-top: 32px; }
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
                <p>Kami dengan senang hati menyambut kehadiran Anda dalam kegiatan <strong>{{.event_name}}</strong>.</p>
            </div>
            
            <div class="info-card">
                <div class="info-section">
                    <p class="info-title">INFORMASI ACARA</p>
                    <p class="info-value" style="font-size: 14px; margin-top: 4px;">Tanggal:<br/>{{.event_date}}</p>
                    <p class="info-value" style="font-size: 14px; margin-top: 4px;">Waktu:<br/>{{.event_time}}</p>
                    <p class="info-value" style="font-size: 14px; margin-top: 4px;">Lokasi:<br/>{{.event_location}}</p>
                </div>
            </div>

            <div class="text" style="margin-top: 24px;">
                <p>Mohon hadir sesuai waktu yang telah ditentukan untuk proses registrasi dan persiapan sebelum acara dimulai.</p>
                <p>Kami tunggu kehadiran Anda dan sampai jumpa di lokasi acara.</p>
                <p>Untuk melihat atau mengunduh Kartu Peserta Anda, silakan klik tombol berikut:</p>
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
</html>'
WHERE name = 'participant_registration_approved' AND channel = 'EMAIL';

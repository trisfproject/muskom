UPDATE notification_templates
SET body = REPLACE(body, '<strong>⏰ Waktu:</strong> 09.00 WIB – Selesai', '<strong>⏰ Waktu:</strong> 08.00 WIB – Selesai')
WHERE name = 'event_musyawarah_reminder';

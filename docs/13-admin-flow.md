# Admin Flow (Alur Admin)

Dokumen ini mendeskripsikan langkah-langkah kerja yang dilalui oleh Panitia dan Manajemen dalam mempersiapkan dan menjalankan musyawarah menggunakan platform MUSKOM.

## 1. Alur Persiapan Acara (Pre-Event)

1. **Pembuatan Acara**: Admin masuk ke menu `Manajemen Acara`, klik `Buat Acara Baru`. Mengisi Nama Musyawarah, Tanggal Pelaksanaan, dan Target Kuorum (contoh: 50% + 1).
2. **Impor Peserta**: Masuk ke menu `Manajemen Pengguna`, Admin mengunggah *file* `.csv` atau `.xlsx` yang berisi daftar peserta lengkap dengan kolom `Nama`, `Delegasi`, `Email`, dan status hak suara.
3. **Distribusi Undangan**: Sistem mengeksekusi *background job* untuk memicu pengiriman email secara massal ke peserta yang terdaftar, berisi Tautan Login, Username, dan Password *Auto-generated*.
4. **Unggah Materi Dasar**: Masuk ke `Manajemen Dokumen` untuk mendistribusikan tata tertib awal, jadwal acara, dan *draft* resolusi.

## 2. Alur Pengelolaan Kehadiran dan Kuorum (Hari-H)

1. **Akses Scanner**: Tim Registrasi (Panitia *Front-Desk*) menggunakan gawai/laptop masuk ke menu `Presensi & Kuorum` -> `Mulai Scanner`.
2. **Verifikasi Peserta**: Memindai *QR Code* atau mencari nama peserta secara manual.
3. **Pantau Live Kuorum**: Pimpinan Sidang membuka dasbor `Kuorum`. Layar ini idealnya diproyeksikan (via proyektor). Grafis akan naik secara *real-time* (menggunakan *WebSocket*) setiap kali ada peserta yang berhasil di-*scan*.
4. **Pengesahan Sidang**: Setelah bar kuorum melewati ambang batas 50% + 1 (indikator berubah dari merah menjadi hijau), Pimpinan Sidang mengetuk palu dan sidang dinyatakan sah dibuka.

## 3. Alur Rekapitulasi (Post-Event)

1. **Unggah Surat Keputusan**: Notulis (Bagian dari Admin) masuk ke menu `Dokumen`, mengunggah berkas SK / Hasil Ketetapan Musyawarah. 
2. **Kirim Notifikasi**: Admin menekan fitur `Broadcast` untuk memberitahukan kepada seluruh peserta bahwa Ketetapan sudah bisa diunduh.
3. **Generate Laporan Akhir**: Admin masuk ke `Pengaturan/Laporan` untuk mengunduh Log Sistem lengkap (*Audit Trail*) sebagai laporan pertanggungjawaban keorganisasian, mencakup data presensi lengkap, waktu kehadiran, dan rekap hasil voting (tanpa mencantumkan siapa memilih apa).

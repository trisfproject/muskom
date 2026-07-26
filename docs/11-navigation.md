# Struktur Navigasi (Navigation)

Dokumen ini menjelaskan hierarki navigasi untuk kedua antarmuka pengguna dalam sistem MUSKOM: **Aplikasi Web (Peserta)** dan **Aplikasi Admin (Panitia/Manajemen)**.

## 1. Navigasi Aplikasi Web (Peserta)

Navigasi untuk peserta dirancang dengan pendekatan *Mobile-First*, menggunakan *Bottom Navigation Bar* di perangkat seluler dan *Sidebar/Top Navigation* di desktop.

- **[Beranda]** `/`
  - Ringkasan acara yang sedang berlangsung.
  - Status kehadiran (QR Code pengguna).
  - *Widget* notifikasi (Sidang akan dimulai, dll).

- **[Agenda]** `/agenda`
  - Daftar sesi pleno/sidang.
  - Detail waktu, lokasi, dan pembicara.

- **[Voting]** `/voting`
  - Daftar sesi pemilihan (aktif, tertunda, atau selesai).
  - Akses ke ruang pemilihan (*Voting Room*).

- **[Dokumen]** `/dokumen`
  - Perpustakaan materi musyawarah (AD/ART, LPJ, Draft Resolusi).
  - Fitur pencarian dan filter kategori dokumen.

- **[Profil]** `/profil`
  - Data diri dan delegasi (Utusan Cabang/Daerah).
  - Pengaturan keamanan (Ubah Kata Sandi).
  - Tombol Keluar (*Logout*).

## 2. Navigasi Aplikasi Admin

Navigasi Admin menggunakan *Collapsible Sidebar* di sisi kiri layar untuk navigasi yang terstruktur.

- **[Dashboard]** `/admin`
  - Metrik utama: Total Peserta, Kuorum Live, Sesi Berjalan.

- **[Manajemen Acara]** `/admin/events`
  - Daftar Acara (Musyawarah).
  - Pengaturan Detail Acara (Jadwal, Lokasi, Syarat Kuorum).
  - Manajemen Agenda/Sesi.

- **[Manajemen Pengguna]** `/admin/users`
  - **Peserta**: Daftar delegasi, verifikasi hak suara, cetak ID Card/QR.
  - **Panitia/Admin**: Penetapan peran sistem (RBAC).

- **[Presensi & Kuorum]** `/admin/attendance`
  - Scanner QR Code terintegrasi (berbasis web kamera).
  - Log kehadiran dan perhitungan Kuorum otomatis.

- **[E-Voting]** `/admin/voting`
  - Pembuatan sesi voting & penambahan kandidat/opsi.
  - Panel kontrol (Buka/Tutup Sesi).
  - Laporan dan Hasil Suara.

- **[Dokumen]** `/admin/documents`
  - Unggah dan distribusikan materi.
  - Pengaturan hak akses unduh dokumen.

- **[Pengaturan]** `/admin/settings`
  - Konfigurasi sistem (Nama Organisasi, Logo).
  - Pengaturan integrasi (SMTP Email, Notifikasi WhatsApp).

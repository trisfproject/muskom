# User Flow (Alur Pengguna)

Dokumen ini mendeskripsikan langkah-langkah spesifik yang dilalui oleh pengguna akhir (Peserta / Utusan / Delegasi) di dalam platform MUSKOM.

## 1. Alur Autentikasi dan Pendaftaran (Onboarding)

Kondisi awal: Peserta telah didaftarkan oleh panitia (via sinkronisasi data/CSV) dan menerima kredensial masuk di email/WhatsApp.

1. **Akses Portal**: Peserta membuka tautan aplikasi web MUSKOM.
2. **Login**: Memasukkan *Email* / *ID Registrasi* dan *Kata Sandi*.
3. **Persetujuan Tata Tertib**: (Hanya untuk login pertama kali) Sistem menampilkan Tata Tertib Musyawarah. Peserta harus mencentang kotak "Saya Setuju".
4. **Beranda Utama**: Sistem menampilkan kartu identitas digital (QR Code) peserta dan status bahwa mereka belum *Check-In* di lokasi.

## 2. Alur Kehadiran di Lokasi (Check-In)

1. **Hadir di Meja Registrasi**: Peserta tiba di ruang musyawarah dan membuka Beranda aplikasi.
2. **Scan**: Peserta menunjukkan QR Code di layar gawainya kepada Panitia.
3. **Validasi**: Panitia memindai QR Code. Sistem memvalidasi dan mencatat *timestamp* kehadiran.
4. **Pembaruan Status**: Layar gawai peserta secara *real-time* berubah dari "Menunggu Registrasi" menjadi "Hadir / Teregistrasi" dan mengaktifkan akses masuk ke fitur persidangan (Voting).

## 3. Alur Akses Materi dan Dokumen

1. **Buka Menu Dokumen**: Peserta menavigasi ke menu `Dokumen`.
2. **Eksplorasi**: Peserta melihat daftar materi yang dikategorikan (contoh: "Laporan Pertanggungjawaban", "Draft Revisi AD/ART").
3. **Membaca (Preview)**: Peserta mengklik dokumen PDF. Sistem merender dokumen langsung di dalam aplikasi web tanpa harus berpindah aplikasi.
4. **Unduh (Opsional)**: Tersedia tombol untuk mengunduh dokumen ke perangkat lokal (jika diizinkan panitia).

## 4. Alur Interupsi / Pengajuan Pertanyaan (Opsional/Ekstensi)

Jika panitia mengaktifkan fitur *Q&A* (Interupsi Digital):
1. **Pilih Sesi Agenda**: Peserta membuka menu Agenda dan memilih sidang yang sedang berjalan.
2. **Kirim Tanggapan**: Peserta menekan tombol "Ajukan Pendapat", lalu mengetikkan poin interupsi.
3. **Antrean Pimpinan Sidang**: Pesan tersebut terkirim ke *Dashboard Pimpinan Sidang* untuk diizinkan berbicara menggunakan mikrofon.

# Product Requirements Document (PRD)

## 1. Pendahuluan
Dokumen ini merinci kebutuhan produk MUSKOM (Musyawarah KOMITKABE Management System), fitur-fitur yang dikembangkan, serta kebutuhan fungsional dan non-fungsional.

## 2. Modules

Sistem dibagi menjadi beberapa modul utama:

### 2.1 Modul Autentikasi & Otorisasi
- **Fitur**: Login, Logout, Reset Password, Manajemen Profil.
- **Deskripsi**: Keamanan sistem berbasis JWT dengan pembatasan hak akses sesuai peran (Admin, Ketua, Peserta).

### 2.2 Modul Manajemen Acara (Musyawarah)
- **Fitur**: CRUD Acara, Penjadwalan Sidang, Broadcast Undangan.
- **Deskripsi**: Admin dapat membuat acara musyawarah, membaginya menjadi beberapa sidang/pleno.

### 2.3 Modul Presensi & Kuorum
- **Fitur**: Check-in peserta, Live Kuorum Meter.
- **Deskripsi**: Sistem mendata peserta yang hadir (verifikasi identitas) dan menghitung apakah sidang sudah memenuhi syarat kuorum (misal 50% + 1).

### 2.4 Modul E-Voting
- **Fitur**: Setup Pemilihan, Pemungutan Suara, Real-time Chart.
- **Deskripsi**: Fitur paling kritikal. Hanya peserta berstatus "Hadir" dan memiliki hak suara yang bisa memilih. Hasil dihitung secara live namun bisa dirahasiakan hingga voting ditutup.

### 2.5 Modul Manajemen Dokumen
- **Fitur**: Materi Sidang, Draft Resolusi, Notulensi, SK (Surat Keputusan).
- **Deskripsi**: Penyimpanan terpusat untuk berkas-berkas terkait musyawarah.

## 3. Business Requirements (Kebutuhan Bisnis)

- Sistem harus mengakomodasi aturan dasar KOMITKABE (AD/ART) terkait kuorum musyawarah.
- Hasil voting tidak boleh dapat dimanipulasi oleh siapapun, termasuk Database Administrator (diperlukan audit trail/hashing pada tabel vote).
- Antarmuka harus mendukung perangkat mobile (responsif) mengingat peserta sering menggunakan smartphone saat musyawarah.

## 4. Non-Functional Requirements (NFR)

- **Performance**: Sistem harus mampu menangani 1000+ peserta yang melakukan voting secara bersamaan dalam waktu 5 detik (High Concurrency).
- **Security**: 
  - Data sensitif dienkripsi (TLS untuk in-transit, bcrypt untuk password).
  - Rate limiting untuk mencegah Brute Force dan DDoS.
- **Availability**: Uptime sistem 99.9% selama hari-H musyawarah.
- **Usability**: UI/UX yang intuitif sehingga peserta dari berbagai usia dapat menggunakannya tanpa pelatihan khusus.

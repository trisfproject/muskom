# Dokumentasi Basis Data MUSKOM

Repositori ini memuat seluruh panduan, spesifikasi, dan alur kerja pengelolaan basis data untuk proyek **MUSKOM** (Musyawarah KOMITKABE Management System). Basis data ini dirancang dengan prinsip skalabilitas, keamanan tinggi, dan ketahanan data tingkat produksi (*production-grade*).

## Struktur Basis Data

Basis data MUSKOM menggunakan arsitektur relasional (*Relational Database*) yang dioptimalkan untuk memproses pendaftaran, absensi, serta pemungutan suara secara transaksional dengan integritas data yang terjamin. Seluruh *state* aplikasi direkam dalam struktur tabel yang dinormalisasi.

## Struktur Folder

```text
database/
├── migrations/       # File SQL untuk skema naik (up) dan turun (down)
├── seed/             # File SQL atau skrip untuk mengisi data awal (dummy/master)
└── schema/           # Struktur atau dump dari schema basis data
```

## Alur Kerja Migrasi (*Migration Workflow*)

1. **Pembuatan File Migrasi:** File migrasi harus selalu berpasangan: `<timestamp>_<name>.up.sql` dan `<timestamp>_<name>.down.sql`.
2. **Pengujian Lokal:** Sebelum digabung ke *branch* utama, migrasi harus diuji coba pada basis data lokal.
3. **Penerapan Terstruktur:** Skrip migrasi (`up.sql`) digunakan untuk memperbarui skema, sementara (`down.sql`) dibuat sebagai *safeguard* untuk proses pembatalan perubahan jika terjadi kesalahan kritis.
4. **CI/CD Integration:** Migrasi akan dijalankan secara otomatis dalam *pipeline deployment*. Dilarang keras memodifikasi file migrasi yang telah dieksekusi di *production*. Jika ada perubahan, buat file migrasi baru.

## Alur Kerja *Seed* (*Seed Workflow*)

1. **Master Data:** Script *seed* harus berisi data esensial yang diperlukan aplikasi agar bisa berjalan (misalnya tabel `roles`, `app_settings` default).
2. **Data Dummy / Testing:** Pisahkan skrip *seed* untuk keperluan *testing* dan *development* dari skrip data *production*.
3. **Idempotency:** Skrip *seed* harus bersifat *idempotent* (aman dijalankan berkali-kali). Gunakan klausa `INSERT ... ON CONFLICT DO NOTHING` atau eksekusi *upsert*.

## Kebijakan *Rollback* (*Rollback Policy*)

- *Rollback* (menjalankan `down.sql`) **hanya** dilakukan di *development* atau jika terjadi keadaan darurat kritis yang terdeteksi segera setelah *deployment* di *production*.
- Sangat dihindari untuk melakukan *rollback* yang mengakibatkan kehilangan data (misalnya melakukan `DROP TABLE` yang berisi transaksi pengguna).
- Sebagai alternatif, utamakan metode **Roll-forward**: buat file migrasi baru yang membalikkan efek migrasi sebelumnya atau memperbaiki skema tanpa merusak data yang telah terbentuk.

## Konvensi Penamaan (*Naming Conventions*)

Agar seragam dan mudah dikelola, perhatikan standar penamaan berikut:
- **Tabel & Kolom:** `snake_case`, menggunakan huruf kecil. (contoh: `event_phases`, `created_at`).
- **Nama Tabel:** Bentuk jamak (*plural*). (contoh: `users`, `events`).
- **Primary Key:** Harus dinamai `id`.
- **Foreign Key:** `<nama_tabel_singular>_id`. (contoh: `user_id`, `event_id`).
- **Index:** `idx_<tabel>_<kolom>`.
- **Foreign Key Constraint:** `fk_<tabel_asal>_<tabel_tujuan>`.
- **Unique Constraint:** `uq_<tabel>_<kolom>`.

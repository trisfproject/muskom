# Database Engineering Standard

Standar ini mengatur praktik terbaik dalam merancang dan mengelola basis data PostgreSQL untuk MUSKOM.

## 1. Desain Skema
- **Tipe Data Kunci**: Wajib menggunakan `UUID` v4 (`gen_random_uuid()`) untuk semua *Primary Key*.
- **Tipe Waktu**: Selalu gunakan `TIMESTAMPTZ` untuk melacak zona waktu secara absolut. Semua tabel minimal memiliki `created_at` dan `updated_at`.
- **Soft Delete**: Hanya digunakan pada entitas yang memiliki relasi luas dan berisiko jika dihapus permanen (misal: `users`, `events`). Gunakan kolom `deleted_at`.

## 2. Relasi & Konstrain
- **Foreign Key**: Selalu definisikan *Foreign Key* (FK) secara eksplisit.
- **Indeks**: PostgreSQL tidak secara otomatis membuat indeks untuk FK. **Wajib** membuat indeks manual untuk setiap FK guna mempercepat operasi `JOIN`.
- **Integritas Referensial**: Gunakan `ON DELETE RESTRICT` sebagai standar operasi (default). Hindari `ON DELETE CASCADE` kecuali untuk data yang sepenuhnya bergantung pada entitas induk (contoh: *settings*, *documents*).
- **Validasi Bisnis**: Gunakan `CHECK` dan `UNIQUE` pada tingkat *database* untuk menjamin konsistensi data sebelum masuk ke aplikasi.

## 3. Manajemen Migrasi
- Jangan pernah memodifikasi berkas migrasi yang sudah berjalan di *Production*. Gunakan metode *Roll-Forward* (tambah file migrasi baru) untuk memperbaiki kesalahan.
- Semua migrasi baru harus bersifat *idempotent* (gunakan `IF NOT EXISTS`).

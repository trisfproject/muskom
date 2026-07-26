# Spesifikasi Basis Data MUSKOM

Dokumen ini mendefinisikan spesifikasi teknis dan kebijakan pengelolaan standar basis data untuk sistem MUSKOM agar memenuhi standar produksi (*production-grade*).

## Teknologi Utama
- **Engine Basis Data:** PostgreSQL 17
- **Tipe UUID:** Menggunakan ekstensi `pgcrypto` untuk menghasilkan UUID versi 4 (fungsi `gen_random_uuid()`).
- **Tipe Waktu (Timestamp):** Semua kolom waktu **wajib** menggunakan tipe `TIMESTAMPTZ` (Timestamp with Time Zone) untuk menghindari inkonsistensi zona waktu aplikasi.

## Konvensi Penamaan (*Naming Conventions*)
- Format tabel dan kolom wajib menggunakan `snake_case`.
- Nama tabel harus menggunakan format jamak (*plural*), contoh: `users`, `events`.
- Nama tabel asosiasi (tabel *junction*) digabung dengan garis bawah berdasarkan entitas, contoh: `user_roles`.

## Strategi Primary Key
- Seluruh tabel utama wajib memiliki Primary Key (PK).
- Kolom PK bernama `id` dengan tipe data `UUID`.
- Nilai di-generate otomatis oleh database menggunakan `DEFAULT gen_random_uuid()`.

## Strategi Foreign Key
- Format penamaan kolom: `<nama_entitas_singular>_id` bertipe `UUID`.
- Setiap Foreign Key (FK) wajib merujuk secara eksplisit ke tabel tujuannya.
- Penerapan efek penghapusan (ON DELETE):
  - Gunakan `ON DELETE RESTRICT` untuk entitas bisnis utama (menghindari ketidaksengajaan menghapus data penting).
  - Gunakan `ON DELETE CASCADE` hanya untuk tabel dependensi langsung (contoh: `event_settings` ketika `events` dihapus).

## Strategi Indeks (*Index Strategy*)
- Otomatis oleh PostgreSQL: Primary Key dan parameter yang memiliki konstrain `UNIQUE`.
- Foreign Key: Wajib dibuatkan *B-Tree index* secara manual, karena PostgreSQL tidak meng-index FK secara otomatis.
- Pencarian dan Filter: Buat indeks pada kolom yang paling sering digunakan dalam klausa `WHERE` atau pengurutan `ORDER BY` (seperti `status`, `created_at`, atau `email`).

## Kebijakan Soft Delete
- Secara *default*, dilarang melakukan `DELETE` permanen pada data utama transaksi atau log.
- Gunakan kolom `deleted_at TIMESTAMPTZ NULL` untuk menerapkan *soft delete*.
- Jika nilai `deleted_at` adalah `NULL`, data dianggap aktif. Kolom ini harus digunakan pada proses filter API.

## Kebijakan Migrasi (*Migration Policy*)
- File migrasi dikelola menggunakan *tools* berbasis CLI.
- Nomor file migrasi diprefiks dengan rentang waktu *timestamp* (misal: `20260726120000_create_users_table.up.sql`).
- Tidak ada modifikasi atau manipulasi file `.sql` migrasi jika sudah diterapkan ke ranah *production*. Jika ada perbaikan, wajib menambahkan file migrasi baru (Roll-Forward).

## Kebijakan Seed (*Seed Policy*)
- Harus dirancang sedemikian rupa agar bersifat idempotent (penggunaan `INSERT INTO ... ON CONFLICT ... DO NOTHING`).
- Skrip *seed* untuk data *master* diletakkan terpisah dari *seed* data palsu (*dummy*) untuk pengujian.

## Kebijakan Transaksi (*Transaction Policy*)
- Semua operasi DML (*Data Manipulation Language*) yang mengubah lebih dari satu entitas atau tabel dalam satu fungsi/logika aplikasi harus berada dalam blok `BEGIN ... COMMIT` (Transaksi).
- Level isolasi *Read Committed* digunakan sebagai standar. Untuk pemungutan suara (Voting), level isolasi ditingkatkan menjadi *Serializable* atau dilengkapi manajemen *Locking* (`FOR UPDATE`) jika diperlukan untuk menghindari *Race Condition*.

## Kebijakan Audit (*Audit Policy*)
- Terdapat tabel sentral `audit_logs` untuk merekam mutasi data krusial di sistem.
- Sistem harus mencatat pengguna yang melakukan perubahan (aktor), jenis aksi (`CREATE`, `UPDATE`, `DELETE`), entitas target, dan perubahan nilai (perbedaan antara `old_data` dan `new_data` berformat JSONB).
- `created_at` atau pencatatan waktu harus selalu mengikuti sinkronisasi *clock* ke server *database*.

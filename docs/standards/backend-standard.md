# Backend Engineering Standard

Standar ini menjadi acuan pengembangan layanan *backend* MUSKOM berbasis Go 1.25 dan Fiber v3.

## 1. Arsitektur Proyek
- Gunakan arsitektur berlapis (Clean Architecture): **Controller/Handler** ➔ **Service (Business Logic)** ➔ **Repository (Data Access)**.
- Hindari penulisan logika bisnis di dalam Handler atau Repository.

## 2. Akses Data
- Gunakan **sqlx** untuk pemetaan struktur data secara langsung (struct scanning).
- Selalu gunakan *Parameterized Queries* (seperti `$1, $2` atau `Named Queries`) untuk mencegah celah *SQL Injection*.
- Tutup (*defer close*) koneksi dan baris hasil *query* (rows) sesegera mungkin.

## 3. Logging & Debugging
- Gunakan **Zap Logger** untuk pencatatan *log* terstruktur berformat JSON.
- Pastikan tingkat *log* sesuai: `Info` untuk alur sukses yang krusial, `Warn` untuk kegagalan yang dapat diabaikan, dan `Error` untuk kesalahan sistem.
- Hindari mengekspos data sensitif pengguna (kata sandi, token) di dalam *log*.

## 4. Error Handling
- Jangan menggunakan `panic` kecuali sistem benar-benar tidak bisa dilanjutkan (saat inisialisasi aplikasi).
- Tangkap error (error wrapping) dengan konteks tambahan menggunakan `fmt.Errorf("context: %w", err)`.
- Kembalikan pesan yang aman bagi pengguna di tingkat *Controller*, dan log *error* asli di server.

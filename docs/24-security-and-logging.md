# Security, Authentication, & Logging

Panduan strategis bagi *backend engineer* untuk menjaga sistem MUSKOM tetap aman, terlacak, dan berkinerja stabil di bawah beban (*load*).

## 1. Authentication Flow (Alur Autentikasi)

Sistem akan berjalan secara *Stateless* menggunakan **JWT (JSON Web Token)**.

- **Login**: Klien mengirim kredensial (peserta/admin). 
- **Generasi Token**: Jika cocok, *backend* menghasilkan dua token:
  1. `Access Token` (JWT): Berumur pendek (contoh: 15 - 60 menit). Menyimpan klaim `user_id` dan `role`. Digunakan untuk Otorisasi setiap permintaan API.
  2. `Refresh Token` (Opaque Token/String panjang): Berumur panjang (contoh: 7 hari). Disimpan di **Redis** dengan *TTL*.
- **Otorisasi API**: Fiber *Middleware* (JWT) akan mencegat setiap *request*, memvalidasi *signature* token, dan menyuntikkan data *Role* ke konteks (*fiber.Ctx*).
- **Revocation**: Jika admin ingin mengeluarkan pengguna (Force Logout), Admin akan menghapus `Refresh Token` dari Redis, sehingga pengguna tidak dapat memperbarui JWT-nya.

## 2. Logging Standard

Lupakan standard `log.Print`. *Backend* akan secara ketat menggunakan **Zap Logger** (`go.uber.org/zap`).

- **Format**: JSON Terstruktur (*Structured Logging*).
- **Injeksi Log**:
  - Semua layanan harus menerima injeksi *pointer logger*.
  - *Request Logger Middleware* akan men-generate *Request ID* dan menambahkannya pada `fiber.Ctx`.
  - Log produksi harus memuat setidaknya: `timestamp`, `level`, `caller`, `request_id`, `message`.
- **Tingkat Keparahan (Log Level)**:
  - `DEBUG`: Informasi detail eksekusi algoritma (Hanya aktif di Dev).
  - `INFO`: Jejak jalannya fungsi normal (Server start, transaksi sukses).
  - `WARN`: Hal yang tidak terduga namun sistem masih hidup (contoh: API pihak ketiga melambat).
  - `ERROR`: Permintaan gagal di ranah *server* (Query gagal, *Panic recovered*).
  - `FATAL`: Kesalahan saat inisialisasi yang membunuh aplikasi (Port gagal diikat, koneksi DB mati di awal).

## 3. Audit Log Strategy (Pencatatan Audit)

Musyawarah memiliki risiko politis yang tinggi. Aplikasi wajib merekam jejak operasi sensitif (Bukan sekadar log *console*, namun tersimpan utuh di DB).

- **Tabel `audit_logs`**: Menyimpan kejadian operasional kritis.
- **Kondisi Trigger (Yang Wajib Masuk Audit Log)**:
  - Perubahan data kandidat / Sesi E-Voting (Oleh Admin).
  - Perubahan / Pemberian / Pencabutan hak suara peserta (Oleh Admin).
  - Peserta masuk / Checkout presensi.
  - Percobaan otentikasi palsu beruntun (Deteksi Brute Force).
- **Komponen Log Audit**:
  - `actor_id`: Siapa yang melakukan.
  - `action`: Format baku (contoh: `USER_UPDATE_ROLE`, `VOTING_SESSION_START`).
  - `resource`: Data apa yang terdampak (contoh: *ID Sesi Voting*).
  - `ip_address` & `user_agent`: Lacak asal jaringan pengguna.
- **Asinkronitas**: Penulisan Audit Log ke Postgres/Kafka TIDAK BOLEH memblokir respons HTTP. Implementasikan Goroutine atau kirimkan via Redis *Queue* agar *response time* tetap rendah.

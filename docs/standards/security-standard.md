# Security Engineering Standard

Standar keamanan data untuk melindungi sistem dari celah dan ancaman siber.

## 1. Autentikasi & Otorisasi
- Autentikasi difasilitasi dengan **JSON Web Tokens (JWT)**.
- JWT tidak boleh berisi data rahasia seperti *password* atau data pribadi detail (PII), cukup ID unik pengguna dan kode peran (Role).
- Kedaluwarsa token (*Expiration*) diatur dengan durasi singkat.

## 2. Manajemen Kredensial
- Penyimpanan *password* dalam *database* wajib di-*hash* menggunakan algoritma satu arah dengan *salt* dinamis (seperti **Bcrypt** atau **Argon2**).
- Variabel lingkungan (Enviroment Variables) tidak boleh dicantumkan ke dalam riwayat Git (`.env` wajib berada di `.gitignore`).

## 3. Pengamanan Jaringan
- Terapkan kebijakan CORS (Cross-Origin Resource Sharing) secara ketat, hanya izinkan domain asal aplikasi *frontend* yang telah disetujui.
- Lindungi *endpoint* publik dari serangan penyangkalan layanan (DDoS) dan *brute force* menggunakan *Rate Limiting* (contoh: maksimal 10 permintaan per detik untuk titik henti akses masuk/login).

## 4. Validasi Data (Sanitization)
- Asumsikan semua data kiriman (*payload*) dari klien (frontend) berbahaya (*Zero Trust*).
- Validasi semua JSON *body*, *query params*, dan parameter rute (*path parameters*) pada tingkat *Controller* atau penengah (*Middleware*) sebelum diproses oleh logika bisnis.

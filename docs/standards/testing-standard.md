# Testing Engineering Standard

Standar jaminan kualitas perangkat lunak MUSKOM guna memastikan stabilitas aplikasi sebelum rilis.

## 1. Pengujian Unit (Unit Testing)
- Setiap fungsi yang memuat logika bisnis (Service/Usecase) wajib memiliki spesifikasi *unit test*.
- Jangan uji detail implementasi yang melibatkan koneksi basis data atau layanan eksternal pada level ini. Gunakan *Mocking* atau *Stubs* untuk memisahkan kebergantungan.

## 2. Pengujian Integrasi (Integration Testing)
- Digunakan untuk memeriksa apakah antarmuka repositori mampu berinteraksi dengan basis data PostgreSQL tanpa masalah.
- Siapkan koneksi basis data terisolasi (test container atau *in-memory* DB sementara) sebelum pengujian integrasi berjalan, untuk menjamin keamanan data *development/production*.

## 3. Kriteria Cakupan (Code Coverage)
- Modul krusial (contoh: Pemrosesan Suara/Voting, Kalkulasi Akses Autentikasi) wajib mencapai minimum 80% cakupan kode (*Code Coverage*).
- Kode yang tidak relevan dengan logika bisnis murni seperti definisi *struct* atau *interface* dapat dikecualikan dari penilaian cakupan ini.

## 4. Otomatisasi (CI/CD)
- Proses *testing* dieksekusi secara wajib pada saat *Continuous Integration (CI)* berjalan (*Pull Request* baru).
- *Build pipeline* akan gagal secara otomatis jika mendeteksi ada kegagalan *test* (*failed suites*), mencegah penyebaran *bug* ke sistem utama.

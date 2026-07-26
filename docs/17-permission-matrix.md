# Permission Matrix (RBAC)

Platform MUSKOM dirancang menggunakan sistem kendali akses berbasis peran (*Role-Based Access Control* / RBAC). Pengguna tidak dapat mengakses fungsionalitas di luar batasan peran mereka demi alasan keamanan.

## Deskripsi Peran (Roles)
1. **SUPER_ADMIN**: Tim IT. Memiliki hak penuh ke semua *resource* dan konfigurasi global.
2. **PANITIA**: Admin musyawarah. Bertugas mengelola *event*, peserta, dan dokumen.
3. **PIMPINAN_SIDANG**: Mengendalikan jalannya persidangan dan melihat *live dashboard* hasil/kuorum.
4. **PESERTA_PENUH**: Peserta yang memiliki hak bicara dan hak suara.
5. **PESERTA_PENINJAU**: Peserta yang hanya dapat melihat (tanpa hak suara).

## Matriks Akses

| Modul & Tindakan | Super Admin | Panitia | Pimpinan Sidang | Peserta Penuh | Peserta Peninjau |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Manajemen Acara** |
| - Buat / Edit / Hapus Acara | ✔ | ✔ | ✖ | ✖ | ✖ |
| - Ubah Syarat Kuorum | ✔ | ✔ | ✖ | ✖ | ✖ |
| **Manajemen Pengguna** |
| - Tambah/Ubah Data Peserta | ✔ | ✔ | ✖ | ✖ | ✖ |
| - Cabut/Beri Hak Suara | ✔ | ✔ | ✖ | ✖ | ✖ |
| - Atur Admin Lain | ✔ | ✖ | ✖ | ✖ | ✖ |
| **Presensi & Kehadiran** |
| - Pindai QR / Check-In | ✔ | ✔ | ✖ | ✖ | ✖ |
| - Lihat Dasbor Kuorum Live | ✔ | ✔ | ✔ | ✖ | ✖ |
| - Generate Tiket Presensi | ✖ | ✖ | ✖ | ✔ | ✔ |
| **E-Voting** |
| - Buat Kandidat / Opsi | ✔ | ✔ | ✖ | ✖ | ✖ |
| - Buka / Tutup Sesi Voting | ✔ | ✔ | ✖ | ✖ | ✖ |
| - Lihat Hasil Live (Realtime) | ✔ | ✔ | ✔ | ✖ | ✖ |
| - Berikan Suara (Vote) | ✖ | ✖ | ✖ | ✔* | ✖ |
| - Lihat Hasil Pasca-Selesai | ✔ | ✔ | ✔ | ✔ | ✔ |
| **Manajemen Dokumen** |
| - Unggah Materi/SK | ✔ | ✔ | ✖ | ✖ | ✖ |
| - Unduh / Lihat Materi | ✔ | ✔ | ✔ | ✔ | ✔ |

*\* = Dengan syarat telah melakukan Check-In (Hadir) terlebih dahulu.*

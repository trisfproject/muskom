# User Flow & Business Flow

Alur bisnis utama dalam MUSKOM.

## 1. Alur Persiapan Musyawarah (Oleh Panitia)
1. Panitia **Login** ke Dashboard.
2. Masuk ke menu **Manajemen Acara** -> **Buat Acara Baru**.
3. Mengisi detail acara (Nama, Tanggal, Lokasi, Syarat Kuorum).
4. Panitia mengunggah **Materi Sidang** ke modul Dokumen.
5. Panitia men-generate **Data Peserta** dan mengirimkan kredensial/undangan (Email/WhatsApp).

## 2. Alur Pelaksanaan & Presensi (Hari H)
1. Peserta datang ke lokasi (atau masuk ke portal untuk online).
2. Peserta menunjukkan QR Code dari undangan.
3. Panitia melakukan **Scan QR** -> Status peserta berubah menjadi "Hadir".
4. Sistem otomatis mengkalkulasi **Live Kuorum**.
5. Pimpinan Sidang melihat layar: "Kuorum Tercapai (75%)" -> Sidang dibuka.

## 3. Alur E-Voting (Kritikal)
1. Pimpinan Sidang memerintahkan voting dimulai.
2. Panitia membuka **Sesi Voting** di sistem.
3. Peserta yang berstatus "Hadir" mendapat notifikasi/tampilan aktif di layar HP mereka.
4. Peserta memilih kandidat / opsi (Setuju/Tidak Setuju).
5. Peserta menekan **Submit** (memerlukan konfirmasi PIN / konfirmasi layar).
6. Data dienkripsi dan masuk ke database (Tabel Vote).
7. Waktu habis -> Panitia **Menutup Sesi Voting**.
8. Layar Pimpinan Sidang menampilkan **Live Result Chart** (Pie/Bar Chart).
9. Keputusan disahkan.

## 4. Alur Penutupan (Notulensi)
1. Notulis mengunggah **Hasil Keputusan / SK** format PDF.
2. Peserta dapat melihat dan mengunduh berkas tersebut di menu **Dokumen Saya**.

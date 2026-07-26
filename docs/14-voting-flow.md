# Voting Flow (Alur Pemilihan)

Sistem E-Voting adalah modul paling kritis di MUSKOM. Integritas data, ketersediaan, dan pengalaman pengguna merupakan fokus utama.

## 1. Penyiapan Surat Suara (Oleh Admin)

1. **Buat Sesi Voting**: Admin membuka `Manajemen Voting` -> `Buat Sesi Baru`.
2. **Konfigurasi**:
   - **Tipe Voting**: Pemilihan Tunggal (*Single Choice*), Pemilihan Ganda (*Multiple Choice*), atau Formatur.
   - **Kandidat/Opsi**: Mengisi daftar nama calon atau opsi (Setuju/Tolak/Abstain) dan mengunggah foto.
3. **Status Awal**: Sesi tersimpan dalam status **DRAFT**. Peserta belum dapat melihat surat suara.

## 2. Pelaksanaan Pemungutan Suara

1. **Aktivasi (Admin)**: Saat agenda pemilihan tiba, Admin mengklik `Mulai Sesi`. Status berubah menjadi **ACTIVE**.
2. **Notifikasi Real-time (Sistem)**: Layar aplikasi Web milik seluruh peserta memunculkan pemberitahuan instan (*push/toast* via *WebSocket*): "Sesi Pemilihan Ketua Telah Dibuka".
3. **Akses Surat Suara (Peserta)**: 
   - Sistem melakukan pengecekan ganda (*Double Validation*): Apakah user berstatus "Hadir"? Dan apakah user memiliki flag "Hak Suara"?
   - Jika ya, kartu surat suara digital ditampilkan.
4. **Proses Pencoblosan (Peserta)**:
   - Peserta memilih kandidat.
   - Peserta menekan tombol `Submit Vote`.
   - Sebuah modal *Confirmation Dialog* muncul: "Apakah Anda yakin dengan pilihan ini? Suara yang telah masuk tidak dapat diubah kembali."
   - Peserta menekan `Ya, Kunci Suara Saya`.
5. **Enkripsi Suara (Sistem)**: Payload suara di-*hash*, menghilangkan kaitan langsung antara tabel *Users* dan pilihan yang di-*submit* guna menjaga kerahasiaan (*secrecy*). Baris log dicatat sebagai *"User A telah memilih"* tanpa menyimpan *"User A memilih Kandidat X"*. Suara masuk dikalkulasi secara asinkron.
6. **Layar Kunci (Peserta)**: Antarmuka peserta berubah menjadi indikator sukses ("Terima Kasih, Suara Anda telah masuk").

## 3. Penutupan & Hasil

1. **Pantau Lalu Lintas Suara (Admin)**: Admin dapat melihat statistik (Contoh: "300 dari 400 Peserta Hadir telah menggunakan Hak Suara"), tanpa melihat hasil kandidat mana yang unggul.
2. **Penutupan Sesi (Admin)**: Setelah alokasi waktu habis, Admin menekan tombol `Tutup Sesi`. Status berubah menjadi **CLOSED**. Akses pencoblosan bagi sisa peserta akan dikunci.
3. **Kalkulasi Final (Sistem)**: Menghitung total perolehan suara masing-masing kandidat.
4. **Tampilkan Hasil (Admin & Peserta)**: Pimpinan Sidang (atau Admin) menekan tombol `Publikasikan Hasil`. Serta merta, bagan hasil suara (*Pie Chart / Bar Chart*) tampil di layar gawai semua pengguna dan layar proyektor.

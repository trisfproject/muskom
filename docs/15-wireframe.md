# Wireframe Conceptual Design

Dokumen ini menjelaskan rancangan tata letak (*layout*) secara konseptual tanpa implementasi kode *frontend*. Konsep difokuskan pada kepatuhan asas UI/UX yang bersih, profesional, dan dapat diskalakan.

## 1. Tata Letak Dasar (Base Layout)

### Aplikasi Web (Peserta) - Tampilan Mobile-First
- **Header (Top Bar)**: Tinggi 60px. Menampilkan Logo MUSKOM (kiri), Judul Acara Aktif (tengah), dan Notifikasi (Kanan).
- **Content Area**: Memenuhi seluruh sisa layar. Menggunakan padding 16px. Mendukung *scroll* vertikal.
- **Bottom Navigation**: Menempel di dasar layar (fixed). Berisi ikon dengan label: Beranda, Agenda, Voting, Dokumen, Profil.

### Aplikasi Admin - Tampilan Desktop-First
- **Sidebar (Kiri)**: Lebar 250px (dapat di-collapse menjadi 60px). Berisi Logo dan Menu Navigasi (Dashboard, Acara, Pengguna, dst.).
- **Header (Atas)**: Berisi fitur Pencarian (Global Search), Profil Admin, dan Pemilih Konteks Acara (Dropdown Event).
- **Main Canvas (Kanan)**: Area utama (Card, Tabel Data, dan Bagan/Chart). Mendukung *breadcrumb* navigasi di sisi atas.

## 2. Rincian Tampilan Kunci

### Layar Beranda (Peserta)
- **Top Section**: Ucapan selamat datang (`"Selamat datang, [Nama]"`), dengan lencana (badge) yang menampilkan Status Registrasi (Merah: "Menunggu", Hijau: "Hadir").
- **Center Section**: Modul Kode QR besar (memenuhi sepertiga layar) dengan tingkat kontras tinggi, siap dipindai.
- **Bottom Section**: Kartu berisi agenda terdekat (Next Up) beserta tombol aksi cepat.

### Layar Voting Room (Peserta)
- Tampilan hanya berisi satu kartu lebar berisikan instruksi (contoh: "Pilih 1 dari 3 Kandidat").
- **Opsi Kandidat**: Berupa daftar kotak (*Radio Card/Checkbox Card*). Jika kotak ditekan, *border* kotak berubah warna menjadi hijau tebal (mengindikasikan pilihan).
- **Sticky Submit Button**: Tombol "Kirim Suara" selalu melayang (*sticky*) di bawah layar agar mudah ditekan setelah memilih.

### Dasbor Live Kuorum (Admin / Layar Proyektor)
- **Visualisasi Dominan**: Memanfaatkan *Gauge Chart* (Meteran) atau *Donut Chart* besar di tengah layar.
- **Angka**: Menampilkan pecahan (misal: "125 / 200 Hadir").
- **Status Teks Besar**: Di bawah grafik, terdapat tulisan tebal yang responsif terhadap kalkulasi. Jika tidak memenuhi kuorum: tulisan merah "TIDAK SAH (MENUNGGU)". Jika mencapai kuorum: tulisan hijau "KUORUM TERCAPAI".

### Tabel Manajemen Data (Admin)
- Berbasis komponen *Data Table* modern.
- **Toolbar**: Berisi kotak *Search*, menu *Filter* (berdasarkan Role/Status), dan tombol aksi ganda (*Export CSV*, *Import*).
- **Aksi Kolom**: Tiap baris data (contoh tabel peserta) memiliki menu titik tiga (Elipsis) di sisi paling kanan (opsi: Lihat Detail, Cabut Hak Suara, Hapus).

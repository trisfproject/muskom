# UI/UX Guideline

Sebagai CTO dan Architect, penting untuk menetapkan standar desain guna memastikan konsistensi antarmuka pengguna di seluruh platform.

## 1. Design Philosophy
- **Clean & Professional**: Antarmuka tidak boleh terlalu ramai. Fokus pada informasi (Materi dan Voting).
- **Mobile-First Approach**: Karena mayoritas peserta musyawarah akan melakukan voting melalui smartphone mereka saat berada di ruang sidang.
- **High Contrast & Accessible**: Warna tombol aksi (seperti tombol "VOTE") harus jelas dan tidak menimbulkan kebingungan bagi demografi peserta yang berusia lanjut.

## 2. Color Palette
- **Primary Brand Color**: `#1D4ED8` (Biru Profesional - Mewakili kepercayaan dan formalitas).
- **Secondary / Accent**: `#10B981` (Hijau - Untuk indikator sukses, tombol Vote, dan Kuorum).
- **Danger / Alert**: `#EF4444` (Merah - Untuk tombol hapus, peringatan, tutup voting).
- **Background**: `#F3F4F6` (Abu-abu sangat terang untuk membedakan dengan kartu putih).
- **Text**: `#111827` (Hitam pekat untuk keterbacaan tinggi).

## 3. Typography
- **Primary Font**: `Inter` atau `Roboto` (Sans-serif yang bersih dan modern).
- **Headings**: Bold (Weight 700), memberikan hierarki yang jelas.
- **Body**: Regular (Weight 400), ukuran minimal 14px untuk desktop, 16px untuk mobile.

## 4. Komponen Utama
- **Cards**: Digunakan untuk menampilkan list Event dan list Kandidat. Menggunakan shadow tipis dan sudut membulat (border-radius 8px).
- **Modals**: Digunakan untuk **Konfirmasi Voting**. (Cth: "Apakah Anda yakin memilih Opsi A? Pilihan tidak dapat diubah.").
- **Feedback/Toasts**: Notifikasi instan (Cth: "Presensi Berhasil", "Vote Tersimpan") berada di pojok atas.

## 5. Framework
Menggunakan utilitas dari **Tailwind CSS** untuk kecepatan styling, dengan komponen pracetak dari library seperti **shadcn/ui** atau **Radix UI** untuk aksesibilitas maksimal.

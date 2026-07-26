# Frontend Engineering Standard

Standar ini memandu pengembangan antarmuka pengguna MUSKOM berbasis Next.js 15 (App Router), TypeScript, dan TailwindCSS.

## 1. Struktur Komponen
- Gunakan pendekatan *Feature-Sliced Design* atau pengelompokan berdasarkan fitur (misal: komponen, *hooks*, dan tipe disatukan per modul/fitur).
- Sebisa mungkin gunakan **React Server Components (RSC)**.
- Gunakan `'use client'` secara sangat selektif, hanya di tingkat komponen daun (*leaf components*) yang benar-benar butuh reaktivitas, state (`useState`), atau akses *browser API*.

## 2. Styling (TailwindCSS)
- Hindari penulisan kelas utilitas yang berlebihan di satu baris JSX. Gunakan pustaka seperti `clsx` atau `tailwind-merge` untuk penggabungan kelas secara kondisional.
- Manfaatkan **shadcn/ui** sebagai sistem dasar komponen. Ekstrak dan ubah gaya komponen sesuai dengan pedoman identitas merek (Brand Guidelines) proyek.
- Pastikan dukungan Mode Gelap (Dark Mode) berfungsi mulus tanpa kontras warna yang bentrok.

## 3. Data Fetching
- Panggil API langsung dari Server Components kapan pun memungkinkan untuk keamanan dan performa yang lebih baik.
- Gunakan React Suspense dan fitur `loading.tsx` Next.js untuk menangani status pramuat (loading state) agar antarmuka tetap interaktif.

## 4. Keamanan Frontend
- Jauhkan semua variabel lingkungan sensitif (*API secrets*) dari awalan `NEXT_PUBLIC_`.
- Lakukan sanitasi terhadap semua masukan (*input*) untuk mencegah serangan Cross-Site Scripting (XSS).

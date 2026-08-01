import { HomeResponse } from "@/types/landing";

export const landingSeed: HomeResponse = {
  event: {
    name: "Musyawarah KOMITKABE 2026",
    theme: "Selamat datang di Portal Resmi Musyawarah. Platform terpadu untuk mewujudkan pemilihan yang transparan, aman, dan dapat diandalkan oleh seluruh anggota.",
    location: "Gedung Pusat Komunitas, Lt 3. Jakarta Selatan.",
    mapsUrl: "https://maps.google.com",
    event_date: "29 Agustus 2026",
    event_time: "09:00 WIB",
    status: "UPCOMING",
  },
  settings: {
    registration_approval_mode: "MANUAL",
    show_candidate_list: true,
    show_timeline: true,
    show_announcements: true,
  },
  currentPhase: {
    name: "Fase Persiapan",
    is_active: true,
  },
  countdown: {
    target_date: "2026-07-18T00:00:00Z", // Target Sidang Mandat
    label: "Menuju Sidang Mandat",
  },
  cta: {
    primary: {
      label: "Daftar Peserta",
      url: "/register",
    },
    secondary: {
      label: "Panduan Peserta",
      url: "#faq",
    },
  },
  timeline: [
    { id: "01", title: "Sidang Mandat", date: "18 Juli 2026", start_date: "2026-07-18T00:00:00Z", end_date: "2026-07-18T23:59:59Z", status: "active" },
    { id: "02", title: "Penjaringan Aspirasi", date: "19–25 Juli 2026", start_date: "2026-07-19T00:00:00Z", end_date: "2026-07-25T23:59:59Z", status: "upcoming" },
    { id: "03", title: "Penjaringan Bakal Calon Ketua Umum", date: "26 Juli – 8 Agustus 2026", start_date: "2026-07-26T00:00:00Z", end_date: "2026-08-08T23:59:59Z", status: "upcoming" },
    { id: "04", title: "Verifikasi Administrasi", date: "9 Agustus 2026", start_date: "2026-08-09T00:00:00Z", end_date: "2026-08-09T23:59:59Z", status: "upcoming" },
    { id: "05", title: "Penetapan Calon Ketua Umum", date: "12 Agustus 2026", start_date: "2026-08-12T00:00:00Z", end_date: "2026-08-12T23:59:59Z", status: "upcoming" },
    { id: "06", title: "Masa Kampanye", date: "13–26 Agustus 2026", start_date: "2026-08-13T00:00:00Z", end_date: "2026-08-26T23:59:59Z", status: "upcoming" },
    { id: "07", title: "Masa Tenang", date: "26–28 Agustus 2026", start_date: "2026-08-26T00:00:00Z", end_date: "2026-08-28T23:59:59Z", status: "upcoming" },
    { id: "08", title: "Musyawarah", date: "29 Agustus 2026", start_date: "2026-08-29T00:00:00Z", end_date: "2026-08-29T23:59:59Z", status: "upcoming" },
  ],
  announcements: [],
  candidates: [],
  faq: [
    { question: "Apa itu Musyawarah KOMITKABE?", answer: "Musyawarah KOMITKABE adalah forum kekuasaan tertinggi dalam pengambilan keputusan organisasi, yang dilaksanakan untuk memilih Ketua Umum dan menetapkan garis besar haluan organisasi." },
    { question: "Siapa yang dapat mengikuti?", answer: "Seluruh anggota yang telah terdaftar, terverifikasi, dan mendapatkan mandat resmi dari komisariat atau cabang masing-masing sesuai ketentuan AD/ART." },
    { question: "Bagaimana cara registrasi peserta?", answer: "Peserta dapat melakukan pendaftaran melalui portal ini pada menu 'Daftar Peserta'. Pastikan menyiapkan dokumen persyaratan dan surat mandat dalam bentuk digital (PDF)." },
    { question: "Kapan pemilihan dilakukan?", answer: "Pemilihan Ketua Umum akan dilaksanakan pada puncak acara musyawarah, yang dijadwalkan pada 29 Agustus 2026." },
    { question: "Dimana lokasi kegiatan?", answer: "Lokasi kegiatan utama akan dilaksanakan di Jakarta. Detail alamat lengkap dan panduan akses akan diumumkan pada masa tenang." }
  ],
  footer: {
    email: "panitia@muskom.id",
    whatsapp: "+62 812-3456-7890",
    whatsapp_url: "https://wa.me/6281234567890",
    address: "Gedung Pusat Komunitas, Lt 3. Jakarta Selatan.",
    copyright: "Panitia Pelaksana MUSKOM. Hak Cipta Dilindungi.",
    tagline: "Dibangun untuk kemajuan bersama.",
    links: [
      { label: "Syarat & Ketentuan", url: "#" },
      { label: "Kebijakan Privasi", url: "#" },
      { label: "Panduan Peserta", url: "#" },
    ],
    socials: [
      { platform: "Twitter", url: "#" },
      { platform: "Instagram", url: "#" },
    ]
  }
};

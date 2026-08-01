import { HomeResponse } from "@/types/landing";

// Seed data: fallback when API is unavailable.
// All business data flows through this shape — nothing is hardcoded in components.
// Timeline status is set here to simulate the current date (2026-08-01 = Penjaringan Bakal Calon active).
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
    name: "Penjaringan Bakal Calon Ketua Umum",
    is_active: true,
  },
  countdown: {
    target_date: "2026-08-08T23:59:59Z",
    label: "Penjaringan Ditutup",
  },
  // Two independent registration CTAs — visual priority set by backend per active phase (ADR 0006)
  cta: {
    candidate_registration: {
      label: "Daftar Calon Ketua Umum",
      url: "/register/candidate", // TODO Increment 4: Candidate Registration Module
      open: true,
      style: "primary" as const, // Primary during Penjaringan phase
    },
    participant_registration: {
      label: "Daftar Peserta Musyawarah",
      url: "/register",
      open: true,
      style: "outline" as const,
    },
  },
  timeline: [
    { id: "01", title: "Sidang Mandat", date: "18 Juli 2026", start_date: "2026-07-18T00:00:00Z", end_date: "2026-07-18T23:59:59Z", status: "past" },
    { id: "02", title: "Penjaringan Aspirasi", date: "19–25 Juli 2026", start_date: "2026-07-19T00:00:00Z", end_date: "2026-07-25T23:59:59Z", status: "past" },
    { id: "03", title: "Penjaringan Bakal Calon Ketua Umum", date: "26 Juli – 8 Agustus 2026", start_date: "2026-07-26T00:00:00Z", end_date: "2026-08-08T23:59:59Z", status: "active" },
    { id: "04", title: "Verifikasi Administrasi", date: "9 Agustus 2026", start_date: "2026-08-09T00:00:00Z", end_date: "2026-08-09T23:59:59Z", status: "upcoming" },
    { id: "05", title: "Penetapan Calon Ketua Umum", date: "12 Agustus 2026", start_date: "2026-08-12T00:00:00Z", end_date: "2026-08-12T23:59:59Z", status: "upcoming" },
    { id: "06", title: "Masa Kampanye", date: "13–26 Agustus 2026", start_date: "2026-08-13T00:00:00Z", end_date: "2026-08-26T23:59:59Z", status: "upcoming" },
    { id: "07", title: "Masa Tenang", date: "26–28 Agustus 2026", start_date: "2026-08-26T00:00:00Z", end_date: "2026-08-28T23:59:59Z", status: "upcoming" },
    { id: "08", title: "Musyawarah", date: "29 Agustus 2026", start_date: "2026-08-29T00:00:00Z", end_date: "2026-08-29T23:59:59Z", status: "upcoming" },
  ],
  announcements: [],
  candidates: [],
  // Footer: navigation, contact, copyright only — per ADR 0006
  footer: {
    email: "panitia@muskom.id",
    whatsapp: "+62 812-3456-7890",
    whatsapp_url: "https://wa.me/6281234567890",
    address: "Gedung Pusat Komunitas, Lt 3. Jakarta Selatan.",
    copyright: "Panitia Pelaksana MUSKOM. Hak Cipta Dilindungi.",
    tagline: "Dibangun untuk kemajuan bersama.",
  },
};

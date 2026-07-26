# Sitemap

Representasi visual dari hierarki halaman MUSKOM.

```text
MUSKOM Portal
│
├── / (Landing Page / Login)
├── /forgot-password
│
├── /peserta (Dashboard Peserta)
│   ├── /peserta/beranda
│   ├── /peserta/agenda
│   ├── /peserta/voting
│   │   ├── /peserta/voting/[id] (Form Pencoblosan)
│   │   └── /peserta/voting/[id]/hasil (View Hasil)
│   ├── /peserta/dokumen
│   └── /peserta/profil
│
└── /admin (Dashboard Panitia)
    ├── /admin/dashboard
    ├── /admin/event
    │   ├── /admin/event/create
    │   └── /admin/event/[id]/edit
    ├── /admin/users
    │   ├── /admin/users/peserta
    │   └── /admin/users/panitia
    ├── /admin/presensi
    │   ├── /admin/presensi/scanner
    │   └── /admin/presensi/report
    ├── /admin/voting
    │   ├── /admin/voting/create
    │   ├── /admin/voting/[id]/control
    │   └── /admin/voting/[id]/report
    ├── /admin/dokumen
    └── /admin/settings
```

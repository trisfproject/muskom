# Development Roadmap

Rencana pengembangan proyek MUSKOM disusun menggunakan pendekatan Agile (Scrum) dengan iterasi Sprint berdurasi 2 minggu.

## Fase 1: MVP (Minimum Viable Product) - Waktu: 2 Bulan
Fokus pada fungsionalitas inti agar musyawarah dapat berjalan secara digital.

- **Sprint 1: Foundation & Auth**
  - Setup repository, Docker, CI/CD pipeline.
  - Skema database (PostgreSQL).
  - Modul Login & RBAC.
- **Sprint 2: Event & Attendance**
  - CRUD Event & Agenda.
  - Modul check-in peserta dan kalkulasi live kuorum.
- **Sprint 3: Core E-Voting System**
  - Setup sesi voting dan kandidat/opsi.
  - Sistem pemungutan suara (Vote Casting) dan validasi hak suara.
- **Sprint 4: Result & Documents**
  - Live result dashboard (Chart).
  - Modul upload & unduh materi sidang.
  - UAT (User Acceptance Testing) dan Bug Fixing.

## Fase 2: Enhancement & Scale - Waktu: 1 Bulan
Setelah MVP berhasil digunakan, fokus pada peningkatan performa dan auditability.

- **Sprint 5: Security & Audit Trail**
  - Implementasi hashing log suara (Anti-tampering).
  - Export data laporan musyawarah ke format Excel/PDF.
- **Sprint 6: Real-time Optimization**
  - Integrasi WebSockets / Server-Sent Events untuk Live Kuorum dan Live Result yang lebih smooth (tanpa perlu reload page).

## Fase 3: Future Ecosystem (TBD)
Inisiatif pengembangan tingkat lanjut.
- Integrasi Video Conference (Zoom/Jitsi SDK).
- Implementasi Mobile App (React Native / Flutter).
- AI Auto-Notulensi.

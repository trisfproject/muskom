# Product Navigation Architecture

## Admin Portal Navigation Structure
Mapped in [`AdminSidebar.tsx`](file:///home/trisfang/muskom/apps/frontend/src/components/admin/AdminSidebar.tsx):

1. **Dashboard:** Overview metrics (`/admin/dashboard`)
2. **Musyawarah & Master Data:**
   - Identity & Config (`/admin/musyawarah/general`)
   - Location & Maps (`/admin/musyawarah/location`)
   - Timeline & Agenda (`/admin/musyawarah/timeline`)
   - Publication (`/admin/musyawarah/publication`)
   - Archive (`/admin/musyawarah/archive`)
3. **Website CMS:**
   - Hero Banner (`/admin/website/hero`)
   - Candidate Text Settings (`/admin/website/candidate`)
   - Announcements (`/admin/website/announcements`)
   - Information Pages (`/admin/website/information`)
   - Footer & Links (`/admin/website/footer`)
4. **Participant Management:**
   - Candidate Applications (`/admin/candidates`)
   - Delegate Dashboard (`/admin/participants`)
   - Registrations & Verification (`/admin/registrations`)
5. **System & Security:**
   - User Management (`/admin/users`)
   - Audit Log (`/admin/audit`)

## Public Navigation Bar
- Beranda (`/`)
- Agenda (`/agenda`)
- Kandidat (`/kandidat`)
- Voting Room (`/voting`)
- Dokumen (`/dokumen`)
- Panduan / Info (`/informasi`)
- Profil / Ticket (`/profil`)

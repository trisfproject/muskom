# ADR-005: Admin Portal Sidebar Navigation Architecture

- **Status:** Accepted
- **Date:** August 5, 2026

## Context
Initial Admin Sidebar navigation contained mislinked URLs (pointing Musyawarah General & Timeline to Website CMS routes) and lacked operational items for Attendance, Voting, and Documents.

## Decision
1. Restructure `AdminSidebar.tsx` into 8 explicit functional groups:
   - Dashboard (`/admin/dashboard`)
   - Musyawarah & Master Data (`/admin/musyawarah/*`)
   - Participant Management (`/admin/participants`)
   - E-Voting & Candidates (`/admin/candidates`, `/admin/voting`)
   - Attendance & Presensi (`/admin/attendance`)
   - CMS & Public Website (`/admin/website/*`)
   - Documents (`/admin/documents`)
   - System & Security (`/admin/users`, `/admin/audit`)
2. Maximize navigation depth to 3 levels.

## Consequences
- Clean, intuitive sidebar navigation aligning 100% with real-world committee workflows.

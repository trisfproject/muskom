# RC-1 Roadmap (Release Candidate 1)

## RC-1 Objectives
Target: **Production Readiness for First Assembly**

### Scope & Sprint Allocations
- **Sprint 1 — Core Domain Fixes & Data Model SSOT:**
  - Database Migration `054` fixing `attendance` and `votes` FK constraints to `participants(id)`.
  - Add `checker.RequirePermission()` RBAC middleware across all 10 un-gated admin route groups in `cmd/server/main.go`.
  - Validate `registration_open`/`close` date bounds in `participant` service.
  - Delete dead `internal/modules/registration` Go module.
  - Fix `AdminSidebar.tsx` routing.
- **Sprint 2 — Attendance & Live Quorum Subsystem:**
  - Build Admin Attendance QR Scanner (`/admin/attendance`).
  - Real-time Live Quorum calculation gauge.
  - Public User Profile & QR ticket page (`/profil`).
- **Sprint 3 — E-Voting Subsystem & Control Panel:**
  - Build Admin Voting Control Panel (`/admin/voting`).
  - Build Public Voting Room (`/voting`).
  - Build Election Results & Tally Export view.
- **Sprint 4 — Public Portal Completion & CMS Sync:**
  - Connect `GET /api/v1/public/home` directly to CMS database tables.
  - Implement missing public routes: `/agenda`, `/dokumen`.
- **Sprint 5 — Integration Testing & Production Docker Release:**
  - End-to-end integration validation, multi-container Docker compose verification, final RC-1 sign-off.

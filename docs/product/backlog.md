# MUSKOM Final Product Backlog

This document serves as the **FROZEN** single source of truth for the MUSKOM (Musyawarah KOMITKABE) project development. Future development MUST follow this backlog.

## Status Legend
- ✅ Done
- 🚧 In Progress
- ⏳ Planned
- ❌ Blocked

---

## 1. Epic: Foundation (FND)
| Task ID | Description | Priority | Effort | Dependencies | Sprint | Status |
|---|---|---|---|---|---|---|
| FND-01 | Setup Git mono-repo, CI/CD basics. | Critical | 2d | None | Sprint 1 | ✅ Done |
| FND-02 | Create PostgreSQL schema and migrations. | Critical | 1d | FND-01 | Sprint 1 | ✅ Done |
| FND-03 | Setup Redis for caching and sessions. | Critical | 1d | FND-01 | Sprint 1 | ✅ Done |
| FND-04 | Configure docker-compose & Dockerfiles. | Critical | 1d | FND-02, FND-03 | Sprint 1 | ✅ Done |
| FND-05 | Document Engineering Standards. | Critical | 1d | None | Sprint 1 | ✅ Done |
| FND-06 | File Storage Abstraction (Local/S3). | High | 2d | FND-07 | Sprint 2 | ✅ Done |
| FND-07 | Backend Bootstrap (Go Fiber API). | Critical | 2d | FND-04, FND-05 | Sprint 1 | ✅ Done |
| FND-08 | Frontend Bootstrap (Next.js/Vite). | Critical | 2d | FND-05 | Sprint 1 | ⏳ Planned |
| FND-09 | Database Seeders (Master Data). | Medium | 1d | FND-02 | Sprint 2 | ⏳ Planned |

## 2. Epic: Admin Portal (ADM)
| Task ID | Description | Priority | Effort | Dependencies | Sprint | Status |
|---|---|---|---|---|---|---|
| MKS-020-001 | Admin Registration Management (Listing, Detail, Status). | High | 2d | MKS-040-001 | Sprint 3 | ✅ Done |
| MKS-020-002 | Admin Candidate Management (Listing, Detail, Status). | High | 2d | MKS-050-001 | Sprint 4 | ✅ Done |
| MKS-020-003 | Dashboard Analytics (Participant counts, Votes). | Medium | 2d | MKS-020-001, MKS-060-001 | Sprint 4 | ⏳ Planned |
| MKS-020-004 | Participant Verification Interface. | High | 2d | MKS-020-002, MKS-040-005 | Sprint 5 | ✅ Done |
| MKS-020-005 | Candidate Verification Interface. | High | 2d | MKS-020-002, MKS-050-001 | Sprint 5 | ⏳ Planned |
| MKS-020-006 | Attendance Check-in API (QR/Manual). | High | 2d | MKS-020-002 | Sprint 5 | ⏳ Planned |
| MKS-020-007 | Announcement Management (CRUD). | Medium | 1d | MKS-020-002 | Sprint 2 | ⏳ Planned |
| MKS-020-008 | Document & Media Management (CRUD). | High | 2d | MKS-020-002, FND-06 | Sprint 2 | ⏳ Planned |

## 3. Epic: Public Portal (PUB)
| Task ID | Description | Priority | Effort | Dependencies | Sprint | Status |
|---|---|---|---|---|---|---|
| MKS-040-001 | Public Registration API. | Critical | 2d | MKS-020-001 | Sprint 3 | ✅ Done |
| MKS-040-002 | Registration Validation. | High | 2d | MKS-040-001 | Sprint 3 | ✅ Done |
| MKS-040-003 | Registration Attachments. | High | 2d | MKS-040-001, FND-06 | Sprint 3 | ✅ Done |
| MKS-040-004 | Registration Confirmation. | High | 2d | MKS-040-001 | Sprint 3 | ✅ Done |
| MKS-040-005 | Admin Registration Management. | High | 2d | MKS-020-002, MKS-040-001 | Sprint 3 | ✅ Done |
| MKS-040-006 | Landing Page (Banner, Theme, Logo). | High | 2d | FND-08, MKS-020-001 | Sprint 3 | ⏳ Planned |
| MKS-040-007 | Timeline Display (Event Phases). | High | 1d | MKS-040-006 | Sprint 3 | ⏳ Planned |
| MKS-040-008 | View Announcements. | Medium | 1d | MKS-020-007, MKS-040-006 | Sprint 3 | ⏳ Planned |
| MKS-040-009 | View & Download Public Documents. | Medium | 1d | MKS-020-008, MKS-040-006 | Sprint 3 | ⏳ Planned |
| MKS-050-001 | Candidate Registration API & Uploads. | Critical | 3d | MKS-040-001, FND-06 | Sprint 4 | ✅ Done |
| MKS-050-002 | Candidate Registration Validation. | High | 1d | MKS-050-001 | Sprint 4 | ✅ Done |
| MKS-050-003 | Candidate Registration Attachments. | High | 1d | MKS-050-001 | Sprint 4 | ✅ Done |
| MKS-050-005 | Admin Candidate Management. | Medium | 2d | MKS-050-004 | Sprint 4 | ✅ Done |

## 4. Epic: E-Voting (EVT)
| Task ID | Description | Priority | Effort | Dependencies | Sprint | Status |
|---|---|---|---|---|---|---|
| MKS-060-001 | Verification Queue. | Critical | 2d | MKS-020-004, MKS-020-006 | Sprint 5 | ✅ Done |
| MKS-060-002 | Candidate Profile Display. | Critical | 1d | MKS-020-005 | Sprint 6 | ⏳ Planned |
| MKS-060-003 | Anonymous Vote Submission & Transaction. | Critical | 4d | MKS-060-001, MKS-060-002 | Sprint 6 | ⏳ Planned |
| MKS-060-004 | Voting Session & Timeout Management. | High | 2d | MKS-060-003 | Sprint 6 | ⏳ Planned |
| MKS-060-005 | Live Real-time Statistics. | Medium | 3d | MKS-060-003 | Sprint 6 | ⏳ Planned |
| MKS-060-006 | Final Result Publication & Freeze. | High | 1d | MKS-060-003, MKS-020-001 | Sprint 6 | ⏳ Planned |
| MKS-060-007 | Audit Reports (PDF/Excel) Export. | Low | 2d | MKS-060-006 | Sprint 6 | ⏳ Planned |

## 5. Epic: System & Operations (SYS)
| Task ID | Description | Priority | Effort | Dependencies | Sprint | Status |
|---|---|---|---|---|---|---|
| MKS-070-001 | Notifications Engine (Email/Telegram). | High | 3d | FND-07 | Sprint 6 | ⏳ Planned |
| MKS-070-002 | Admin Audit Log (Who, What, When). | High | 2d | MKS-020-002 | Sprint 6 | ⏳ Planned |
| MKS-070-003 | Global System Settings. | Medium | 1d | MKS-020-002 | Sprint 6 | ⏳ Planned |
| MKS-070-004 | Infrastructure Health Check API. | Medium | 1d | FND-07 | Sprint 6 | ⏳ Planned |
| MKS-070-005 | Prometheus/Grafana Monitoring. | Low | 2d | MKS-070-004 | Sprint 6 | ⏳ Planned |
| MKS-070-006 | Automated DB Backup to S3 via CRON. | High | 2d | FND-02, FND-06 | Sprint 6 | ⏳ Planned |

---

## Sprints Layout

### Sprint 1: Foundation & Core API
**Status**: ✅ Completed
- FND-01: Setup Git mono-repo, CI/CD basics
- FND-02: Create PostgreSQL schema and migrations
- FND-03: Setup Redis for caching and sessions
- FND-04: Configure docker-compose & Dockerfiles
- FND-05: Document Engineering Standards
- FND-07: Backend Bootstrap (Go Fiber API)
- FND-08: Frontend Bootstrap (Next.js/Vite)
- MKS-020-002: Admin Authentication & Logout

### Sprint 2: Event Configuration & Content
**Status**: ✅ Completed
- MKS-020-001: Musyawarah Config, Settings & Timeline (✅ Done)
- FND-06: File Storage Abstraction (Local/S3) (✅ Done)
- FND-09: Database Seeders (Master Data)
- MKS-020-007: Announcement Management (CRUD)
- MKS-020-008: Document & Media Management (CRUD)

### Sprint 3: Participant Registration
**Status**: ✅ Completed
- MKS-040-001: Public Registration API (✅ Done)
- MKS-040-002: Registration Validation (✅ Done)
- MKS-040-003: Registration Attachments (✅ Done)
- MKS-040-004: Registration Confirmation (✅ Done)
- MKS-040-005: Admin Registration Management (✅ Done)
- MKS-040-006: Landing Page (Banner, Theme, Logo)
- MKS-040-007: Timeline Display (Event Phases)
- MKS-040-008: View Announcements
- MKS-040-009: View & Download Public Documents

### Sprint 4: Candidate Registration & Dashboards
**Status**: ✅ Completed
- MKS-050-001: Candidate Registration API & Uploads (✅ Done)
- MKS-050-002: Candidate Registration Validation (✅ Done)
- MKS-050-003: Candidate Registration Attachments (✅ Done)
- MKS-020-002: Admin Candidate Verification (✅ Done)
- MKS-020-003: Dashboard Analytics (Participants/Votes)
- MKS-050-005: Admin Candidate Management (✅ Done)

### Sprint 5: Verification & Attendance
**Status**: 🚧 In Progress
- MKS-060-001: Verification Queue (✅ Done)
- MKS-020-004: Participant Verification Interface (✅ Done)
- MKS-020-005: Candidate Verification Interface
- MKS-020-006: Attendance Check-in API (QR/Manual)

### Sprint 6: Voting & Result
**Status**: ⏳ Planned
- MKS-060-002: Candidate Profile Display
- MKS-060-003: Anonymous Vote Submission & Transaction
- MKS-060-004: Voting Session & Timeout Management
- MKS-060-005: Live Real-time Statistics
- MKS-060-006: Final Result Publication & Freeze
- MKS-060-007: Audit Reports (PDF/Excel) Export
- MKS-070-001: Notifications Engine (Email/Telegram)
- MKS-070-002: Admin Audit Log (Who, What, When)
- MKS-070-003: Global System Settings
- MKS-070-004: Infrastructure Health Check API
- MKS-070-005: Prometheus/Grafana Monitoring
- MKS-070-006: Automated DB Backup to S3 via CRON

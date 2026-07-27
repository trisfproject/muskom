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
| ADM-01 | Admin Registration Management (Listing, Detail, Status). | High | 2d | PUB-01 | Sprint 3 | ✅ Done |
| ADM-02 | Admin Candidate Management (Listing, Detail, Status). | High | 2d | PUB-10 | Sprint 4 | ✅ Done |
| ADM-03 | Dashboard Analytics (Participant counts, Votes). | Medium | 2d | ADM-01, EVT-01 | Sprint 4 | ⏳ Planned |
| ADM-04 | Participant Verification Interface. | High | 2d | ADM-02, PUB-05 | Sprint 5 | ⏳ Planned |
| ADM-05 | Candidate Verification Interface. | High | 2d | ADM-02, PUB-10 | Sprint 5 | ⏳ Planned |
| ADM-06 | Attendance Check-in API (QR/Manual). | High | 2d | ADM-02 | Sprint 5 | ⏳ Planned |
| ADM-07 | Announcement Management (CRUD). | Medium | 1d | ADM-02 | Sprint 2 | ⏳ Planned |
| ADM-08 | Document & Media Management (CRUD). | High | 2d | ADM-02, FND-06 | Sprint 2 | ⏳ Planned |

## 3. Epic: Public Portal (PUB)
| Task ID | Description | Priority | Effort | Dependencies | Sprint | Status |
|---|---|---|---|---|---|---|
| PUB-01 | Public Registration API (MKS-040-001). | Critical | 2d | ADM-01 | Sprint 3 | ✅ Done |
| PUB-02 | Registration Validation (MKS-040-002). | High | 2d | PUB-01 | Sprint 3 | ✅ Done |
| PUB-03 | Registration Attachments (MKS-040-003). | High | 2d | PUB-01, FND-06 | Sprint 3 | ✅ Done |
| PUB-04 | Registration Confirmation (MKS-040-004). | High | 2d | PUB-01 | Sprint 3 | ✅ Done |
| PUB-05 | Admin Registration Management (MKS-040-005). | High | 2d | ADM-02, PUB-01 | Sprint 3 | ✅ Done |
| PUB-06 | Landing Page (Banner, Theme, Logo). | High | 2d | FND-08, ADM-01 | Sprint 3 | ⏳ Planned |
| PUB-07 | Timeline Display (Event Phases). | High | 1d | PUB-06 | Sprint 3 | ⏳ Planned |
| PUB-08 | View Announcements. | Medium | 1d | ADM-07, PUB-06 | Sprint 3 | ⏳ Planned |
| PUB-09 | View & Download Public Documents. | Medium | 1d | ADM-08, PUB-06 | Sprint 3 | ⏳ Planned |
| PUB-10 | Candidate Registration API & Uploads. | Critical | 3d | PUB-01, FND-06 | Sprint 4 | ✅ Done |
| PUB-11 | Candidate Registration Validation. | High | 1d | PUB-10 | Sprint 4 | ✅ Done |
| PUB-12 | Candidate Registration Attachments. | High | 1d | PUB-10 | Sprint 4 | ✅ Done |

## 4. Epic: E-Voting (EVT)
| Task ID | Description | Priority | Effort | Dependencies | Sprint | Status |
|---|---|---|---|---|---|---|
| EVT-01 | Voter Booth Validation & Authorization. | Critical | 2d | ADM-04, ADM-06 | Sprint 6 | ⏳ Planned |
| EVT-02 | Candidate Profile Display. | Critical | 1d | ADM-05 | Sprint 6 | ⏳ Planned |
| EVT-03 | Anonymous Vote Submission & Transaction. | Critical | 4d | EVT-01, EVT-02 | Sprint 6 | ⏳ Planned |
| EVT-04 | Voting Session & Timeout Management. | High | 2d | EVT-03 | Sprint 6 | ⏳ Planned |
| EVT-05 | Live Real-time Statistics. | Medium | 3d | EVT-03 | Sprint 6 | ⏳ Planned |
| EVT-06 | Final Result Publication & Freeze. | High | 1d | EVT-03, ADM-01 | Sprint 6 | ⏳ Planned |
| EVT-07 | Audit Reports (PDF/Excel) Export. | Low | 2d | EVT-06 | Sprint 6 | ⏳ Planned |

## 5. Epic: System & Operations (SYS)
| Task ID | Description | Priority | Effort | Dependencies | Sprint | Status |
|---|---|---|---|---|---|---|
| SYS-01 | Notifications Engine (Email/Telegram). | High | 3d | FND-07 | Sprint 6 | ⏳ Planned |
| SYS-02 | Admin Audit Log (Who, What, When). | High | 2d | ADM-02 | Sprint 6 | ⏳ Planned |
| SYS-03 | Global System Settings. | Medium | 1d | ADM-02 | Sprint 6 | ⏳ Planned |
| SYS-04 | Infrastructure Health Check API. | Medium | 1d | FND-07 | Sprint 6 | ⏳ Planned |
| SYS-05 | Prometheus/Grafana Monitoring. | Low | 2d | SYS-04 | Sprint 6 | ⏳ Planned |
| SYS-06 | Automated DB Backup to S3 via CRON. | High | 2d | FND-02, FND-06 | Sprint 6 | ⏳ Planned |

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
- ADM-02: Admin Authentication & Logout

### Sprint 2: Event Configuration & Content
**Status**: ✅ Completed
- ADM-01: Musyawarah Config, Settings & Timeline (✅ Done)
- FND-06: File Storage Abstraction (Local/S3) (✅ Done)
- FND-09: Database Seeders (Master Data)
- ADM-07: Announcement Management (CRUD)
- ADM-08: Document & Media Management (CRUD)

### Sprint 3: Participant Registration
**Status**: ✅ Completed
- PUB-01: Public Registration API (MKS-040-001) (✅ Done)
- PUB-02: Registration Validation (MKS-040-002) (✅ Done)
- PUB-03: Registration Attachments (MKS-040-003) (✅ Done)
- PUB-04: Registration Confirmation (MKS-040-004) (✅ Done)
- PUB-05: Admin Registration Management (MKS-040-005) (✅ Done)
- PUB-06: Landing Page (Banner, Theme, Logo)
- PUB-07: Timeline Display (Event Phases)
- PUB-08: View Announcements
- PUB-09: View & Download Public Documents

### Sprint 4: Candidate Registration
**Status**: 🚧 In Progress
- PUB-10: Candidate Registration API & Uploads (✅ Done)
- PUB-11: Candidate Registration Validation (MKS-050-002) (✅ Done)
- PUB-12: Candidate Registration Attachments (MKS-050-003) (✅ Done)
- ADM-02: Admin Candidate Verification (MKS-050-004) (✅ Done)
- ADM-03: Dashboard Analytics (Participants/Votes)

### Sprint 5: Verification & Attendance
**Status**: ⏳ Planned
- ADM-04: Participant Verification Interface
- ADM-05: Candidate Verification Interface
- ADM-06: Attendance Check-in API (QR/Manual)

### Sprint 6: Voting & Result
**Status**: ⏳ Planned
- EVT-01: Voter Booth Validation & Authorization
- EVT-02: Candidate Profile Display
- EVT-03: Anonymous Vote Submission & Transaction
- EVT-04: Voting Session & Timeout Management
- EVT-05: Live Real-time Statistics
- EVT-06: Final Result Publication & Freeze
- EVT-07: Audit Reports (PDF/Excel) Export
- SYS-01: Notifications Engine (Email/Telegram)
- SYS-02: Admin Audit Log (Who, What, When)
- SYS-03: Global System Settings
- SYS-04: Infrastructure Health Check API
- SYS-05: Prometheus/Grafana Monitoring
- SYS-06: Automated DB Backup to S3 via CRON

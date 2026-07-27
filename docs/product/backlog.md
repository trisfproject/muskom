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
| FND-08 | Frontend Bootstrap (Next.js/Vite). | Critical | 2d | FND-05 | Sprint 3 | ⏳ Planned |
| FND-09 | Database Seeders (Master Data). | Medium | 1d | FND-02 | Sprint 2 | ⏳ Planned |

## 2. Epic: Admin Portal (ADM)
| Task ID | Description | Priority | Effort | Dependencies | Sprint | Status |
|---|---|---|---|---|---|---|
| ADM-01 | Musyawarah Config, Settings & Timeline (MKS-030). | Critical | 3d | FND-07 | Sprint 2 | ✅ Done |
| ADM-02 | Admin Authentication & Logout (MKS-021).| Critical | 3d | FND-07 | Sprint 1 | ✅ Done |
| ADM-03 | Dashboard Analytics (Participants/Votes). | High | 3d | ADM-01, ADM-02 | Sprint 4 | ⏳ Planned |
| ADM-04 | Participant Verification Interface. | High | 2d | ADM-02, PUB-05 | Sprint 4 | ⏳ Planned |
| ADM-05 | Candidate Verification Interface. | High | 2d | ADM-02, PUB-06 | Sprint 4 | ⏳ Planned |
| PUB-01 | Public Registration API (MKS-040-001). | High | 2d | ADM-01 | Sprint 3 | ✅ Done |
| ADM-07 | Announcement Management (CRUD). | Medium | 1d | ADM-02 | Sprint 2 | ⏳ Planned |
| ADM-08 | Document & Media Management (CRUD). | High | 2d | ADM-02, FND-06 | Sprint 2 | ⏳ Planned |

## 3. Epic: Public Portal (PUB)
| Task ID | Description | Priority | Effort | Dependencies | Sprint | Status |
|---|---|---|---|---|---|---|
| PUB-01 | Landing Page (Banner, Theme, Logo). | High | 2d | FND-08, ADM-01 | Sprint 3 | ⏳ Planned |
| PUB-02 | Timeline Display (Event Phases). | High | 1d | PUB-01 | Sprint 3 | ⏳ Planned |
| PUB-03 | View Announcements. | Medium | 1d | ADM-07, PUB-01 | Sprint 3 | ⏳ Planned |
| PUB-04 | View & Download Public Documents. | Medium | 1d | ADM-08, PUB-01 | Sprint 3 | ⏳ Planned |
| PUB-05 | Participant Registration Form & OTP. | Critical | 3d | PUB-01 | Sprint 3 | ⏳ Planned |
| PUB-06 | Candidate Registration Form & Uploads. | High | 3d | PUB-05, FND-06 | Sprint 3 | ⏳ Planned |

## 4. Epic: E-Voting (EVT)
| Task ID | Description | Priority | Effort | Dependencies | Sprint | Status |
|---|---|---|---|---|---|---|
| EVT-01 | Voter Booth Validation & Authorization. | Critical | 2d | ADM-04, ADM-06 | Sprint 5 | ⏳ Planned |
| EVT-02 | Candidate Profile Display. | Critical | 1d | ADM-05 | Sprint 5 | ⏳ Planned |
| EVT-03 | Anonymous Vote Submission & Transaction. | Critical | 4d | EVT-01, EVT-02 | Sprint 5 | ⏳ Planned |
| EVT-04 | Voting Session & Timeout Management. | High | 2d | EVT-03 | Sprint 5 | ⏳ Planned |
| EVT-05 | Live Real-time Statistics. | Medium | 3d | EVT-03 | Sprint 5 | ⏳ Planned |
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
- ADM-02: Admin Authentication & Logout (MKS-021)

### Sprint 2: Event Configuration & Content
**Status**: ✅ Completed
- ADM-01: Musyawarah Config, Settings & Timeline (MKS-030) (✅ Done)
- FND-06: File Storage Abstraction (Local/S3) (✅ Done)
- FND-09: Database Seeders (Master Data)
- ADM-07: Announcement Management (CRUD)
- ADM-08: Document & Media Management (CRUD)

### Sprint 3: Core Operations
**Status**: 🚧 In Progress
- PUB-01: Public Registration API (MKS-040-001) (✅ Done)
- EVT-01: Voter Booth Validation & Authorization
- EVT-02: Candidate Profile Display
- EVT-03: Anonymous Vote Submission & Transaction
- EVT-04: Voting Session & Timeout Management
- EVT-05: Live Real-time Statistics

### Sprint 4: Admin Verification & Dashboard
**Status**: ⏳ Planned
- ADM-04: Participant Verification Interface
- ADM-05: Candidate Verification Interface
- ADM-03: Dashboard Analytics (Participants/Votes)

### Sprint 5: Event Day & E-Voting
**Status**: ⏳ Planned
- ADM-06: Attendance Check-in API (QR/Manual)
- EVT-01: Voter Booth Validation & Authorization
- EVT-02: Candidate Profile Display
- EVT-03: Anonymous Vote Submission & Transaction
- EVT-04: Voting Session & Timeout Management
- EVT-05: Live Real-time Statistics

### Sprint 6: Hardening, System & Handover
**Status**: ⏳ Planned
- EVT-06: Final Result Publication & Freeze
- EVT-07: Audit Reports (PDF/Excel) Export
- SYS-01: Notifications Engine (Email/Telegram)
- SYS-02: Admin Audit Log (Who, What, When)
- SYS-03: Global System Settings
- SYS-04: Infrastructure Health Check API
- SYS-05: Prometheus/Grafana Monitoring
- SYS-06: Automated DB Backup to S3 via CRON

# MUSKOM Product Backlog

This document serves as the single source of truth for the MUSKOM (Musyawarah KOMITKABE) project development.

## Status Legend
- ✅ Done
- 🚧 In Progress
- ⏳ Planned
- ❌ Blocked

---

## 1. Epic: Foundation

| ID | Feature | Description | Priority | Status | Dependency |
|---|---|---|---|---|---|
| FND-01 | Repository | Setup Git repository, mono-repo structure, and CI/CD basics. | Critical | ✅ Done | None |
| FND-02 | PostgreSQL | Create database schema and migration files. | Critical | ✅ Done | FND-01 |
| FND-03 | Redis | Setup Redis for caching and session management. | Critical | ✅ Done | FND-01 |
| FND-04 | Docker | Configure docker-compose and multi-stage Dockerfiles. | Critical | ✅ Done | FND-02, FND-03 |
| FND-05 | Engineering Standards | Document API, DB, Go, and frontend standards. | Critical | ✅ Done | None |
| FND-06 | Documentation | Setup architecture and product documentation. | Critical | ✅ Done | None |
| FND-07 | Backend Bootstrap | Initialize Go Fiber API, DB connections, graceful shutdown. | Critical | ✅ Done | FND-04, FND-05 |
| FND-08 | Frontend Bootstrap | Initialize Next.js / Vite web application foundation. | Critical | ⏳ Planned | FND-05 |

---

## 2. Epic: Admin Portal

| ID | Feature | Description | Priority | Status | Dependency |
|---|---|---|---|---|---|
| ADM-01 | Musyawarah Configuration | Singleton API to manage active event settings, phases, and Timeline Management (MKS-030-002). | Critical | ✅ Done | FND-07 |
| ADM-02 | Authentication | Admin login, JWT generation, Middleware (MKS-021-002), Refresh Token (MKS-021-003), and Logout (MKS-021-004). | Critical | ✅ Done | FND-07 |
| ADM-03 | Dashboard | Overview of participants, candidates, and voting metrics. | High | ⏳ Planned | ADM-02, ADM-01 |
| ADM-04 | Participant Verification | Admin interface to verify registered users (approve/reject). | High | ⏳ Planned | ADM-02, PUB-05 |
| ADM-05 | Candidate Verification | Admin interface to verify candidates. | High | ⏳ Planned | ADM-02, PUB-06 |
| ADM-06 | Attendance Check-in | API to scan/mark participants as attended on event day. | High | ⏳ Planned | ADM-04 |
| ADM-07 | Announcement Management | CRUD for public announcements. | Medium | ⏳ Planned | ADM-02 |
| ADM-08 | Document Management | Upload and manage public documents (rules, guides). | Medium | ⏳ Planned | ADM-02 |

---

## 3. Epic: Public Portal

| ID | Feature | Description | Priority | Status | Dependency |
|---|---|---|---|---|---|
| PUB-01 | Landing Page | Display active Musyawarah banner, theme, and logo. | High | ⏳ Planned | FND-08, ADM-01 |
| PUB-02 | Timeline | Display event phases and start/end dates. | High | ⏳ Planned | PUB-01 |
| PUB-03 | Announcements | View broadcasted announcements. | Medium | ⏳ Planned | ADM-07 |
| PUB-04 | Documents | Download available rules and guides. | Medium | ⏳ Planned | ADM-08 |
| PUB-05 | Participant Registration | Form for users to register as voters. | Critical | ⏳ Planned | PUB-01 |
| PUB-06 | Candidate Registration | Form for users to register as election candidates. | High | ⏳ Planned | PUB-05 |

---

## 4. Epic: E-Voting

| ID | Feature | Description | Priority | Status | Dependency |
|---|---|---|---|---|---|
| EVT-01 | Voter Validation | Secure mechanism to authenticate voters entering the booth. | Critical | ⏳ Planned | ADM-04, ADM-06 |
| EVT-02 | Candidate Selection | Display verified candidates and their profiles. | Critical | ⏳ Planned | ADM-05 |
| EVT-03 | Vote Submission | Secure, anonymous, transaction-safe vote casting. | Critical | ⏳ Planned | EVT-01, EVT-02 |
| EVT-04 | Voting Session | Manage user voting timeouts and active tokens. | High | ⏳ Planned | EVT-03 |
| EVT-05 | Live Statistics | Real-time websocket or polling for current vote counts. | Medium | ⏳ Planned | EVT-03 |
| EVT-06 | Final Result | Freeze results and publish if `publish_result` is true. | High | ⏳ Planned | EVT-03, ADM-01 |
| EVT-07 | Reports | Export voting results and audit logs as PDF/Excel. | Low | ⏳ Planned | EVT-06 |

---

## 5. Epic: System

| ID | Feature | Description | Priority | Status | Dependency |
|---|---|---|---|---|---|
| SYS-01 | Notification | Email/Telegram integration for OTPs and status updates. | High | ⏳ Planned | FND-07 |
| SYS-02 | Audit Log | System-wide logging of all admin actions (who, what, when). | High | ⏳ Planned | ADM-02 |
| SYS-03 | Settings | Manage global app configurations not tied to Musyawarah. | Medium | ⏳ Planned | ADM-02 |
| SYS-04 | Health Check | Advanced endpoint verifying DB, Redis, and disk status. | Medium | ⏳ Planned | FND-07 |
| SYS-05 | Monitoring | Prometheus/Grafana integration for performance tracking. | Low | ⏳ Planned | SYS-04 |
| SYS-06 | Backup | Automated CRON scripts to dump database and upload to S3. | High | ⏳ Planned | FND-02 |

---

## Milestone Roadmap

### Milestone 1: Foundation & Architecture (Current)
- Establish mono-repo, CI/CD, database schemas, Docker.
- Implement API Core, Musyawarah Configuration.
- Establish Engineering Standards.
- **Target**: Ensure a robust, highly-available backend foundation.

### Milestone 2: Registration & Admin Tools
- Complete Admin Authentication & RBAC.
- Implement Public Portal (Landing Page, Timeline).
- Implement Participant & Candidate Registration flows.
- Implement Admin Verification interfaces.
- **Target**: Allow users to register and admins to approve them.

### Milestone 3: Event Day & Check-In
- Build QR/Manual Attendance Check-in systems.
- Build Dashboard analytics.
- **Target**: System is ready to handle physical event check-ins.

### Milestone 4: Secure E-Voting
- Develop the core E-Voting engine (Submission, Validation).
- Implement Live Statistics and Final Result publication.
- **Target**: Conduct a secure, fault-tolerant election.

### Milestone 5: Hardening & Handover
- Implement Audit Logs, Automated Backups, and Notifications.
- Final security penetration testing.
- Export capabilities (Reports).
- **Target**: Production-ready deployment.

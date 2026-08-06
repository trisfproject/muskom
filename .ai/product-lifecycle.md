---
Title: Product Lifecycle
Purpose: Roadmaps, backlogs, milestones, and historical release archives.
Owner: Product Owner
Last Updated: 2026-08-01
Related Documents: .ai/README.md, .ai/project-state.md
---


# BACKLOG

- Candidate Profile Upload Forms.
- Database Seeders for testing.
- Admin Review Queue for participants.
- Refactor real-time polling to SSE.

*See `.ai/project-state.md` for the active backlog with priority and status.*


# Project History

## Release Candidate 2 (RC2)
**Status:** STABLE (Completed)
**Phase:** Maintenance & Consolidation

### Completed Domains
- **Core Architecture:** Solidified
- **Backend Domains:** Platform interfaces defined (Attendance, Voting, Notification)
- **Identity Domain:** Centralized RBAC matrix and middleware implemented
- **Audit Domain:** Built and integrated as a reusable centralized log
- **Workflow Domain:** Centralized State Machine engine built
- **Integration Platform:** EventBus and Automation Rules Engine deployed
- **Frontend Realtime:** PollingProvider implemented for LiveProvider contract
- **Voting Domain:** Complete domain, session logic, and UIs deployed
- **Reporting Domain:** Official result calculations and abstract export interface deployed
- **Notification Domain:** Provider abstraction and queue worker deployed
- **Dashboard Domain:** Operations center and backend-for-frontend aggregator deployed

### Sprint Achievements
- RC2-009: Notification Domain
- RC2-010: Dashboard & Operations Center
- RC2-RC: Release Candidate & Production Stabilization
- RC2-MAINTENANCE: Repository Cleanup & Deployment Consolidation
- RC2-001B: Audit & Perbaikan Arsitektur Data Flow Landing Page
- RC2-001D: Self Review, Code Review, and Quality Gate Validation

### Landing Page UX Adjustments (Historical)
- Decoupled Landing Page from multiple event assumptions (Single Musyawarah Architecture).
- Established Landing Page State Flow (Hero, Timeline, Candidates, Announcements permanent).

### Docker Stabilization
- Repository Cleanup & Port Verification.
- Database Connection Pooling enabled.
- Redis caching optimizations.

---
*Note: This document serves strictly as a historical archive. Current live project state resides in `.ai/project-state.md`.*


# MILESTONES

1. **RC1 (Completed)**: Core domain structures, Nginx/Docker orchestration.
2. **RC2 (Completed)**: Stabilization, Landing Page rendering strategy, Database optimizations.
3. **Increment 1 — Public Landing (IN PROGRESS)**: CMS-ready public portal, React Server Components, product-aligned sections.
4. **Increment 2 — Website CMS (NEXT)**: Admin-driven content management for the public landing.
5. **Increment 3 — Participant Registration**: Full registration workflow.
6. **Increment 4 — Candidate Registration**: Candidate workflow (blocked on Increment 3).
7. **V1.0 (Target)**: Full E2E Governance Portal live for production.


# RELEASE PLAN

- **Environment Strategy**: 
  - Local (`muskom.local`) via Docker Compose.
  - Staging (`staging.muskom.com`) matching production topology.
  - Production (`muskom.com`) with strict secrets management and automated migrations.
- **Rollout**: 
  - Zero-downtime updates favored but maintenance windows allowed during early RCs.
  - All migrations must be non-destructive where possible.


# ROADMAP

## Active
- Complete Increment 1: Public Landing (BUILD tasks + QA + Release)
- Complete Increment 2: Website CMS

## Near-Term
- Build Participant and Candidate Registration workflows (Increments 3 & 4).
- Implement robust admin verification processes.

## Mid-Term
- Deploy secure Voting logic and access controls.
- Implement real-time Attendance tracking modules.

## Long-Term
- Implement WebSocket/SSE for instantaneous live reporting.
- Advanced export modules for official audit compliance.

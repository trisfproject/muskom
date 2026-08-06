---
Title: Architecture
Purpose: Consolidated rules for architecture
Owner: Engineering Team
Last Updated: 2026-08-01
Related Documents: .ai/README.md
---


# API ARCHITECTURE

- **RESTful standard**: Clean, resource-oriented URIs (`/api/v1/...`).
- **Public API**: Designed to always return HTTP 200 with structured empty states for the frontend.
- **Internal/Admin API**: Secured with Bearer Token, validates against centralized RBAC matrix.
- **Response Wrapping**: Uses `SendSuccess` and `SendError` generic platform response formatters.


# BACKEND ARCHITECTURE

- **Language**: Go (Golang 1.22).
- **Framework**: Fiber v3 for ultra-fast routing.
- **Architecture**: Strict Clean Architecture (Entity -> Repository -> Service -> Handler).
- **Middleware**: Custom JWT middleware for RBAC.
- **Integrations**: Redis for caching and pub/sub, PostgreSQL for persistence.


# DATABASE ARCHITECTURE

- **Engine**: PostgreSQL 15.
- **Driver**: `pgx/v5` with connection pooling enabled.
- **Migrations**: Automated on boot via Golang migrations runner.
- **Core Entities**: Phases, Participants, Candidates, Votes, Announcements. All strictly relationally constrained.


# DEPLOYMENT ARCHITECTURE

- **Orchestration**: Docker Compose.
- **Gateway**: Nginx reverse proxy routing traffic to `frontend:3000` and `api:8080`.
- **Containers**:
  - `muskom-db` (Postgres)
  - `muskom-redis` (Redis)
  - `muskom-api` (Golang Alpine Multi-stage)
  - `muskom-frontend` (Node 20 Alpine Standalone)
  - `muskom-nginx` (Nginx Alpine)
- **Restart Policy**: `unless-stopped` across the board for max resilience.


# FRONTEND ARCHITECTURE

- **Framework**: Next.js (App Router).
- **Styling**: Vanilla CSS (`globals.css`) for high performance and precision, avoiding heavy UI libraries where unnecessary.
- **State Management**: React Query for API data, utilizing synchronous layout wrappers for instantaneous rendering.
- **Components**: Server vs Client boundaries strictly defined. Interactive forms and real-time syncing must use `'use client'`.
- **Deployment**: Standalone build inside Docker container.


# MODULE OWNERSHIP

- **Timeline**: The Website Timeline (`website_timeline_phases`) is the ONE AND ONLY source of truth for all scheduling.
- **Phase Resolver**: The shared Phase Resolver is the sole owner of unified phase state calculation for the entire platform.
- **Consumers**: Dashboard, Participant Registration, Voting, and all other modules are strictly consumers of the Phase Resolver. They must not calculate lifecycles independently.
- **Candidate Module**: Admin-managed Candidate workflow only. Candidate registration from the public website does not exist. Candidates are managed manually by administrators.
- **Single Platform**: MUSKOM is a single musyawarah platform. There are no multi-event concepts or 'active event' toggles.


# REDIS ARCHITECTURE

- **Engine**: Redis 7 Alpine.
- **Roles**:
  1. Caching layer for Public Home endpoints (Cache First).
  2. Rate limiting and session stores (Voting Domain).
  3. Pub/Sub queue engine for Notifications and EventBus.

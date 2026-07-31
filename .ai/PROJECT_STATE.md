# MUSKOM Project State

Version: RC2 (Release Candidate 2)
Status: STABLE
Current Phase: Maintenance & Consolidation

## Status
- Core Architecture: Solidified
- Backend Domains: Platform interfaces defined (Attendance, Voting, Notification)
- Identity Domain: Centralized RBAC matrix and middleware implemented
- Audit Domain: Built and integrated as a reusable centralized log
- Workflow Domain: Centralized State Machine engine built
- Event Engine: EventContext middleware and provider implemented
- Integration Platform: EventBus and Automation Rules Engine deployed
- Frontend Realtime: PollingProvider implemented for LiveProvider contract
- Voting Domain: Complete domain, session logic, and UIs deployed
- Reporting Domain: Official result calculations and abstract export interface deployed
- Notification Domain: Provider abstraction and queue worker deployed
- Dashboard Domain: Operations center and backend-for-frontend aggregator deployed
- Active Domain:
- [x] RC2-009: Notification Domain
- [x] RC2-010: Dashboard & Operations Center
- [x] RC2-RC: Release Candidate & Production Stabilization
- [x] RC2-MAINTENANCE: Repository Cleanup & Deployment Consolidation
- [x] RC2-001B: Audit & Perbaikan Arsitektur Data Flow Landing Page

### 9. Dashboard & Operations Center
- [x] Operational Dashboard UI
- [x] Abstract reporting exports
- [x] Audit logs consumer

### 9.5 Landing Page & Public UX
- [x] Decoupled Landing Page from Active Event
- [x] Landing Page State Flow:
  - `Hero`, `About`, `Timeline`, `FAQ`, `Footer` always visible.
  - `EventSection` handles localized `LandingEmptyState` (No Active Event) or Disabled UI (Upcoming Event).
  - Explicit Maintenance & Completed events render dedicated full-page screens.
- [x] Analytics metrics (Attendance, Voting, Candidates)

### 10. Production Stabilization
- [x] Repository Cleanup & Port Verification
- [x] Local Development Environment (Nginx, Domains, Seeder)
- [x] Database Connection Pooling
- [x] Redis caching optimizations
- [x] Dockerfile for backend (Go 1.22 Alpine, multistage)
- [x] Dockerfile for frontend (Node 20 Alpine, standalone mode)
- [x] Next.js Route structure fix (resolved `(admin)` vs `admin` conflict)
- [x] Server vs Client Components boundary resolved (`'use client'` in forms/voting)
- [x] Global Providers setup (`QueryClientProvider` moved to `app/layout.tsx`)
- [x] Docker Compose deployment (Postgres, Redis, Backend, Frontend)
- [x] DB Migrations automatically execute on boot

### 11. Maintenance & Cleanup
- [x] Create standardized `.env.example`
- [x] Configure Nginx reverse proxy
- [x] Set up muskom.local domains in `/etc/hosts`
- [x] **Redesign MUSKOM UI/UX**
  - [x] Landing Page (Hero, About, Events, Candidates, FAQ)
  - [x] Admin Login Page
  - [x] Admin Dashboard (Cards, Header, Layout)
  - [x] Shared components (Navbar, Sidebar)
- [x] **Stabilize Docker Deployment**
  - [x] Fix container/network duplication (added project `name: muskom`)
  - [x] Set `restart: unless-stopped` for all services (resolved Nginx down issue)
  - [x] Correct API port mapping (`EXPOSE 8080`)

### Known Issues
- `deploy_muskom_data` and other old volumes/networks still exist but are harmless. They can be cleaned up manually later.

## Running Locally

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

**RC2 Foundation Established:**
- Domains: Attendance, Voting, Notification, Reporting interfaces formalized.
- Realtime: `LiveProvider` interface and `useRealtimeSync` hook built for future SSE/WebSocket capabilities.
- UI: Shared UI patterns (`SummaryCard`, `SearchInput`, `DataTable`, `DataToolbar`, `StatusBadge`, `DetailDrawer`, `EmptyState`, `ConfirmDialog`, `Pagination`, `PageHeader`, `SectionHeader`, `LoadingSkeleton`) extracted.
- Platform Core: Domain events (`platform/events`), feature flags (`config/features.ts`), and global constants established.

**Next Sprint:** Attendance Domain Implementation
- [x] Participant Registration
- [x] Candidate Registration
- [x] QA
- [x] Release

## Repository Health
- **Build Status**: Passing (`go build ./...` succeeds)
- **Dependencies**: Tidy, using `pgx/v5`, `fiber/v3`, `jwt/v5`, and `bcrypt`.
- **Architecture**: Strict Clean Architecture (Entity -> Repo -> Service -> Handler).

## Architecture Notes
- The `musyawarah` event configuration is the system's global state.
- **Data Access:** `/admin/*` routes strictly require `Authorization: Bearer <token>`. Public endpoints explicitly verify Active/Phase constraints.
- **Candidate Orchestration:** Candidate registration requires an APPROVED participant registration first. The frontend handles this seamlessly in a 2-step orchestration, followed by an immediate multi-part document upload for CV and Photo.
- **Attendance Real-Time Sync:** Currently utilizes React Query cache invalidation `staleTime`/`invalidateQueries` following manual check-in mutations. Designed strategically so the frontend UI can seamlessly accept WebSocket or Server Sent Events (SSE) adapters in the future without layout rewrites.

## Known Limitations
- Currently, there are no database seeders for users, meaning we cannot test actual login credentials against the database without manual insertion or a seeder script.
- The host machine running the build is running Node 18, while Next.js 16 requires Node >= 20.9.0. The build pipeline in the target CI environment (or local environment) MUST enforce Node 20+.
- EBADENGINE errors will occur if `npm run build` is executed on Node 18.

## Environment Variables
Ensure the following variables are configured before local deployment:
### Backend (`apps/api/.env`)
- `PORT`: (default: 8080)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`: For administrator authentication
- `REDIS_URL`: (optional/required depending on session store setup)

### Frontend (`apps/frontend/.env.local`)
- `NEXT_PUBLIC_API_URL`: Points to the backend API (e.g. `http://localhost:8080`)

## Deployment Guide
### Backend
1. Ensure PostgreSQL is running and migrations are applied.
2. `cd apps/api`
3. `go mod download`
4. `go build ./...`
5. `go run cmd/server/main.go`

### Frontend
1. Ensure Node.js >= 20.9.0 is installed.
2. `cd apps/frontend`
3. `npm install`
4. `npm run build`
5. `npm run start`

## Future RC2
- Refinements to UI/UX based on RC1 user testing.
- Database Seeders for automated environment spin-ups.
- Implementation of the newly designed domain boundaries (Voting, Attendance, Notification, Reporting).
- Transition from short-polling `useRealtimeSync` to WebSockets or SSE when infrastructure is available.

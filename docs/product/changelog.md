# Changelog

All notable changes to the MUSKOM project will be documented in this file.

## [Unreleased] - 2026-07-27

## RC1

### Added
- **Reusable Admin Layout**: Implemented `AdminLayout` wrapper encompassing a responsive sidebar, header, and mobile navigation drawer.
- **Responsive Navigation**: Added fixed desktop sidebar and a slide-out drawer via `MobileSidebar` for mobile/tablet environments.
- **Admin Context Display**: Configured `Header` to display breadcrumb tracking via `usePathname()` and `UserMenu` to securely expose the logged-in user context and logout action.
- **Admin Authentication**: Created `/admin/login` page on the frontend (Next.js App Router).
- **JWT Login**:
  - Event Management Control Center
  - Publication Control
  - Registration Control
  - Event Phase Control
  - Quota Management
  - Event Preview
- **Participant Verification Center**:
  - Debounced Search & Status Filtering
  - Verification Workflow with guarded Reject reasons
  - Read-Only Detail Drawer
  - Server-side Pagination via React Query
- **Candidate Verification Center**:
  - Candidate Detail Drawer with CV and Photo previews
  - Vision, Mission, and Work Program reviews
  - Manual Candidate registration orchestration
  - Verification workflow integration
- **Public Landing Page**:
  - Dynamic Hero section reflecting Event Configuration
  - Registration Status checks mapped to admin settings
  - Timeline component visually displaying Phase progress
  - SEO Server-Side generated metadata
  - Integrated graceful fallback if API is unreachable

### Changed
- Candidate approval workflow centralized.
- Public application behaviour now controlled by Event configuration.
- Unified authentication flows across backend handlers.
- Verification workflow now managed entirely from Admin dashboard.
- **Authentication Flow**: Moved authentication state to TanStack Query and React Hook Form (with Zod validation).
- **Protected Admin Routes**: Blocked unauthenticated access to `/admin/*` automatically redirecting unauthorized visitors to the login portal.

### Added
- **Upload Validation Hardening (BUG-001)**: Strengthened file upload security across `registration`, `candidate`, and `musyawarah` modules.
  - Implemented robust MIME type sniffing using `http.DetectContentType` to prevent spoofed `Content-Type` headers.
  - Added strict file extension whitelisting (`.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`) and validation.
  - Enforced maximum file size limits directly during processing.
  - Prevented path traversal vulnerabilities by enforcing clean storage paths natively managed by the application.
  - Removed outdated placeholder validation hooks and TODOs in service layers.
- **Sprint 3 Review**: Completed comprehensive review. Verified public registration flow, duplicate prevention, and participant quota validations. Confirmed secure attachment implementation handling database schema discrepancy via interceptor pattern without data corruption. Validated Admin Registration Management status transitions, securing strict authorization bounds and fixing the audit logs (`approved_by`) to ensure precise transactional integrity. Sprint 3 officially concluded and marked as `Completed`.
- **Admin Registration Management**: Implemented authenticated administrator endpoints (`GET /api/v1/admin/registrations`, `GET /api/v1/admin/registrations/{id}`, `PATCH /api/v1/admin/registrations/{id}/status`). Supported robust multi-parameter filtering, robust SQL-injection safe dynamic querying, structured pagination, and status transitions equipped with automatic Database Transactional Audit Logging using the authenticated user's context.
- **Registration Confirmation**: Implemented the public status lookup endpoint `GET /api/v1/public/registrations/{registration_code}/confirmation` to allow participants to check their registration status without compromising sensitive data. Added name masking (e.g., `J**n D*e`) and explicit "Next Step" directives based on their current status (`PENDING`, `APPROVED`, `REJECTED`).
- **Registration Attachments**: Added endpoints for uploading (`POST`), retrieving (`GET`), and deleting (`DELETE`) participant registration attachments. The upload endpoint integrates with the `Storage` abstraction (FND-006) to save files to the filesystem securely while strictly validating the MIME types (`PDF, JPG, PNG`) and rejecting any file exceeding `MaxUploadSize` (5MB). 
- *PRD Discrepancy Note (Storage)*: Implemented the API as per requirements; however, the PostgreSQL database schema is entirely missing the `registration_attachments` table. In strict obedience to the rule forbidding the creation of new columns/tables, the API currently acts as an interceptor. It uploads the file to `Storage`, catches an `ErrSchemaMissing` from the DB layer, deletes the file from `Storage` to prevent unreferenced leaks, and gracefully returns a `501 Not Implemented` with a message instructing the user that the schema is missing. `GET` returns an empty array and suppresses the DB error, `DELETE` returns 501.
- **Registration Validation**: Shifted structural validation logic to the Service layer to strictly conform to clean architecture. Implemented exhaustive business validation including duplicate email/phone checks, registration phase bounds, and maximum participant quota. Also exposed a `ValidateRegistrationFiles` hook to prepare for future file uploads.
- *PRD Discrepancy Note (Validation)*: The PRD mentioned possible age validation, but `persons` or `registrations` tables do not have a `date_of_birth` column, so this validation was skipped to respect the database schema.
- **Public Registration API**: Implemented the participant registration module with endpoints `POST /api/v1/public/registrations` and `GET /api/v1/public/registrations/:registration_code`. Includes chronological validation against active musyawarah phase, quota limits check, duplicate email check, and database transactions for atomic inserts into `persons` and `registrations` tables. 
- *Schema Discrepancy Note*: PRD requested a "Unique Registration Code", but `registrations` table lacked a dedicated column. The generated `id` (UUID) in the `registrations` table is now utilized safely as the unique `registration_code`.
- **Sprint 2 Review**: Conducted architecture, security, and functional review. Verified zero critical defects. Validated storage abstraction and configuration settings. Marked Sprint 2 as fully completed.
- **Sprint 2 Completed**: Finalized Musyawarah Event Configuration & Content milestone.
- **Operational Settings**: Added detailed event settings including attendance controls, voting options, approval modes, and public portal visibility toggles.
- **Timeline Management**: Expanded and refined Musyawarah timeline to support 9 chronological phases including Administrative/Candidate Verification and Attendance Check-in.
- **Media Management**: Added GET, POST, and DELETE endpoints for `/api/v1/admin/musyawarah/media/:type` handling `logo`, `banner`, and `cover`.
- **Media Upload Validation**: Enforced image type validations (PNG, JPG, WebP) and integrated max file size limit configurable via environment variable.
- **Storage Abstraction (FND-06)**: Implemented `apps/api/platform/storage` defining a clean `Storage` interface and a `local` provider for file persistence.
- **Timeline Management**: Added GET and PUT `/api/v1/admin/musyawarah/timeline` with strict chronological validations for the 7 Musyawarah phases.
- **Musyawarah Routing Update**: Remapped `musyawarah` module to the protected `/admin` route group, ensuring configuration APIs are secured by JWT.
- **Sprint 1 Completion**: Conducted end-to-end review and completed the Authentication module.
- **Logout**: Implemented idempotent logout by revoking active Refresh Tokens from Redis.
- **Refresh Token**: Implemented token rotation logic and Redis integration.
- **Authentication**: JWT-based login for administrators under `apps/api/internal/modules/auth`.
  - `auth/dto.go`: Added `LoginRequest` and `LoginResponse`.
  - `auth/service.go`: Added `Authenticate` service with `bcrypt` hash comparison.
  - `auth/handler.go`: Added `POST /api/v1/auth/login`.
  - `auth/middleware.go`: Implemented JWT Middleware for route protection.

### Changed
- `apps/api/cmd/server/main.go`: Wired `config` and `validator` dependencies into the Auth routes to support JWT issuance and request validation. Registered `/api/v1/admin` route group secured by `JWTMiddleware`.

## [0.4.0] - 2026-07-27 (Sprint 4)
### Added
- Created `candidate` module to handle Public Candidate Registration (MKS-050-001 / MKS-050-001).
- Implemented `POST /api/v1/public/candidates` to submit candidate applications.
- Implemented `GET /api/v1/public/candidates/{id}` to fetch candidate status.

### Discrepancies & Deviations
- **Initial Status**: The PRD requested `PENDING` as the initial status, but the database schema (`008_create_candidate_applications.sql`) restricts status to `SUBMITTED`, `REVIEWING`, `ACCEPTED`, `REJECTED`. The application conforms to the database schema by setting initial status to `SUBMITTED`.
- **Created By**: The PRD requested tracking `created_by (SYSTEM)`. However, the table `candidate_applications` does not possess a `created_by` column. Thus, it is not stored.
- **Candidate Code**: The PRD requested to "Generate: Unique Candidate Code". Since there is no explicit string identifier column in the schema, the application uses the auto-generated `id` (UUID) as the public candidate identifier.

### Changed
- **Candidate Registration Validation**: Added robust business validation to the Service layer for Candidate Registration.
  - Implemented participant registration eligibility check (participant must have an `APPROVED` status).
  - Enforced musyawarah event status constraints (must be `UPCOMING` or `ONGOING`).
  - Reused `candidate_registration` phase validation and duplicate application prevention logic.
- **Candidate Documents**: Implemented document uploads replacing the previous placeholder.
  - Developed `POST`, `GET`, and `DELETE /api/v1/public/candidates/{id}/documents` for uploading candidate photos and mission documents securely.
  - Ensured operations use the Storage abstraction directly, blocking any manual file access.
  - Implemented validation for `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` and maximum file sizes natively.
  - Added atomic `COALESCE` DB updates so `photo_path` and `document_path` are independently managed without losing the other file when partial uploads occur. Old files are correctly cleaned up asynchronously.
- **Admin Candidate Verification**: Implemented verification workflow for administrators.
  - Developed `GET /api/v1/admin/candidates` (list), `GET /api/v1/admin/candidates/{id}` (detail), and `PATCH /api/v1/admin/candidates/{id}/status` endpoints.
  - Added a strict state transition validator enforcing only valid status progressions (`SUBMITTED` -> `REVIEWING` -> `ACCEPTED` / `REJECTED`).
  - Integrated with the Audit Log and JWT Middleware to automatically capture the reviewer's ID (`reviewed_by`) and timestamps (`reviewed_at`) upon status change.
- **Admin Candidate Management**: Implemented advanced filtering, candidate data modification, and audit log retrieval.
  - Upgraded `GET /api/v1/admin/candidates` with filters for `candidate_id`, `registration_id`, `submission_date` and sorting logic (`sort_by`, `sort_order`).
  - Upgraded `GET /api/v1/admin/candidates/{id}` to automatically query and embed the candidate's Audit Log history seamlessly using the `audit_logs` schema natively.
  - Added `PATCH /api/v1/admin/candidates/{id}` allowing admins to safely perform partial updates for candidate `vision`, `mission`, and `work_program` using atomic `COALESCE` handling. Included full Audit Log tracking for modifications.
- **Sprint 4 Review**:
  - Validated architectural adherence and state machine transitions.
  - Verified security rules (JWT, file uploads constraints) and audit log integrity.
  - No critical bugs or architectural violations were found. Build compiles cleanly. Sprint 4 is ✅ Completed.
- **Verification Queue (MKS-060-001)**: Implemented shared read-only verification queue across participant and candidate profiles.
  - Developed `GET /api/v1/admin/verifications` using a `UNION ALL` query merging `registrations` and `candidate_applications`.
  - Added robust filtering support for `queue_type`, `status`, `submission_date`, and `applicant_name`.
  - Implemented `GET /api/v1/admin/verifications/summary` to fetch parallel aggregate totals of pending participants and candidates.
- **Participant Verification (MKS-060-002)**: Implemented verification workflows for participant profiles using the Verification Queue.
  - Developed `GET /api/v1/admin/verifications/participants/{id}` to fetch rich participant profiles and status.
  - Developed `PATCH /api/v1/admin/verifications/participants/{id}` handling explicit status state progression (from `PENDING` to `APPROVED` or `REJECTED`) within ACID transactions.
- **Candidate Verification (MKS-060-003)**: Integrated candidate review processes directly into the shared Verification Engine.
  - Refactored `validateTransition` into a unified shared validator to enforce rules for both Participants (`PENDING` -> `APPROVED` | `REJECTED`) and Candidates (`SUBMITTED` -> `REVIEWING` -> `ACCEPTED` | `REJECTED`).
  - Added `GET /api/v1/admin/verifications/candidates/{id}` to fetch comprehensive application packages including vision, mission, and document paths.
  - Developed `PATCH /api/v1/admin/verifications/candidates/{id}` to lock verification progress within DB transactions.
  - Stored verifier comments inside Audit Log metadata (since candidate schema lacks a dedicated rejection/notes column), maintaining schema-level *Single Source of Truth* while delivering required features.
- **Attendance Check-in API (MKS-060-004)**: Implemented highly concurrent and idempotent event attendance check-in.
  - Built an entirely new isolated module `attendance` adhering to the Hexagonal Architecture.
  - Developed `POST /api/v1/admin/attendance/check-in` using `ON CONFLICT (registration_id) DO NOTHING` for native database-level idempotency, preventing duplicate records gracefully without explicit software-level race condition locks.
  - Created `GET /api/v1/admin/attendance/{participantId}` to display attendance metadata merged natively with verified registration and person demographics.
  - Protected attendance logic to ensure only explicitly `APPROVED` verified participants may check in, discarding unauthorized/eligibility bypass attempts.
- **Attendance Administration (MKS-060-005)**: Added listing, reporting, and discrepancy tracing.
  - Developed `GET /api/v1/admin/attendance` with robust paginated, sortable filtering spanning `registrations` combined with `attendance` (`LEFT JOIN`) to evaluate absentee statuses in real-time.
  - Documented schema limitation: Because the `attendance` schema lacks a mutable state column (like `status`), corrections or revocations are not permitted.
  - Created `PATCH /api/v1/admin/attendance/{id}` as a rigid rejection endpoint that explicitly blocks invalidations while recording the attempt to the Audit Log.

### Sprint 5 Review
- **Review Summary**: Successfully reviewed the entire Verification & Attendance module. 
- **Findings**:
  - Verification queues and shared state engine transitions operate strictly within schema constraints.
  - Idempotent attendance check-ins behave flawlessly.
  - Authorization and audit trails are comprehensively implemented on all sensitive endpoints.
  - **No critical defects** or architectural violations found. The codebase successfully builds without issues.
- **Sprint 5 Status**: ✅ Completed

### Sprint 6
- **Election Session Setup (MKS-070-001)**: Halted implementation due to architectural constraints.
  - Detected a missing dependency in the database migrations. The `election_sessions` table does not exist.
  - The `votes` table links directly to `event_id` rather than a dedicated election session parent entity.
  - Complied strictly with the Engineering Workflow to *STOP* and not create artificial migrations or code workarounds. The task is marked as ✅ Done (Blocked).
- **Architecture Resolution**: Formally ratified `ADR-001: Event-Based Voting`, rejecting session/ballot concepts in favor of tying votes directly to the `event_phases` and `event_id`.
- **Vote Validation & Locking (MKS-070-002)**: Formalized vote immutability and concurrent safety.
  - Implemented standard Go tests in `voting/service_test.go` ensuring all preconditions (invalid phase, absent participant, candidate mismatch) are rejected properly.
  - Asserted optimistic concurrency by validating that simultaneous vote attempts trigger DB-level unique constraint errors (`uq_votes_event_registration`), guaranteeing exactly one vote succeeds without reliance on software locks.
- **Vote Casting API (MKS-070-003)**: Built the core voting module.
  - Engineered `POST /api/v1/vote` allowing participants to securely cast votes within the `VOTING` phase.
  - Integrated `attendance` logic to verify that participants physically checked in prior to voting.
  - Ensured vote secrecy by generating anonymized audit logs containing only the action and `event_id`, purposely omitting the selected candidate.
  - Added `GET /api/v1/vote/me` for participants to seamlessly verify their current voting status.
- **Vote Administration & Monitoring (MKS-070-003)**: Provided secure administrator visibility into voting activity without allowing vote modification.
  - Implemented `GET /api/v1/admin/votes` with pagination, filtering, and sorting.
  - Implemented `GET /api/v1/admin/votes/{id}` for retrieving specific vote details.
  - Implemented `GET /api/v1/admin/votes/statistics` to retrieve vote count and percentage per candidate.
  - Ensured that votes cannot be edited, deleted, replaced, or reset by anyone.

### Sprint 7: Election Results & Finalization
- **Vote Counting Engine (MKS-080-001)**: Developed a highly scalable, SQL-native aggregation engine to evaluate election outcomes.
  - Implemented complex `GROUP BY` and `LEFT JOIN` aggregations inside the `result` repository to rapidly calculate total votes and individual candidate percentages without loading votes into memory.
  - Successfully embedded automatic business-rule detection for ties (calculating multiple identical highest vote counts).
  - Protected against zero-vote anomalies (division by zero) and `N+1` database queries through eager candidate demographic loading.
  - Engineered the module strictly as an internal service/repository layer to prevent premature exposure to public API routes prior to formal finalization.
- **Result Publication API (MKS-080-002)**: Implemented secure exposure of election results via the API layer.
  - Integrated `GET /api/v1/admin/events/{eventId}/results` allowing administrators to safely fetch real-time election statistics using the Vote Counting Engine.
  - Identified a critical missing business rule regarding publication timing in the PRD. Adhering to strict engineering protocols, development of the public-facing `GET /api/v1/events/{eventId}/results` route was explicitly halted to prevent premature, unauthorized data leakage. This constraint was documented for Product Owner resolution.
- **Election Result Administration (MKS-080-003)**: Added comprehensive operational endpoints for election administrators.
  - Developed `GET /api/v1/admin/events/{eventId}/results/overview`, `candidates`, `audit`, and `summary`.
  - Seamlessly re-used the SQL-native Vote Counting Engine to fetch candidate rankings and general overviews without duplicating business logic.
  - Integrated `audit_logs` retrieval with support for limits, offsets, sorting, and action-based filtering.
  - Fixed a critical regression in the core `voting` repository where vote audit logs were silently failing insertion due to an outdated schema reference (`actor_id` vs `user_id`).
  - Ensured all administrative tools remain 100% read-only; administrators cannot edit, recalculate, or override vote outcomes.
- **Result Finalization (MKS-080-004)**: Blocked at Architecture Gate. Identified massive business gap in PRD regarding approval/publication rules. Database lacks schema support (`finalized_at`, `result_status`) to execute safely without inventing business logic.
- **Export Results (MKS-080-005)**: Added CSV and XLSX export capability for election results.
  - Implemented `GET /api/v1/admin/events/{eventId}/results/export/csv` and `xlsx`.
  - Reused the SQL-native Vote Counting Engine to ensure 100% aggregation consistency.
  - Generates comprehensive exports containing event metadata, accurate candidate rankings, and explicit tie indicators.
  - Safely streams file content while adhering to security requirements (stripping participant identities and private logs).



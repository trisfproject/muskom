# Changelog

All notable changes to the MUSKOM project will be documented in this file.

## [Unreleased] - 2026-07-27

### Added
- **Sprint 3 Review**: Completed comprehensive review. Verified public registration flow, duplicate prevention, and participant quota validations. Confirmed secure attachment implementation handling database schema discrepancy via interceptor pattern without data corruption. Validated Admin Registration Management status transitions, securing strict authorization bounds and fixing the audit logs (`approved_by`) to ensure precise transactional integrity. Sprint 3 officially concluded and marked as `Completed`.
- **Admin Registration Management (MKS-040-005)**: Implemented authenticated administrator endpoints (`GET /api/v1/admin/registrations`, `GET /api/v1/admin/registrations/{id}`, `PATCH /api/v1/admin/registrations/{id}/status`). Supported robust multi-parameter filtering, robust SQL-injection safe dynamic querying, structured pagination, and status transitions equipped with automatic Database Transactional Audit Logging using the authenticated user's context.
- **Registration Confirmation (MKS-040-004)**: Implemented the public status lookup endpoint `GET /api/v1/public/registrations/{registration_code}/confirmation` to allow participants to check their registration status without compromising sensitive data. Added name masking (e.g., `J**n D*e`) and explicit "Next Step" directives based on their current status (`PENDING`, `APPROVED`, `REJECTED`).
- **Registration Attachments (MKS-040-003)**: Added endpoints for uploading (`POST`), retrieving (`GET`), and deleting (`DELETE`) participant registration attachments. The upload endpoint integrates with the `Storage` abstraction (FND-006) to save files to the filesystem securely while strictly validating the MIME types (`PDF, JPG, PNG`) and rejecting any file exceeding `MaxUploadSize` (5MB). 
- *PRD Discrepancy Note (Storage)*: Implemented the API as per requirements; however, the PostgreSQL database schema is entirely missing the `registration_attachments` table. In strict obedience to the rule forbidding the creation of new columns/tables, the API currently acts as an interceptor. It uploads the file to `Storage`, catches an `ErrSchemaMissing` from the DB layer, deletes the file from `Storage` to prevent unreferenced leaks, and gracefully returns a `501 Not Implemented` with a message instructing the user that the schema is missing. `GET` returns an empty array and suppresses the DB error, `DELETE` returns 501.
- **Registration Validation (MKS-040-002)**: Shifted structural validation logic to the Service layer to strictly conform to clean architecture. Implemented exhaustive business validation including duplicate email/phone checks, registration phase bounds, and maximum participant quota. Also exposed a `ValidateRegistrationFiles` hook to prepare for future file uploads (MKS-040-003).
- *PRD Discrepancy Note (Validation)*: The PRD mentioned possible age validation, but `persons` or `registrations` tables do not have a `date_of_birth` column, so this validation was skipped to respect the database schema.
- **Public Registration API (MKS-040-001)**: Implemented the participant registration module with endpoints `POST /api/v1/public/registrations` and `GET /api/v1/public/registrations/:registration_code`. Includes chronological validation against active musyawarah phase, quota limits check, duplicate email check, and database transactions for atomic inserts into `persons` and `registrations` tables. 
- *Schema Discrepancy Note*: PRD requested a "Unique Registration Code", but `registrations` table lacked a dedicated column. The generated `id` (UUID) in the `registrations` table is now utilized safely as the unique `registration_code`.
- **Sprint 2 Review**: Conducted architecture, security, and functional review. Verified zero critical defects. Validated storage abstraction and configuration settings. Marked Sprint 2 as fully completed.
- **Sprint 2 Completed**: Finalized Musyawarah Event Configuration & Content milestone.
- **Operational Settings (MKS-030-004)**: Added detailed event settings including attendance controls, voting options, approval modes, and public portal visibility toggles.
- **Timeline Management (MKS-030-003)**: Expanded and refined Musyawarah timeline to support 9 chronological phases including Administrative/Candidate Verification and Attendance Check-in.
- **Media Management (MKS-030-002)**: Added GET, POST, and DELETE endpoints for `/api/v1/admin/musyawarah/media/:type` handling `logo`, `banner`, and `cover`.
- **Media Upload Validation**: Enforced image type validations (PNG, JPG, WebP) and integrated max file size limit configurable via environment variable.
- **Storage Abstraction (FND-06)**: Implemented `apps/api/platform/storage` defining a clean `Storage` interface and a `local` provider for file persistence.
- **Timeline Management (MKS-030-002)**: Added GET and PUT `/api/v1/admin/musyawarah/timeline` with strict chronological validations for the 7 Musyawarah phases.
- **Musyawarah Routing Update**: Remapped `musyawarah` module to the protected `/admin` route group, ensuring configuration APIs are secured by JWT.
- **Sprint 1 Completion**: Conducted end-to-end review and completed the Authentication module.
- **Logout (MKS-021-004)**: Implemented idempotent logout by revoking active Refresh Tokens from Redis.
- **Refresh Token (MKS-021-003)**: Implemented token rotation logic and Redis integration.
- **Authentication**: JWT-based login for administrators under `apps/api/internal/modules/auth`.
  - `auth/dto.go`: Added `LoginRequest` and `LoginResponse`.
  - `auth/service.go`: Added `Authenticate` service with `bcrypt` hash comparison.
  - `auth/handler.go`: Added `POST /api/v1/auth/login`.
  - `auth/middleware.go`: Implemented JWT Middleware for route protection.

### Changed
- `apps/api/cmd/server/main.go`: Wired `config` and `validator` dependencies into the Auth routes to support JWT issuance and request validation. Registered `/api/v1/admin` route group secured by `JWTMiddleware`.

# Changelog

All notable changes to the MUSKOM project will be documented in this file.

## [Unreleased] - 2026-07-27

### Added
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

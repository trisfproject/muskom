# Changelog

All notable changes to the MUSKOM project will be documented in this file.

## [Unreleased] - 2026-07-27

### Added
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

# Changelog

All notable changes to the MUSKOM project will be documented in this file.

## [Unreleased] - 2026-07-27

### Added
- **Sprint 1 Review**: Conducted end-to-end review of the Authentication module. Identified missing Refresh Token and Logout implementations to be carried over.
- **Refresh Token (MKS-021-003)**: Implemented token rotation logic and Redis integration.
- **Authentication**: JWT-based login for administrators under `apps/api/internal/modules/auth`.
  - `auth/dto.go`: Added `LoginRequest` and `LoginResponse`.
  - `auth/service.go`: Added `Authenticate` service with `bcrypt` hash comparison.
  - `auth/handler.go`: Added `POST /api/v1/auth/login`.
  - `auth/middleware.go`: Implemented JWT Middleware for route protection.

### Changed
- `apps/api/cmd/server/main.go`: Wired `config` and `validator` dependencies into the Auth routes to support JWT issuance and request validation. Registered `/api/v1/admin` route group secured by `JWTMiddleware`.

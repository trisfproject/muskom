# Changelog

All notable changes to the MUSKOM project will be documented in this file.

## [Unreleased] - 2026-07-26

### Added
- **Authentication**: JWT-based login for administrators under `apps/api/internal/modules/auth`.
  - `auth/dto.go`: Added `LoginRequest` and `LoginResponse`.
  - `auth/service.go`: Added `Authenticate` service with `bcrypt` hash comparison.
  - `auth/handler.go`: Added `POST /api/v1/auth/login`.

### Changed
- `apps/api/cmd/server/main.go`: Wired `config` and `validator` dependencies into the Auth routes to support JWT issuance and request validation.

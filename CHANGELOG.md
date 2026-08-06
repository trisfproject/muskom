# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.0-rc1] - 2026-08-06
### Added
- Timeline Synchronization (ADR-007): Single admin entry point for operational scheduling
- Automatic propagation from `website_timeline_phases` to `event_phases` and `events` columns
- Transactional consistency: CMS write + sync succeed or fail together
- Delete synchronization: removed phases nullify derived data
- Dashboard statistics aligned with `participants` table
- Dashboard resolves active event internally (no EventContext dependency)
- Candidate publication workflow: publish, unpublish, ordering, public visibility
- Participant registration with synchronized date validation
- Email verification and resend verification flows
- Bootstrap administrator creation on first deployment
- RBAC enforcement on all admin routes
- Public landing page with Hero, Timeline, Candidates, Announcements, Footer
- Redis cache-first architecture for public endpoints
- Docker Compose orchestration (5 containers)
- Nginx reverse proxy with health endpoints

### Fixed
- Public candidate queries aligned with current schema (migration 050)
- Dashboard API calls corrected (removed dead `/admin/registrations` endpoint)
- Musyawarah static routes registered before wildcard `/:id`
- React hydration mismatch resolved

### Security
- JWT authentication with refresh tokens
- RBAC permission matrix across all admin routes
- Bcrypt password hashing
- Input validation on all endpoints

## [v0.1.0] - 2026-07-26
### Added
- Project Initialization
- Repository structure
- GitHub Actions workflow for CI
- Issue and PR templates
- Contributing guidelines

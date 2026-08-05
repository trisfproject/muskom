# ADR-007: JWT & RBAC Authorization Architecture

- **Status:** Accepted
- **Date:** August 5, 2026

## Context
MUSKOM requires granular authorization for 6 distinct user personas across public, administrative, verifier, and operator workflows.

## Decision
1. Stateless JSON Web Tokens (JWT) signed with secret key for user authentication.
2. RBAC subsystem maps permissions to roles (`role_permissions` table).
3. `auth.JWTMiddleware` validates JWT tokens. `checker.RequirePermission("<permission.code>")` middleware enforces granular permission checks on all administrative Fiber routes.

## Consequences
- Fast, stateless authentication with fine-grained access control.

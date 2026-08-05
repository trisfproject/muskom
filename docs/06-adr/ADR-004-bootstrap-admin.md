# ADR-004: Automated System Bootstrapping & Default Super Admin

- **Status:** Accepted
- **Date:** August 5, 2026

## Context
Deploying MUSKOM to new production environments requires automated seeding of default roles, permissions, system configuration defaults, and an initial super administrator user.

## Decision
1. `bootstrap.Run(ctx, db, cfg, log)` executes on server startup.
2. Bootstrapping seeds core roles (`ADMIN`, `COMMITTEE`, `VERIFIER`, `OPERATOR`, `PARTICIPANT`), links permissions, inserts default CMS settings, and creates a default super admin user if no users exist.

## Consequences
- Guaranteed working super admin account on initial deployment without manual SQL seeding.

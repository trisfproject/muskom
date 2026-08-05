# ADR-001: Domain Model Single Source of Truth (SSOT) Architecture

- **Status:** Accepted
- **Date:** August 5, 2026

## Context
Initial iterations of MUSKOM contained parallel tables for similar concepts (`events` vs `musyawarah`, `registrations` vs `participants`, `timelines` vs `website_timeline_phases`). This caused state desynchronization, duplicate APIs, and broken foreign key references.

## Decision
1. `musyawarah` domain (backed by `events` table) is the sole owner of event metadata, dates, and feature flags.
2. `participant` domain (backed by `participants` table) is the sole owner of all delegate identities, verification statuses, and badge QR codes.
3. `attendance` and `voting` backend modules must reference `participants(id)` exclusively.
4. `website` CMS domain is the sole owner of public display content.

## Consequences
- Legacy module `internal/modules/registration` is deprecated and removed.
- Tables `attendance` and `votes` will have foreign keys altered to point to `participants(id)`.
- All administrative and public endpoints interact with unified SSOT services.

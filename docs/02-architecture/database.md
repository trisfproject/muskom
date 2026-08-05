# Database Architecture

## Engine & Migrations
- **Engine:** PostgreSQL 16
- **Migration Strategy:** Sequential raw SQL migrations in `database/migrations/` (000 to 053+).

## Canonical Tables (SSOT)
- `events`: Master Musyawarah event entity.
- `event_settings`: Global feature flags per Musyawarah.
- `event_phases`: Timeline phase date boundaries.
- `participants`: Delegate identity, company, QR code, status (`Pending`/`Verified`/`Rejected`).
- `candidates`: Candidate applications, biography, vision, mission, work programs.
- `candidate_documents`: PDF documents submitted by candidates.
- `attendance`: Check-in records referencing `participants(id)`.
- `voting_sessions`: Election session control state (`NOT_STARTED`/`RUNNING`/`CLOSED`).
- `votes`: Secret ballot votes referencing `participants(id)` and `candidates(id)`.
- `system_configurations`: Global CMS key-value store.
- `users`, `roles`, `permissions`, `role_permissions`: RBAC subsystem.
- `audit_logs`: Asynchronous activity audit trail.

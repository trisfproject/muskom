# MUSKOM Knowledge Base & Documentation Sitemap

Welcome to the permanent Project Knowledge Base for the **MUSKOM Platform (Musyawarah Management System)**.

This documentation serves as the single source of truth for all architectural decisions, product rules, engineering guidelines, environment configurations, quality registers, and sprint trajectory histories.

---

## Documentation Structure

### [00-assessment/](00-assessment/repository-assessment.md)
- [`repository-assessment.md`](00-assessment/repository-assessment.md) — Comprehensive technical & product assessment report.

### [01-product/](01-product/vision.md)
- [`vision.md`](01-product/vision.md) — Product vision & core pillars.
- [`goals.md`](01-product/goals.md) — RC-1 objectives & KPIs.
- [`personas.md`](01-product/personas.md) — Detailed user persona specifications.
- [`glossary.md`](01-product/glossary.md) — Domain terminology reference.
- [`business-rules.md`](01-product/business-rules.md) — Core business rule validations.
- [`workflows.md`](01-product/workflows.md) — 4 core end-to-end operational workflows.

### [02-architecture/](02-architecture/overview.md)
- [`overview.md`](02-architecture/overview.md) — High-level system architecture & topology.
- [`backend.md`](02-architecture/backend.md) — Go Fiber backend layout & modules.
- [`frontend.md`](02-architecture/frontend.md) — Next.js 16 App Router hierarchy.
- [`database.md`](02-architecture/database.md) — PostgreSQL schema & canonical SSOT tables.
- [`deployment.md`](02-architecture/deployment.md) — Docker Compose & Nginx setup.
- [`security.md`](02-architecture/security.md) — JWT, Bcrypt, RBAC & Audit Trail design.

### [03-engineering/](03-engineering/coding-standard.md)
- [`coding-standard.md`](03-engineering/coding-standard.md) — Go and TypeScript coding conventions.
- [`api-guidelines.md`](03-engineering/api-guidelines.md) — REST API endpoint standards & JSON contracts.
- [`database-guidelines.md`](03-engineering/database-guidelines.md) — DB schema conventions & migration rules.
- [`ui-guidelines.md`](03-engineering/ui-guidelines.md) — UI design system, state rules, & mobile responsiveness.
- [`docker-guidelines.md`](03-engineering/docker-guidelines.md) — Containerization & volume management.
- [`release-process.md`](03-engineering/release-process.md) — Quality gates & release validation steps.

### [04-reference/](04-reference/environment.md)
- [`environment.md`](04-reference/environment.md) — Backend & Frontend environment variables.
- [`configuration.md`](04-reference/configuration.md) — `system_configurations` JSON schema groups.
- [`feature-flags.md`](04-reference/feature-flags.md) — `event_settings` feature toggles.
- [`permissions.md`](04-reference/permissions.md) — Complete list of RBAC permissions.
- [`roles.md`](04-reference/roles.md) — Role definitions & permission mapping.

### [05-roadmap/](05-roadmap/rc1.md)
- [`rc1.md`](05-roadmap/rc1.md) — Release Candidate 1 detailed sprint roadmap.
- [`rc2.md`](05-roadmap/rc2.md) — Release Candidate 2 scope.
- [`v1.md`](05-roadmap/v1.md) — General Availability v1.0 scope.
- [`backlog.md`](05-roadmap/backlog.md) — Feature backlog.

### [06-adr/](06-adr/ADR-001-single-source-of-truth.md)
- [`ADR-001-single-source-of-truth.md`](06-adr/ADR-001-single-source-of-truth.md) — Domain SSOT Architecture.
- [`ADR-002-candidate-management.md`](06-adr/ADR-002-candidate-management.md) — Candidate Nomination & Verification.
- [`ADR-003-registration-flow.md`](06-adr/ADR-003-registration-flow.md) — Delegate Registration Pipeline.
- [`ADR-004-bootstrap-admin.md`](06-adr/ADR-004-bootstrap-admin.md) — Automated System Bootstrapping.
- [`ADR-005-navigation.md`](06-adr/ADR-005-navigation.md) — Admin Portal Sidebar Architecture.

### [07-quality/](07-quality/known-issues.md)
- [`known-issues.md`](07-quality/known-issues.md) — Known Issues Register.
- [`technical-debt.md`](07-quality/technical-debt.md) — Technical Debt Register.
- [`qa-checklist.md`](07-quality/qa-checklist.md) — End-to-End QA Integration Checklist.
- [`release-checklist.md`](07-quality/release-checklist.md) — RC-1 Release Readiness Checklist.

### [08-sprint/](08-sprint/sprint-history.md)
- [`sprint-history.md`](08-sprint/sprint-history.md) — Sprint Trajectory History.
- [`sprint-template.md`](08-sprint/sprint-template.md) — Sprint Final Report Template.

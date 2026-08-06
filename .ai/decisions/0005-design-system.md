---
Title: ADR 0005 Design System
Purpose: Documentation regarding adr 0005 design system
Owner: Engineering Team
Last Updated: 2026-08-01
Related Documents: .ai/README.md
---
# ADR 0005: Unified Design System

## Status
Accepted

## Reason
To ensure MUSKOM feels like a cohesive platform rather than a collection of independent pages (e.g., landing page vs admin dashboard), we need a centralized source of UI truth.

## Decision
All modules (Landing, Admin, Registration, Voting, etc.) MUST use the exact same Design System. No page should look like a different product. We extend existing UI components rather than building custom one-off designs.

## Consequences
Maintains high visual quality and development velocity. Requires strict adherence to the `.ai/design/constitution.md`.
